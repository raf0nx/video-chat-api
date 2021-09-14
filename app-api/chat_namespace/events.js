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
	async ({ socket, to, from, joinConfirmation }) => {
		const { username, room } = socket;

		if (!room) return;

		_socket.join(to);

		try {
			const { privateChat } = await Redis.getUser(room, to);
			if (!!privateChat && privateChat !== username) {
				namespace.to(to).emit('leavePrivateRoom', {
					to,
					room,
					privateMessage: `${to} is already talking`,
					from: username,
				});

				_socket.leave(to);
				return;
			}

			const user = await Redis.getUser(room, username);
			await Redis.setUser(room, username, {
				...user,
				privateChat: to,
			});

			if (!joinConfirmation) {
				namespace
					.in(room)
					.emit('privateChat', { username, to, room, from });
			}
		} catch (error) {
			console.log(error);
		}
	};

const leavePrivateRoom =
	(socket, namespace) =>
	async ({ room, from, to }) => {
		try {
			const user = await Redis.getUser(room, from);
			await Redis.setUser(room, from, { ...user, privateChat: false });

			socket.leave(to);
			namespace.to(to).emit('leavePrivateRoom', {
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

const disconnect = (socket, namespace) => async () => {
	try {
		await Redis.deleteUser(userName, config.KEY);
		leaveChat(socket, namespace)({ room: userRoom, username: userName });
	} catch (error) {
		console.error(error);
	}
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
