const app = require("./app");
const debug = require("debug")("node-angular");
const http = require("http");
const normalizePort = val => {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }

  if (port >= 0) {
    return port;
  }

  return false;
};

const onError = error => {
  if (error.syscall !== "listen") {
    throw error;
  }
  const bind = typeof port === "string" ? "pipe " + port : "port " + port;
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const onListening = () => {
  const addr = server.address();
  const bind = typeof port === "string" ? "pipe " + port : "port " + port;
  debug("Listening on " + bind);
};

const port = normalizePort(process.env.PORT || "4000");
app.set("port", port);
const server = http.createServer(app);
// else{
// const server = http.createServer({
//   key: fs.readFileSync(
//      process.env.SSL_PDT_KEY || '/etc/nginx/ssl/domain.key'
//   ),
//   cert: fs.readFileSync(
//      process.env.SSL_PDT_CRT || '/etc/nginx/ssl/domain.crt'
//   ),
//   ca: fs.readFileSync(
//      process.env.SSL_PDT_CA || '/etc/nginx/ssl/domain.ca-bundle'
//   ),
//   requestCert: true,
//   rejectUnauthorized: false
// },app);
// }
var io = require('socket.io').listen(server);
server.on("error", onError);
server.on("listening", onListening);
console.log(port);
server.listen(port);


clients=0;
io.on('connection',(socket)=>{

    console.log('new connection made.');


    socket.on('join', function(data){
      //joining
      console.log(data);
      socket.join(data.roomName);

      console.log(data.name + 'joined the room : ' + data.roomName);

      // socket.broadcast.to(data.room).emit('new user joined', {user:data.user, message:'has joined this room.'});
    });


    socket.on('leave', function(data){
    
      console.log(data.name + 'left the room : ' + data.roomName);

      // socket.broadcast.to(data.room).emit('left room', {user:data.user, message:'has left this room.'});

      socket.leave(data.roomName);
    });

    socket.on('message',function(data){

       io.in(data.roomName).emit('new message',data);
    });
    socket.on('newFriend',function(data){
       console.log(data);
       io.in(data.id).emit('new Friend',data.data);
    })
    socket.on('NewClient', function(roomName) {
      console.log("plpll"); 
          if(clients==0)
          io.in(roomName).emit('CreatePeer');
      clients++;
    })
    socket.on('Offer',SendOffer);
    socket.on('Answer',SendAnswer);
    socket.on('disconnect',Disconnect);
});

function SendOffer(offer) {
  console.log(offer.roomName);
  io.in(offer.roomName).emit('BackOffer',offer.data);
}

function SendAnswer(data) {
  console.log(data.roomName);
  io.in(data.roomName).emit('BackAnswer',data.data);
}

function Disconnect(roomName) {
  console.log(roomName);
  io.in(roomName).emit('callOver');
  clients = 0;
}

