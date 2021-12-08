const {addUser, removeUser, getUserInRoom} = require('./users');
const { nanoid } = require('nanoid');
const sanitizeHtml = require('sanitize-html');
const { emojify } = require('node-emoji');
const { addMessageToHistory, getAllMessageInRoom } = require('./history');
const clean = (dirty) => sanitizeHtml(dirty, {
    allowedTags: [ 'b', 'i', 'em' , 'strong', 'a'],
    allowedAttributes: {
        'a': [ 'href' ]
    },
});

const startSocket = (io) => {

    io.on('connection', (socket) => {
                
        socket.on('join', ({name, room}, callback) => {
            const username = clean(name);
            const userroom = clean(room);
            const {user, error} = addUser({id:socket.id, name: username, room: userroom});
            if(error) return callback({error});

            callback({status: 'joined', user: user});
            const users = getUserInRoom(userroom);
            if(users.length > 1){
                socket.emit('chatHistory', {messages: getAllMessageInRoom(user.room)});
            }

            socket.emit('message', {user: 'admin', text: `${user.name}, welcome to room ${user.room}`});
            socket.broadcast.to(user.room).emit('message',  {user: 'admin', text: `${user.name}, has joined` });
            socket.join(user.room);
            io.to(userroom).emit('pInfo', { users: users });
        });

        socket.on('newMessage', ({username, room, text}, callback) => {
            const user = username;
            const userroom = room;
            const message = emojify(clean(text));
            const id =  `socky-${nanoid(7)}`;
            addMessageToHistory({user, room, text: message, id});
            io.to(userroom).emit("message", {user, text: message, id});
            callback();
        });

        socket.on('newEditMessage', ({username, room, text, id}, callback) => {
            const user = username;
            const userroom = room;
            const message = emojify(clean(text));
            
            io.to(userroom).emit("editMessage", {user, text: message, id});
            callback();
        });

        socket.on('sendDelete', ({id, room}, callback) => {
            io.to(room).emit('deleteMessage', {id});
            callback();
        })

        socket.on('disconnect', () => {
            let user = removeUser(socket.id);
            if(user){
                io.to(user.room).emit("message", {user: 'admin', text: `${user.name} has left the room`});
                io.to(user.room).emit('pInfo', {users: getUserInRoom(user.room)});
            }
        })
    });
}

module.exports = startSocket; 