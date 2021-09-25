const express = require('express');
const { User } = require('../models');
const router = express.Router();

router.post('/register', async (req, res) => {
	const { name, email, password } = req.body;


	const newUser = await User.create({
		name,
		email,
		password,
	});

	return res
		.status(201)
		.send({ message: 'User registered successfully!', newUser });
});

router.post('/login', (req, res) => {
	const user = req.body;

	if (!user.room || !user.username) {
		return res.status(422).send({
			message:
				'Unprocessable entity! At least one required param is not provided!',
		});
	}

	return res.status(200).send({
		room: user.room,
		username: user.username,
	});
});

router.post('/logout', (req, res) => {
	const username = req.body.username;
	console.log(`User ${username} logged out successfully.`);

	return res.sendStatus(200);
});

module.exports = router;
