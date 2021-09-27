const { User } = require("../models");
const { OAuthUser } = require("../models");

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

exports.deleteUser = (id) => {
  return User.destroy({ where: { id } });
};

exports.findOrCreate = (userData) => {
  return OAuthUser.findOrCreate({
    where: {
      id: userData.id,
      name: userData.name.givenName,
      email: userData.emails[0].value,
    },
  });
};
