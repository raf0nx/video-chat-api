const express = require('express');
const cors = require('cors');

const app = express();

var corsOptions = {
	origin: 'http://localhost:8080',
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api', (_, res) => {
	res.json({ message: 'Successful get action.' });
});

app.get('/', (_, res) => {
	res.json({ message: 'Welcome to video-chat application.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
