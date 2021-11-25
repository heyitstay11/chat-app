const socket = io();
let username = '', room = '';
let EDIT_MODE = false, EDIT_ID = '';
const roomForm = document.getElementById('room-form');
const messageForm = document.getElementById('message-form');
const chatBox = document.querySelector('#chatbox');
const leaveButton = document.getElementById('leave');
const listButton = document.getElementById('list');


const UpdateUser = (user) => {
    username = user.name;
    room = user.room;
    document.getElementById('room-title').innerText = `Room ~ ${room}`;
    window.location.hash = 'chat';
    chatBox.innerHTML = '';
}


const updateList = (users) => {
    document.getElementById('total-p').innerText = users.length;
    const pList = document.getElementById('p-list-inner');
    const newList = document.createElement('ul');
    users.forEach(user => {
        let li = document.createElement('li');
        li.innerText = user;
        newList.appendChild(li);
    });
    pList.innerHTML = newList.innerHTML;
}


const setEditMode = (user, id) => {
    if(user !== username || !id) return ;
    const text = document.getElementById(id).querySelector('.msg');
    if(user === username && text){
        EDIT_MODE = true;
        EDIT_ID = id;
        messageForm.send.innerText = 'Edit';
        messageForm.inputmessage.value = text.innerText;
        messageForm.delete.style.display = 'block';
    }
}


const editMessage = (user, text, id='no_id_given') => {
    let messageEl = document.getElementById(id);
    if(messageEl){
        let textEl = messageEl.querySelector('.msg');
        textEl.innerText =  text;
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}


const addMessage = (user, text, id='', test = false) => {
    if(!text) return
    let wrapDiv = document.createElement('div');
    wrapDiv.id = id;
    wrapDiv.addEventListener('dblclick', () => setEditMode(user, id));
    if(user === username || test){
        wrapDiv.classList.add('self');
    }
    const message =
    `<span class="author">${user}</span>
    <span class="msg">${text.toString()}</span>`;
    wrapDiv.innerHTML = message;

    chatBox.appendChild(wrapDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}


const deleteMessage = (id) => {
    let messageEl = document.getElementById(id);
    if(messageEl){
        messageEl.remove();
        chatBox.scrollTop = chatBox.scrollHeight;
    }
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
        messageForm.delete.style.display = 'none';
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
});


socket.on('deleteMessage', ({id}) => {
    deleteMessage(id);
});

socket.on('pInfo', ({users}) => {
    updateList(users);
});

socket.on('chatHistory', ({ messages }) => {
    if(messages.length <= 0) return;
    messages.forEach(({id, text, user}) => {
        addMessage(user, text, id);
    });
    chatBox.innerHTML += `<p style='text-align:center;margin: 10px auto'>Chat History</p>`
});

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
            leaveButton.style.display = 'block';
            listButton.classList.add('active');
            document.getElementById('p-list').classList.add('active');
            UpdateUser(cb.user);
        }
    });
});


messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessageToSocket();
});


messageForm.inputmessage.addEventListener('keypress', (e) => {
    if(e.key === 'Enter' && e.shiftKey === false){
        e.preventDefault();
        sendMessageToSocket();
    }
});


messageForm.delete.addEventListener('click', (e) => {
    e.preventDefault();
    socket.emit('sendDelete', {id: EDIT_ID, room}, (cb) => {
        if(cb && cb.error){
            return console.log(cb.error);
        }
        EDIT_ID = '', EDIT_MODE = false;
        messageForm.delete.style.display = 'none';
        messageForm.inputmessage.value = '';
        return messageForm.send.innerText = 'Send';
    });
});


leaveButton.addEventListener('click', () => {
    window.location = '/';
})

listButton.addEventListener('click', () => {
    document.getElementById('p-list').classList.toggle('visible');
})