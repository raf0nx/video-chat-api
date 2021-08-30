const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const auth = require('./routes/auth');
const rooms = require('./routes/room');
const chat = require('./chat_namespace');
const config = require('./config/index');
const http = require('http');
const server = http.createServer(app);
const io = (app.io = require('socket.io')(server, {
	cors: {
		origin: 'http://localhost:8080',
		methods: ['GET', 'POST'],
		credentials: true,
		transports: ['websocket', 'polling'],
	},
	allowEIO3: true,
}));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((_, __, next) => {
	console.log('Time: ', Date.now());
	next();
});

app.use('/auth', auth);
app.use('/rooms', rooms);

app.use(express.static(path.join(__dirname, '../dist')));
chat.createNameSpace(io);

server.listen(config.PORT, () =>
	console.log(`Server is running on port ${config.PORT}`)
);
