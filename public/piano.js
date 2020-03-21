const dqs = node => document.querySelector(node);
const dqsa = node => document.querySelectorAll(node);

const WHITE_KEYS = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];
const BLACK_KEYS = ['s', 'd', 'g', 'h', 'j'];

const recoredBtn = dqs('.record-button'),
  playBtn = dqs('.play-button'),
  saveBtn = dqs('.save-button'),
  songLink = dqs('.song-link'),
  keys = dqsa('.key'),
  whiteKeys = dqsa('.key.white'),
  blackKeys = dqsa('.key.black');

const keyMap = [...keys].reduce((map, key) => {
  map[key.dataset.note] = key;
  return map;
}, {});

let recordStartTime;
let songNotes = currentSong && currentSong.notes;

keys.forEach(key => {
  key.addEventListener('click', () => playNote(key));
});

recoredBtn && recoredBtn.addEventListener('click', toggleRecording);
saveBtn && saveBtn.addEventListener('click', saveSong);

playBtn.addEventListener('click', playSong);

document.addEventListener('keydown', e => {
  if (e.repeat) return;
  const key = e.key;
  const whiteKeyIndex = WHITE_KEYS.indexOf(key);
  const blackKeyIndex = BLACK_KEYS.indexOf(key);

  if (whiteKeyIndex > -1) {
    playNote(whiteKeys[whiteKeyIndex]);
  }
  if (blackKeyIndex > -1) {
    playNote(blackKeys[blackKeyIndex]);
  }
});

function toggleRecording() {
  recoredBtn.classList.toggle('active');

  if (isRecording()) {
    startRecording();
  } else {
    stopRecording();
  }
}

function isRecording() {
  return recoredBtn != null && recoredBtn.classList.contains('active');
}

function startRecording() {
  recordStartTime = Date.now();
  songNotes = [];
  playBtn.classList.remove('show');
  saveBtn.classList.remove('show');
}

function stopRecording() {
  playBtn.classList.add('show');
  saveBtn.classList.add('show');
}

function playSong() {
  if (!songNotes.length) return;

  songNotes.forEach(note => {
    setTimeout(() => {
      playNote(keyMap[note.key]);
    }, note.startTime);
  });
}

function playNote(key) {
  if (isRecording()) recordNote(key.dataset.note);

  const noteAudio = document.getElementById(key.dataset.note);

  noteAudio.currentTime = 0;
  noteAudio.play();
  key.classList.add('active');
  noteAudio.addEventListener('ended', () => {
    key.classList.remove('active');
  });
}

function recordNote(note) {
  songNotes.push({
    key: note,
    startTime: Date.now() - recordStartTime
  });
}

function saveSong() {
  axios.post('/songs', { songNotes: songNotes }).then(res => {
    songLink.classList.add('show');
    songLink.href = `/songs/${res.data._id}`;
  });
}