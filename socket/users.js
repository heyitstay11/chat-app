const users = [];

const addUser = ({id, name, room}) => {
    let username = name.trim();
    let userroom = room.trim().toLowerCase();

    const existingUser = users.find((user) => user.room === room && user.name === name);
    
    if(existingUser || name == 'admin' || !username || !userroom){
        return { error : 'Username has already taken', user: null };
    }

    const user = { id, name: username, room: userroom };
    users.push(user);
    return { user: user, error : false};
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);

    if(index !== -1){
        return users.splice(index, 1)[0];
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

module.exports ={
    addUser,
    removeUser,
    getUserInRoom,
}