const histories = [];
/*
    history = {
        room,
        users = [ ...names], 
        messages = [{
            id,
            text,
            user
        }, {}]
    }
*/

const flushHistory = (room) => {
    const roomIndex = histories.findIndex(item => item.room === room);
    if(roomIndex === -1) return
    histories.splice(roomIndex, 1);
}

const addMessageToHistory = ({user, room, text , id}) => {
    const message = {id, text, user}
    const roomIndex = histories.findIndex(item => item.room === room);
    if(roomIndex === -1) return
    histories[roomIndex].messages.push(message);
}

const addUserToHistory = ({user, room}) => {
    const roomIndex = histories.findIndex(item => item.room === room);
    if(roomIndex === -1){
       return histories.push({room, users: [user], messages : []});
    }
    histories[roomIndex].users.push(user);
}

const removeUserFromHistory = ({user, room}) => {
    const roomIndex = histories.findIndex(item => item.room === room);
    if(roomIndex === -1) return
    histories[roomIndex].users = histories[roomIndex].users.filter(item => item != user);
    if(histories[roomIndex].users.length <= 0){
        flushHistory(room);
    }
}

const getAllMessageInRoom = (room) => {
    const roomIndex = histories.findIndex(item => item.room === room);
    if(roomIndex === -1) return [] ;
    return histories[roomIndex].messages;
}

module.exports = {
    addMessageToHistory,
    addUserToHistory,
    removeUserFromHistory,
    getAllMessageInRoom
}