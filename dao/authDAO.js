const { User } = require("../models");
const { OAuthUser } = require("../models");
const bcrypt = require("bcrypt");

exports.createUser = async ({ name, email, password }) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return User.create({
    name,
    email,
    password: hashedPassword,
  });
};

exports.getUsers = () => {
  return User.findAll();
};

exports.getUserById = (id, isOAuthUser = false) =>
  isOAuthUser ? OAuthUser.findByPk(id) : User.findByPk(+id);

exports.updateUser = ({ name, email, password }, id) => {
  const updatedUser = { name, email, password };
  return User.update(updatedUser, { where: { id } });
};

exports.deleteUser = id => {
  return User.destroy({ where: { id } });
};

exports.findOrCreate = (profileId, userData) => {
  return OAuthUser.findOrCreate({
    where: { id: profileId },
    defaults: userData,
  });
};

exports.findUserByEmail = email => {
  return User.findOne({ where: { email: email } });
};

exports.findOne = id => {
  return OAuthUser.findOne({ where: { id } });
};
