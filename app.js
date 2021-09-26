const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const passport = require('passport');
const cookieSession = require('cookie-session');
const auth = require('./routes/auth');
const rooms = require('./routes/room');
const chat = require('./chat_namespace');
const config = require('./config/index');
const http = require('http');
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');
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
require('./config/passport.config');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
	cookieSession({
		name: 'vochat-session',
		keys: ['key1', 'key2'],
	})
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', auth);
app.use('/rooms', rooms);

app.use(express.static(path.join(__dirname, '../dist')));
chat.createNameSpace(io);

const pubClient = createClient({
	host: config.REDIS_HOST,
	port: config.REDIS_PORT,
});
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));

server.listen(config.PORT, () =>
	console.log(`Server is running on port ${config.PORT}`)
);
