const users = {
	GENERAL: [],
	OFFICE: [],
	EXPERIMENTAL: [],
};
let userRoom, userName;

const joinRoom =
	(sockeT, namespace) =>
	({ socket }) => {
		sockeT.join(socket.room);
		userRoom = socket.room;
		userName = socket.username;

		users[socket.room].push({
			username: socket.username,
			privateChat: false,
		});

		namespace.in(socket.room).emit('newUser', users[socket.room]);
	};

const publicMessage =
	namespace =>
	({ room, message, username }) => {
		namespace.in(room).emit('newMessage', { message, username });
	};

const leaveRoom =
	(socket, namespace) =>
	({ room, username }) => {
		socket.leave(room);
		namespace.in(room).emit('newUser', { users, username });
	};

const leaveChat =
	(socket, namespace) =>
	({ room, username }) => {
		socket.leave(room);
		namespace.in(room).emit('leaveChat', {
			users,
			message: `${username} left the room`,
		});
	};

const joinPrivateRoom =
	(socket, namespace) =>
	({ username, room, to, from, joinConfirm }) => {
		socket.join(to);
		if (!room) return;

		const privateChat = null;

		if (!!privateChat && privateChat !== username) {
			namespace.to(to).emit('leavePrivateRoom', {
				to,
				room,
				privateMessage: `${to} is already talking`,
				from: username,
			});

			socket.leave(to);
			return;
		}

		if (!joinConfirm) {
			namespace
				.in(room)
				.emit('privateChat', { username, to, room, from });
		}
	};

const leavePrivateRoom =
	(socket, namespace) =>
	({ room, from, to }) => {
		socket.leave(to);
		namespace.to(to).emit('leavePrivateRoom', {
			to,
			from,
			privateMessage: `${from} has closed the chat`,
		});
	};

const privateMessage =
	namespace =>
	({ privateMessage, to, from, room }) => {
		namespace
			.to(room)
			.emit('privateMessage', { to, privateMessage, from, room });
	};

const changeStatus =
	namespace =>
	({ username, status, room }) => {
		namespace.in(room).emit('newUser', { users, username });
	};

const disconnect = (socket, namespace) => () => {
	leaveChat(socket, namespace)({ room: userRoom, name: userName });
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
};
