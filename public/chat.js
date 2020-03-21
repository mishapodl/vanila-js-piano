const socket = io();

const messageConteiner = document.querySelector('#messages-conteiner'); 
const messageForm = document.querySelector('#chat-form'); 
const messageInput = document.querySelector('#chat-message'); 
const chatStart = document.querySelector('#chat-start'); 



chatStart.addEventListener('click', startChat);
function startChat() {
  const name = prompt('Your name');
  appendMessage('You joined!');
  socket.emit('local-user-name', name);
};

function appendMessage(message) {
  let messageElement = document.createElement('div');
  messageElement.innerText = message;
  messageConteiner.append(messageElement);
}

messageForm.addEventListener('submit', e => {
  let message = messageInput.value || 'Send empty message';
  e.preventDefault();
  socket.emit('local-message', message);
  messageInput.value = '';
});

socket.on('global-message', data => {
  const name  = !data.name ? 'STRANGER' : data.name;
  appendMessage(`${name}: ${data.message}`);
});
socket.on('global-user-name', name => {
  appendMessage(`${name} connected`);
});


