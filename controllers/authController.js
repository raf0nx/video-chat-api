const authDAO = require("../dao/authDAO");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const utils = require("../utils/utils");
require("dotenv").config();

let refreshTokens = [];

exports.register = async (req, res) => {
  const userData = req.body;

  try {
    const newUser = await authDAO.createUser(userData);
    return res.status(201).send({
      message: "User registered successfully!",
      user: {
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.error(err);
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await authDAO.findUserByEmail(email);

  if (!user) {
    res
      .status(400)
      .send({ message: "User with this email address was not found" });
  }

  const accessToken = utils.generateAccessToken({ name: user.name });
  const refreshToken = jwt.sign(
    { name: user.name },
    process.env.REFRESH_TOKEN_SECRET
  );
  refreshTokens.push(refreshToken);

  try {
    if (await bcrypt.compare(password, user.password)) {
      return res.json({ accessToken, refreshToken });
    } else {
      return res.status(401).send({ message: "Invalid password" });
    }
  } catch (err) {
    console.error(err);
  }
};

exports.createRefreshToken = (req, res) => {
  const refreshToken = req.body.token;

  if (!refreshToken) {
    return res.sendStatus(401);
  }

  if (!refreshTokens.includes(refreshToken)) {
    return res.sendStatus(403);
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    const accessToken = utils.generateAccessToken({ name: user.name });
    res.json({ accessToken });
  });
};

exports.logout = (req, res) => {
  refreshTokens = refreshTokens.filter(token => token !== req.body.token);

  res.sendStatus(204);
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
    const user = await authDAO.getUserById(id, id > 2147483647);
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

exports.googleCallback = async (req, res) => {
  const parsedUser = JSON.parse(JSON.stringify(req.user));
  res.redirect(`http://localhost:8080/chat/?userId=${parsedUser[0].id}`);
  // res
  //   .status(200)
  //   .send({ user: parsedUser[0], message: "Successfully logged in!" });
};
