const {addUser, removeUser} = require('./users');
const { nanoid } = require('nanoid');
const sanitizeHtml = require('sanitize-html');
const clean = (dirty) => sanitizeHtml(dirty, {
    allowedTags: [ 'b', 'i', 'em' , 'strong', 'a'],
    allowedAttributes: {
        'a': [ 'href' ]
    },
});

const startSocket = (io) => {

    io.on('connection', (socket) => {
        console.log('New Connection');
        
        socket.on('join', ({name, room}, callback) => {
            const username = clean(name);
            const userroom = clean(room);
            const {user, error} = addUser({id:socket.id, name: username, room: userroom});
            if(error) return callback({error});

            callback({status: 'joined', user: user});

            socket.emit('message', {user: 'admin', text: `${user.name}, welcome to the room ${user.room}`});
            socket.broadcast.to(user.room).emit('message',  {user: 'admin', text: `${user.name}, has joned` });
            socket.join(user.room);
        });

        socket.on('newMessage', ({username, room, text}, callback) => {
            const user = clean(username);
            const userroom = clean(room);
            const message = clean(text);
            console.log(message);
            io.to(userroom).emit("message", {user, text: message, id: `socky-${nanoid(7)}`});
            callback();
        });

        socket.on('newEditMessage', ({username, room, text, id}, callback) => {
            const user = clean(username);
            const userroom = clean(room);
            const message = clean(text);
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
            }
        })
    });
}

module.exports = startSocket; 