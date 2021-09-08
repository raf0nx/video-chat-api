const Redis = require('../redis/index');

let userRoom, userName;

const joinRoom =
	(_socket, namespace) =>
	async ({ socket }) => {
		_socket.join(socket.room);
		userRoom = socket.room;
		userName = socket.username;

		try {
			await Redis.addUser(userRoom, userName, {
				username: userName,
				status: socket.status,
				privateChat: false,
			});

			const users = await Redis.getUsers(userRoom);
			namespace
				.in(socket.room)
				.emit('newUser', { users, username: socket.username });
		} catch (error) {
			console.error(error);
		}
	};

const publicMessage =
	namespace =>
	({ socket, message }) => {
		const { room, username } = socket;
		namespace.in(room).emit('newMessage', { message, username });
	};

const leaveRoom =
	(_socket, namespace) =>
	async ({ socket }) => {
		const { room, username } = socket;
		_socket.leave(room);
		try {
			await Redis.deleteUser(room, username);
			const users = await Redis.getUsers(room);

			namespace.in(room).emit('newUser', { users, username });
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

			namespace.in(room).emit('leaveChat', {
				users,
				message: `${username} left the room`,
			});
		} catch (error) {
			console.error(error);
		}
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
	async ({ socket }) => {
		try {
			const { username, room, status } = socket;

			const user = await Redis.getUser(room, username);
			await Redis.setUser(room, username, {
				...user,
				status,
			});

			const users = await Redis.getUsers(room);

			namespace.in(room).emit('newUser', { users, username });
		} catch (error) {
			console.error(error);
		}
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
