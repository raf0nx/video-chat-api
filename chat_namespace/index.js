const events = require("./events");
const config = require("../config/index");

let namespace;

const onConnection = (socket) => {
  socket.on("joinRoom", events.joinRoom(socket, namespace));
  socket.on("publicMessage", events.publicMessage(namespace));
  socket.on("leaveRoom", events.leaveRoom(socket, namespace));
  socket.on("leaveChat", events.leaveChat(socket, namespace));
  socket.on("joinPrivateRoom", events.joinPrivateRoom(socket, namespace));
  socket.on("leavePrivateRoom", events.leavePrivateRoom(socket, namespace));
  socket.on("privateMessage", events.privateMessage(namespace));
  socket.on("changeStatus", events.changeStatus(socket, namespace));
  socket.on("disconnect", events.disconnect(socket, namespace));
  socket.on(
    "privateMessagePCSignaling",
    events.privateMessagePCSignaling(namespace)
  );
};

exports.createNameSpace = (io) => {
  namespace = io.of(config.CHAT_NAMESPACE).on("connection", onConnection);
};
