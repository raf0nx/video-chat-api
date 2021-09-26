const authDAO = require('../dao/authDAO');

exports.createUser = async (req, res) => {
	const userData = req.body;

	try {
		const newUser = await authDAO.createUser(userData);
		return res
			.status(201)
			.send({ message: 'User registered successfully!', newUser });
	} catch (err) {
		console.error(err);
	}
};

exports.login = (req, res) => {
	const { room, username } = req.body;

	if (!room || !username) {
		return res.status(422).send({
			message:
				'Unprocessable entity! At least one required param is not provided!',
		});
	}

	return res.status(200).send({
		room: room,
		username: username,
	});
};

exports.logout = (req, res) => {
	const username = req.body.username;
	console.log(`User ${username} logged out successfully.`);

	return res.sendStatus(200);
};

exports.getUsers = async (_, res) => {
	try {
		const users = await authDAO.getUsers();
		res.status(200).send({ users });
	} catch (err) {
		console.error(err);
	}
};

exports.getUserById = async (req, res) => {
	const id = req.params.id;

	try {
		const user = await authDAO.getUserById(id);
		res.status(200).send({ user });
	} catch (err) {
		console.error(err);
	}
};

exports.editUser = async (req, res) => {
	const userData = req.body;
	const id = req.params.id;

	try {
		const updatedUser = await authDAO.updateUser(userData, id);
		res.status(200).send({
			message: 'User updated successfully!',
			updatedUser,
		});
	} catch (err) {
		console.error(err);
	}
};

exports.deleteUser = async (req, res) => {
	const id = req.params.id;

	try {
		await authDAO.deleteUser(id);
		res.status(200).send({ message: 'User deleted successfully!' });
	} catch (err) {
		console.error(err);
	}
};
