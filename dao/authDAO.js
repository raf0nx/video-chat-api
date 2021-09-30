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

exports.getUserById = (id, isOAuthUser = false) => {
  if (isOAuthUser) {
    return OAuthUser.findByPk(id);
  }

  return User.findByPk(id);
};

exports.updateUser = ({ name, email, password }, id) => {
  const updatedUser = { name, email, password };
  return User.update(updatedUser, { where: { id } });
};

exports.deleteUser = id => {
  return User.destroy({ where: { id } });
};

exports.findOrCreate = userData => {
  return OAuthUser.findOrCreate({
    where: {
      id: userData.id,
      name: userData.name.givenName,
      email: userData.emails[0].value,
    },
  });
};

exports.findUserByEmail = email => {
  return User.findOne({ where: { email: email } });
};
