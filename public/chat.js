const messageConteiner = document.querySelector('#messages-conteiner');
const messageForm = document.querySelector('#chat-form');
const messageInput = document.querySelector('#chat-message');
const chatStartBtn = document.querySelector('#chat-start');

const COLORS = {
  adminMessage: 'white',
  joined: 'lightgreen',
  disconnect: '#ff3d3d',
  usersMessage: 'yellow',
  users: [{ color: 'green' }, { color: 'aqua' }]
};

chatStartBtn.addEventListener('click', startChat);
messageForm.addEventListener('submit', e => sendToServer(e));

function startChat() {
  const name = prompt('Your name');
  appendMessage('You joined!', COLORS.joined);
  socket.emit('local-user-name', name);
}
function sendToServer(e) {
  let message = messageInput.value || 'Send empty message';
  e.preventDefault();
  appendMessage(`You: ${message}`, COLORS.adminMessage);
  socket.emit('local-message', message);
  messageInput.value = '';
}
function appendMessage(message, color) {
  let messageElement = document.createElement('div');
  messageElement.style.backgroundColor = color;
  messageElement.innerText = message;
  messageConteiner.append(messageElement);
}

socket.on('global-message', data => {
  const name = !data.name ? 'STRANGER' : data.name;
  appendMessage(`${name}: ${data.message}`, COLORS.usersMessage);
});
socket.on('global-user-name', name => {
  appendMessage(`${name} connected`, COLORS.joined);
});
socket.on('user-disconnected', name => {
  appendMessage(`${name} disconnected`, COLORS.disconnect);
});