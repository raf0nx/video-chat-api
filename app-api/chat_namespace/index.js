const config = require('../config/index');

let namespace;

const users = {
	general: [],
	sports: [],
	games: [],
};

const onConnection = socket => {
	socket.on('joinRoom', ({ username, room }) => {
		socket.join(room, () => {
			users[room].push({ username, privateChat: false });
			namespace.in(room).emit('newUser', users[room]);
		});
	});
};

exports.createNameSpace = io => {
	namespace = io.of(config.CHAT_NAMESPACE).on('connection', onConnection);
};
