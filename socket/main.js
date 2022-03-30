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
        });

        socket.on('disconnect', () => {
            let user = removeUser(socket.id);
            if(user){
                io.to(user.room).emit("message", {user: 'admin', text: `${user.name} has left the room`});
                io.to(user.room).emit('pInfo', {users: getUserInRoom(user.room)});
            }
        });

        socket.on('p-join', ({id, user}, callback) => {
            socket.join(id);
            socket.broadcast.to(id).emit('is-online', {user});
            callback();
        });

        socket.on('p-leave', ({id}, callback) => {
            socket.leave(id);
            socket.broadcast.to(id).emit('call-ended', {id});
            callback();
        });

        socket.on('p-newMessage', ({roomId, sender, text, msg_id}, callback) => {
            const userroom = roomId;
            const message = emojify(clean(text));
            io.to(userroom).emit("p-message", {sender, text: message, msg_id});
            callback();
        });

        socket.on('ack', ({id, user}) => {
            console.log('ack', user);
            socket.broadcast.to(id).emit('is-online-ack', {user});
        })

        socket.on('call-user', ({id, signalData, sender}) => {
            console.log(sender, 'calling');
            socket.broadcast.to(id).emit('call-user', {signal: signalData, sender, senderId: socket.id});
        });

        socket.on('answer-call', ({id, signal, senderId}) => {
            console.log(id, 'accept', senderId);
            socket.broadcast.to(senderId).emit('call-accepted', {signal});
            socket.to(senderId).emit('hello', {id});
            
        });

    });
}

module.exports = startSocket; 