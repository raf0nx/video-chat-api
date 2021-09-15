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
	(_socket, namespace) =>
	async ({ socket, to, from, privateRoom, joinConfirmation }) => {
		const { username, room } = socket;

		if (!room) return;

		_socket.join(privateRoom);

		try {
			const { privateChat } = await Redis.getUser(room, to);
			if (!!privateChat && privateChat !== username) {
				namespace.to(privateRoom).emit('leavePrivateRoom', {
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
				namespace.in(room).emit('privateChat', { to, from });
			}
		} catch (error) {
			console.log(error);
		}
	};

const leavePrivateRoom =
	(socket, namespace) =>
	async ({ room, from, to, privateRoom }) => {
		try {
			const user = await Redis.getUser(room, from);
			await Redis.setUser(room, from, { ...user, privateChat: false });

			socket.leave(privateRoom);
			namespace.to(privateRoom).emit('leavePrivateRoom', {
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
			.emit('privateMessage', { to, privateMessage, from });
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
			.emit('privateMessagePCSignaling', { desc, to, from });
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
