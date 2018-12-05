var express = require('express');
var path = require('path');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var PORT = 3000;
var users = [];

app.use(express.static(path.join(__dirname, "public")));

io.on('connection', (socket) => {
  console.log('new connection made');

  // Join private room
  socket.on('join-private', function(data) {
    socket.join('private');
    console.log(data.nickname + "joined private");
  })

  // Send message to all in private room when user joins
  socket.on('private-chat', function(data) {
    socket.broadcast.to('private').emit('show-message', data.message);
  })

  // Show all users when first logged on
  socket.on('get-users', function() {
    socket.emit('all-users', users);
  })

  // When the socket joins
  socket.on('join', function(data) {
    console.log(data);
    console.log(users);
    socket.nickname = data.nickname;
    users[socket.nickname] = socket;
    var userObj = {
      nickname: data.nickname,
      socketid: socket.id
    }
    users.push(userObj);
    io.emit('all-users', users);
  })

  // Broadcast the messages
  socket.on('send-message', function(data) {
    // socket.broadcast.emit('message-received', data);
    io.emit('message-received', data);
  });

  // Send a like to the user of your choice
  socket.on('send-like', function(data) {
    console.log(data);
    socket.broadcast.to(data.like).emit('user-liked', data);
  })

  // Disconnect from socket
  socket.on('disconnect', function() {
    users = users.filter(function(item) {
      return item.nickname !== socket.nickname;
    });
    io.emit('all-users', users);
  });

});

server.listen(PORT, (err) => {
  if (err) {
    console.log("There was an issue: ", err);
  } else {
    console.log("Listening on PORT ", PORT);
  }

});