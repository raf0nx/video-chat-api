const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const auth = require('./routes/auth');
const rooms = require('./routes/room');
const chat = require('./chat_namespace');
const http = require('http');
const server = http.createServer(app);
const io = (app.io = require('socket.io')(server, {
	cors: {
		origin: 'http://localhost:8080',
		methods: ['GET', 'POST'],
	},
}));

var corsOptions = {
	origin: 'http://localhost:8080',
};

app.use(cors(corsOptions));
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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
