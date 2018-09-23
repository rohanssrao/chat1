var http = require('http');
var express = require('express');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var clientsList = {};
var serverPort = process.env.OPENSHIFT_NODEJS_PORT || 4040;
var serverIpAddress = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

app.use(express.static(__dirname));

app.get('*', function(req, res) {
   res.status(404).send('oops');
});

server.listen(serverPort, serverIpAddress, function() {
   console.log('Listening on ' + serverIpAddress + ', port ' + serverPort);
});

setInterval(function() {
   io.emit('client count', Object.keys(clientsList).length);
   io.emit('client list', clientsList);
}, 100);

io.on('connection', function(socket) {

   var name = '';

   socket.on('message', function(data) {
      if (data.type === 'imageFile') {
           console.log('uploaded image' + ' from \'' + data.name + '\' at ' + data.time);       
      } else {
         console.log(data.type + ' from \'' + data.name + '\' with content \'' + data.content + '\' at ' + data.time);
      }
      socket.broadcast.emit('message', data);
   });

   socket.on('user request', function(username) {

      name = username.name;
      clientsList[name] = username.imageUrl;
      io.emit('userConnect', name);
      console.log('user connected with username \'' + name + '\', client count ' + Object.keys(clientsList).length);

   });

   socket.once('disconnect', function() {
      if (name !== '') {
         delete clientsList.name;
         io.emit('userDisconnect', name);
         io.emit('userTyping', false);
         console.log('user ' + name + ' has disconnected, client count ' + Object.keys(clientsList).length);
      }
   });
   socket.on('logout', function(username) {
      if (username !== '') {
         delete clientsList[name];
         io.emit('userDisconnect', username);
         io.emit('userTyping', false);
         console.log('user ' + username + ' has logged out, client count ' + Object.keys(clientsList).length);
      }
   });
   socket.on('unload', function(username) {
      if (username !== '') {
         clientsList.splice(clientsList.indexOf(username), 1);
         io.emit('userDisconnect', username);
         io.emit('userTyping', false);
         console.log('user ' + username + ' has disconnected, client count ' + Object.keys(clientsList).length);
      }
   });
   socket.on('typing', function(name) {
      if (name !== false) {
         io.emit('userTyping', name);
      } else {
         io.emit('userTyping', false);
      }
   });
});
