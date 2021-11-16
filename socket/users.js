const users = [];

const addUser = ({id, name, room}) => {
    let username = name.trim();
    let userroom = room.trim().toLowerCase();

    const existingUser = users.find((user) => user.room === room && user.name === name);
    
    if(existingUser || name == 'admin' || !username || !userroom){
        return { error : 'Username has already taken', user: null};
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

const getUser = (id) => users.find((user) => user.id === id);

const getUserInRoom = (room) => users.filter((user) => user.room === room);

module.exports ={
    addUser,
    removeUser,
    getUser,
    getUserInRoom,
}