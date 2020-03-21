const switchBtn = document.querySelector('.switch');
const piano = document.querySelector('#piano');
const chat = document.querySelector('#chat');
let defaultChat = true;

switchBtn.addEventListener('click', () => {
  if (defaultChat) {
    piano.style.display = 'block';
    chat.style.display = 'none';
    switchBtn.textContent = 'Switch to chat';
    defaultChat = !defaultChat;
  } else {
    piano.style.display = 'none';
    chat.style.display = 'flex';
    switchBtn.textContent = 'Switch to piano';
    defaultChat = !defaultChat;
  }
});
