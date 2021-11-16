const {addUser, removeUser} = require('./users');
const { nanoid } = require('nanoid');

const startSocket = (io) => {

    io.on('connection', (socket) => {
        console.log('New Connection');
        
        socket.on('join', ({name, room}, callback) => {

            const {user, error} = addUser({id:socket.id, name, room});
            if(error) return callback({error});

            callback({status: 'joined', user});

            socket.emit('message', {user: 'admin', text: `${user.name}, welcome to the room ${user.room}`});
            socket.broadcast.to(user.room).emit('message',  {user: 'admin', text: `${user.name}, has joned` });
            socket.join(user.room);
        });

        socket.on('newMessage', ({username, room, text}, callback) => {
            io.to(room).emit("message", {user: username, text, id: `socky-${nanoid(7)}`});
            callback();
        });

        socket.on('newEditMessage', ({username, room, text, id}, callback) => {
            console.log('Edit', id);
            io.to(room).emit("editMessage", {user: username, text, id});
            callback();
        });

        socket.on('disconnect', () => {
            let user = removeUser(socket.id);
            if(user){
                io.to(user.room).emit("message", {user: 'admin', text: `${user.name} has left the room`});
            }
        })
    });
}

module.exports = startSocket; 