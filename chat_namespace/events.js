const Redis = require("../redis/index");
const config = require("../config/index");

let userRoom, userName;

const joinRoom =
  (_socket, namespace) =>
  async ({ socket, user }) => {
    _socket.join(socket.room);
    userRoom = socket.room;
    userName = user.authUser.name;

    try {
      await Redis.addUser(userRoom, userName, {
        username: userName,
        status: user.status,
        privateChat: "",
      });

      const users = await Redis.getUsers(userRoom);
      namespace
        .in(socket.room)
        .emit("newUser", { users, username: user.authUser.name });
    } catch (error) {
      console.error(error);
    }
  };

const publicMessage =
  namespace =>
  ({ socket, user, message }) => {
    const { room } = socket;
    const username = user.authUser.name;
    namespace.in(room).emit("newMessage", { message, username });
  };

const leaveRoom =
  (_socket, namespace) =>
  async ({ socket, user }) => {
    const { room } = socket;
    const username = user.authUser.name;
    _socket.leave(room);
    try {
      await Redis.deleteUser(room, username);
      const users = await Redis.getUsers(room);

      namespace.in(room).emit("newUser", { users, username });
    } catch (error) {
      console.error(error);
    }
  };

const leaveChat =
  (socket, namespace) =>
  async ({ room, username }) => {
    try {
      await Redis.deleteUser(room, username);
      const users = await Redis.getUsers(room);

      socket.leave(room);

      namespace.in(room).emit("leaveChat", {
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
      const { privateChat } = await Redis.getUser(room, to);
      if (!!privateChat && privateChat !== username) {
        namespace.to(privateRoom).emit("leavePrivateRoom", {
          to,
          privateMessage: `${to} is already talking`,
          from: username,
        });

        _socket.leave(privateRoom);
        return;
      }

      const user = await Redis.getUser(room, username);
      await Redis.setUser(room, username, {
        ...user,
        privateChat: privateRoom,
      });

      if (!joinConfirmation) {
        namespace.in(room).emit("privateChat", { to, from });
      }
    } catch (error) {
      console.error(error);
    }
  };

const leavePrivateRoom =
  (socket, namespace) =>
  async ({ room, from, to, privateRoom }) => {
    try {
      const user = await Redis.getUser(room, from);
      await Redis.setUser(room, from, { ...user, privateChat: "" });

      socket.leave(privateRoom);
      namespace.to(privateRoom).emit("leavePrivateRoom", {
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
      .emit("privateMessage", { to, privateMessage, from });
  };

const changeStatus =
  namespace =>
  async ({ socket, user }) => {
    const { room } = socket;
    const { status } = user;
    const username = user.authUser.name;

    try {
      const user = await Redis.getUser(room, username);
      await Redis.setUser(room, username, {
        ...user,
        status,
      });

      const users = await Redis.getUsers(room);

      namespace.in(room).emit("newUser", { users, username });
    } catch (error) {
      console.error(error);
    }
  };

const disconnect = (socket, namespace) => async () => {
  try {
    await Redis.deleteUser(userName, config.KEY);
    leaveChat(socket, namespace)({ room: userRoom, username: userName });
  } catch (error) {
    console.error(error);
  }
};

const privateMessagePCSignaling =
  namespace =>
  ({ desc, to, privateRoom, from }) => {
    namespace
      .to(privateRoom)
      .emit("privateMessagePCSignaling", { desc, to, from });
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
