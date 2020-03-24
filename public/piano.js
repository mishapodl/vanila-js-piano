const WHITE_KEYS = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];
const BLACK_KEYS = ['s', 'd', 'g', 'h', 'j'];
let songs = [];

socket.on('send-songs', data => {
  songs = data;
  showSongsList(songs);
});

const recoredBtn = dqs('.record-button'),
  playBtn = dqs('.play-button'),
  saveBtn = dqs('.save-button'),
  songLink = dqs('.song-link'),
  nameSong = dqs('.input-name'),
  songsList = dqs('.songs-list'),
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
  nameSong.classList.remove('show');
}

function stopRecording() {
  playBtn.classList.add('show');
  saveBtn.classList.add('show');
  nameSong.classList.add('show');
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
  axios
    .post('/piano/songs', {
      song: {
        name: nameSong.value,
        songNotes: songNotes
      }
    })
    .then(res => {
      nameSong.value = '';
      songs.push(res.data);
      showSongsList(songs);
    });
}

function showSongsList(songs) {
  if (!songs) return;
  while (songsList.firstChild) {
    songsList.removeChild(songsList.firstChild);
  }

  songs.forEach(song => {
    let li = document.createElement('li');
    li.innerHTML = `<a href="#" data-name="${song._id}">${song.name}<span class="remove-song" data-id="${song._id}">X</span></a>`;
    songsList.append(li);
    playChoosenSong(li);
    deleteSong(li);
  });
}

function searchSong(id) {
  let song = songs.filter(song => {
    if (song._id == id) return song;
  });

  songNotes = song[0].notes;
  playSong();
}

function playChoosenSong(li) {
  li.addEventListener('click', e => {
    if (e.target.tagName != 'A') return;
    searchSong(e.target.dataset.name);
  });
}

function deleteSong(li) {
  let deleteBtn = li.querySelector('span');
  deleteBtn.addEventListener('click', async e => {
    e.stopPropagation();
    e.target.closest('li').remove();
    await axios.delete(`/piano/${deleteBtn.dataset.id}`);
  });
}
