let PORT = process.env.PORT || 5000;
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const mongoose = require('mongoose');
const Song = require('./models/song.js');
const mongoURI = require('./default.json').mongoURI;

// server
server.listen(PORT, function() {
  console.log('Express server listening on port: ' + PORT);
});

// db
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.error(err));

// socket
io.on('connection', async socket => {
  const random = Math.floor(Math.random() * 100);
  console.log(`User ${random} connected `);

  socket.on('disconnect', () => {
    console.log(`User ${random} disconnected`);
  });

  getSongs(socket);

  sendMessage(socket);
  globalUserName(socket);
  userDisconnect(socket);
});

// view page
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.render('index');
});

// piano
app.get('/piano', (req, res) => {
  res.render('piano');
});
app.post('/piano/songs', async (req, res) => {
  const { name, songNotes } = req.body.song;
  const song = new Song({
    name: name || 'unname',
    notes: songNotes
  });
  await song.save();

  res.json(song);

  getSongs(io);
});
app.delete('/piano/:id', (req, res) => {
  Song.findById(req.params.id).then(song => {
    song.remove();
  });
});

async function getSongs(socket) {
  const songs = await Song.find();
  socket.emit('send-songs', songs);
}

// chat
const users = {};
const rooms = { name: {} };

app.get('/chat', (req, res) => {
  res.render('chat', { rooms: rooms });
});
app.post('/chat/room', (req, res) => {
  if (rooms[req.body.room] != null) {
    return res.redirect('/chat');
  }
  rooms[req.body.room] = { users: {} };
  res.redirect(`/chat/${req.body.room}`);
  // send message that new room created
  io.emit('room-created', req.params.room);
});
app.get('/chat/:room', (req, res) => {
  if (rooms[req.params.room] == null) {
    return res.redirect('/chat');
  }
  res.render('room', { roomName: req.params.room });
});

function globalUserName(socket) {
  socket.on('local-user-name', name => {
    users[socket.id] = name;
    socket.broadcast.emit('global-user-name', name);
  });
}
function sendMessage(socket) {
  socket.on('local-message', message => {
    socket.broadcast.emit('global-message', {
      message: message,
      name: users[socket.id]
    });
  });
}
function userDisconnect(socket) {
  socket.on('disconnect', () => {
    socket.broadcast.emit('user-disconnected', users[socket.id] || 'Stranger');
    delete users[socket.id];
  });
}
