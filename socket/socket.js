import socketIO from 'socket.io';


const ws = {}



ws.init = (server) => {
  this.io = socketIO.server(server);
}

ws.listen = () => {
  if (!this.io) {
    throw new Error('please call init(server) before calling listen()');
  }
  
  this.io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });
}





export default ws;