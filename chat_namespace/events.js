const Redis = require("../redis/index");

const EnumEvents = require("../enums/enumEvents");

const joinRoom =
  (_socket, namespace) =>
  async ({ socket, user }) => {
    const { room } = socket;
    const username = user.authUser.name;

    _socket.join(room);

    try {
      await Redis.setUser(_socket.id, {
        username,
        status: user.status,
        room,
        privateChat: "",
      });

      const users = await Redis.getUsers(room);

      namespace.in(socket.room).emit(EnumEvents.NEW_USER, { users, username });
    } catch (error) {
      console.error(error);
    }
  };

const publicMessage =
  namespace =>
  ({ socket, user, message }) => {
    const { room } = socket;
    const username = user.authUser.name;
    namespace.in(room).emit(EnumEvents.NEW_MESSAGE, { message, username });
  };

const leaveRoom =
  (_socket, namespace) =>
  async ({ socket, user }) => {
    const { room } = socket;
    const username = user.authUser.name;

    _socket.leave(room);

    try {
      await Redis.deleteUser(_socket.id);
      const users = await Redis.getUsers(room);

      namespace.in(room).emit(EnumEvents.NEW_USER, { users, username });
    } catch (error) {
      console.error(error);
    }
  };

const leaveChat =
  (socket, namespace) =>
  async ({ room, username }) => {
    try {
      await Redis.deleteUser(socket.id);
      const users = await Redis.getUsers(room);

      socket.leave(room);

      namespace.in(room).emit(EnumEvents.LEAVE_CHAT, {
        users,
        message: `${username} left the room`,
      });
    } catch (error) {
      console.error(error);
    }
  };

const joinPrivateRoom =
  (_socket, namespace) =>
  async ({ socket, user, to, from, privateRoom, joinConfirmation }) => {
    const { room } = socket;
    const username = user.authUser.name;

    if (!room) return;

    _socket.join(privateRoom);

    try {
      const { privateChat } = await Redis.getUser(_socket.id);

      if (!!privateChat && privateChat !== username) {
        namespace.to(privateRoom).emit(EnumEvents.LEAVE_PRIVATE_ROOM, {
          to,
          privateMessage: `${to} is already talking`,
          from: username,
        });

        _socket.leave(privateRoom);
        return;
      }

      const user = await Redis.getUser(_socket.id);
      await Redis.setUser(_socket.id, {
        ...user,
        privateChat: privateRoom,
      });

      if (!joinConfirmation) {
        namespace.in(room).emit(EnumEvents.PRIVATE_CHAT, { to, from });
      }
    } catch (error) {
      console.error(error);
    }
  };

const leavePrivateRoom =
  (socket, namespace) =>
  async ({ from, to, privateRoom }) => {
    try {
      const user = await Redis.getUser(socket.id);
      await Redis.setUser(socket.id, { ...user, privateChat: "" });

      socket.leave(privateRoom);
      namespace.to(privateRoom).emit(EnumEvents.LEAVE_PRIVATE_ROOM, {
        to,
        from,
        privateMessage: `${from} has closed the chat`,
      });
    } catch (error) {
      console.error(error);
    }
  };

const privateMessage =
  namespace =>
  ({ privateMessage, to, from, privateRoom }) => {
    namespace
      .to(privateRoom)
      .emit(EnumEvents.PRIVATE_MESSAGE, { to, privateMessage, from });
  };

const changeStatus =
  (_socket, namespace) =>
  async ({ socket, user }) => {
    const { room } = socket;
    const { status } = user;
    const username = user.authUser.name;

    try {
      const user = await Redis.getUser(_socket.id);
      await Redis.setUser(_socket.id, {
        ...user,
        status,
      });

      const users = await Redis.getUsers(room);

      namespace.in(room).emit(EnumEvents.NEW_USER, { users, username });
    } catch (error) {
      console.error(error);
    }
  };

const disconnect = (socket, namespace) => async () => {
  const user = await Redis.getUser(socket.id);

  if (!user) {
    return;
  }

  leaveChat(socket, namespace)({ room: user.room, username: user.username });
};

const privateMessagePCSignaling =
  namespace =>
  ({ desc, to, privateRoom, from }) => {
    namespace
      .to(privateRoom)
      .emit(EnumEvents.PRIVATE_MESSAGE_PC_SIGNALING, { desc, to, from });
  };

module.exports = {
  joinRoom,
  publicMessage,
  leaveRoom,
  leaveChat,
  joinPrivateRoom,
  leavePrivateRoom,
  privateMessage,
  changeStatus,
  disconnect,
  privateMessagePCSignaling,
};
