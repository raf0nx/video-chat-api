const authDAO = require("../dao/authDAO");

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
			message: "User updated successfully!",
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
		res.status(200).send({ message: "User deleted successfully!" });
	} catch (err) {
		console.error(err);
	}
};
