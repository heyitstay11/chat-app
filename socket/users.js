const { addUserToHistory, removeUserFromHistory } = require("./history");

const users = [];
/*
    user = {
        id
        name
        room
    }
*/

const addUser = ({id, name, room}) => {
    let username = name.trim();
    let userroom = room.trim().toLowerCase();

    const existingUser = users.find((user) => user.room === room && user.name === name);
    
    if(existingUser || name == 'admin' || !username || !userroom){
        return { error : 'Username has already taken', user: null };
    }

    const user = { id, name: username, room: userroom };
    users.push(user);
    addUserToHistory({user: username, room: userroom});
    return { user: user, error : false};
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);

    if(index !== -1){
        const deletedUser =  users.splice(index, 1)[0];
        removeUserFromHistory({ user: deletedUser.name, room: deletedUser.room })
        return deletedUser
    }
}

const getUserInRoom = (room) => {
    let roomUsers = users.map(user => {
        if(user.room === room){
            return user.name;
        }
    });
    return roomUsers;
};

module.exports = {
    addUser,
    removeUser,
    getUserInRoom,
}