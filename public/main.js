const dqs = node => document.querySelector(node);
const dqsa = node => document.querySelectorAll(node);

const piano = document.querySelector('#piano');
const chat = document.querySelector('#chat');

(function() {
  piano != null &&  piano.classList.toggle('mob');
  chat != null && chat.classList.toggle('mob');
})();
