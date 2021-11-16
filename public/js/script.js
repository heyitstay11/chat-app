const socket = io();
let username = '', room = '';
let EDIT_MODE = false, EDIT_ID = '';
const roomForm = document.getElementById('room-form');
const messageForm = document.getElementById('message-form');
const chatBox = document.querySelector('#chatbox');


const UpdateUser = (user) => {
    username = user.name;
    room = user.room;
    document.getElementById('room-title').innerText = `Room ~ ${room}`;
    window.location.hash = 'chat';
    chatBox.innerHTML = '';
}


const setEditMode = (user, id) => {
    if(user !== username || !id) return ;
    const text = document.getElementById(id).querySelector('.msg');
    if(user === username && text){
        EDIT_MODE = true;
        EDIT_ID = id;
        messageForm.send.innerText = 'Edit';
        messageForm.inputmessage.value = text.innerText;
    }
}


const editMessage = (user, text, id='no_id_given') => {
    let messageEl = document.getElementById(id);
    if(messageEl){
        let textEl = messageEl.querySelector('.msg');
        textEl.innerText =  text;
    }
    chatBox.scrollTop = chatBox.scrollHeight;
}


const addMessage = (user, text, id='', test = false) => {
    const message =
    `<div id="${id}" ondblclick="setEditMode('${user}', '${id}')" 
      class="${(user === username || test) ? 'self': '' }">
        <span class="author">${user}</span>
        <span class="msg">${text}</span>
    </div>`;

    chatBox.innerHTML +=  message;
    chatBox.scrollTop = chatBox.scrollHeight;
}


const sendMessageToSocket = () => {
    let text = messageForm.inputmessage.value.trim();
    messageForm.inputmessage.value = '';
    if(text === '') return 
    if(!username || !room){
        return addMessage('star444', text, 'abc123', true);
    }
    if(EDIT_MODE &&  EDIT_ID){
        socket.emit('newEditMessage', {username, room, text, id: EDIT_ID}, (cb) => {
            if(cb && cb.error){
                return console.log(cb.error);
            }
        });
        EDIT_ID = '', EDIT_MODE = false;
        return messageForm.send.innerText = 'Send';
    }
    socket.emit('newMessage', {username, room, text}, (cb) => {
        if(cb && cb.error){
            return console.log(cb.error);
        }
    });
}



socket.on('message', ({ user, text, id }) => {
   addMessage(user, text, id);
});

socket.on('editMessage', ({user, text, id}) => {
    editMessage(user, text, id);
})

roomForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if(room !== '') return window.location.hash = 'chat';
    let name = roomForm.name.value.trim();
    let usrroom = roomForm.room.value.trim();

    socket.emit('join', {name, room: usrroom}, (cb) => {
        if(cb.error){
            return console.log(cb.error);
        }
        if(cb.status === 'joined'){
            UpdateUser(cb.user);
        }
    });
});


messageForm.inputmessage.addEventListener('keypress', (e) => {
    if(e.key === 'Enter' && e.shiftKey === false){
        e.preventDefault();
        sendMessageToSocket();
    }
})


messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessageToSocket();
})




