var express = require('express'), 
    app = express(),
    http = require('http'),
    socketIo = require('socket.io');

// start webserver on port 8080
var server =  http.createServer(app);
var io = socketIo.listen(server);
server.listen(8080);

// add directory with our static files
app.use(express.static(__dirname + '/public'));
console.log("Server running on 127.0.0.1:8080");

// array of all lines drawn
var history = [];

// event-handler for new incoming connections
io.on('connection', function (socket) {

   // first send the history to the new client
   for (var i in history) {
      socket.emit('canvas_change', history[i] );
   }

   // add handler for message type "draw_line".
   socket.on('canvas_change', function (data) {
      // add received line to history 
      history.push(data);
      console.log(history[history.length-1]);
      // send line to all clients except sender
      socket.broadcast.emit('canvas_change', data);
   });
});