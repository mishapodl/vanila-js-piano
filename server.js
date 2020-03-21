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

// chat
const users = {};

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

io.on('connection', async socket => {
  const random = Math.floor(Math.random() * 100);
  console.log(`User ${random} connected `);

  socket.on('disconnect', () => {
    console.log(`User ${random} disconnected`);
  });

  sendMessage(socket);
  globalUserName(socket);
});

// db
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.error(err));

// view page
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.static('public'));

// routes
app.get('/', (req, res) => {
  res.render('piano');
});

app.post('/songs', async (req, res) => {
  const song = new Song({
    notes: req.body.songNotes
  });
  await song.save();

  res.json(song);
});

app.get('/songs/:id', async (req, res) => {
  let song;
  try {
    song = await Song.findById(req.params.id);
  } catch (e) {
    song = undefined;
  }
  res.render('piano', { song: song });
});
