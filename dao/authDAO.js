const { User } = require("../models");
const bcrypt = require("bcrypt");

exports.createUser = async ({ name, email, password }) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return User.create({
    name,
    email,
    password: hashedPassword,
  });
};

exports.getUsers = () => User.findAll();

exports.updateUser = ({ name, email, password }, id) => {
  const updatedUser = { name, email, password };
  return User.update(updatedUser, { where: { id } });
};

exports.deleteUser = id => User.destroy({ where: { id } });
exports.getUserById = id =>
  User.findByPk(id, { attributes: { exclude: ["password"] } });

exports.findOrCreate = (profileId, userData) =>
  User.findOrCreate({
    where: { googleId: profileId },
    defaults: userData,
  });

exports.findUserByEmail = email =>
  User.findOne({
    where: { email: email },
  });
