const { User } = require('../models');

exports.createUser = ({ name, email, password }) => {
	return User.create({
		name,
		email,
		password,
	});
};

exports.getUsers = () => {
	return User.findAll();
};

exports.getUserById = id => {
	return User.findByPk(id);
};

exports.updateUser = ({ name, email, password }, id) => {
	const updatedUser = { name, email, password };
	return User.update(updatedUser, { where: { id } });
};

exports.deleteUser = id => {
	return User.destroy({ where: { id } });
};
