const jwt = require("jsonwebtoken");

const authDAO = require("../dao/authDAO");
const utils = require("../utils/utils");
const redis = require("../redis/index");
const EnumTokens = require("../enums/enumTokens");
require("dotenv").config();

exports.register = async (req, res) => {
  const { email, name, password } = req.body;

  try {
    await authDAO.createUser({ email, name, password });
    return res.status(201).send({
      message: "User registered successfully!",
    });
  } catch (err) {
    console.error(err);
  }
};

exports.login = async (req, res) => {
  const { email } = req.body;
  const user = await authDAO.findUserByEmail(email);
  const accessToken = utils.generateAccessToken({ name: user.name });
  const refreshToken = jwt.sign(
    { name: user.name },
    process.env.REFRESH_TOKEN_SECRET
  );

  await redis.setRefreshToken(email, refreshToken);
  delete user.dataValues.password;

  res.cookie(EnumTokens.ACCESS_TOKEN, accessToken, {
    maxAge: 30 * 60 * 1000,
    httpOnly: true,
  });

  res.cookie(EnumTokens.REFRESH_TOKEN, refreshToken, {
    maxAge: 30 * 60 * 1000,
    httpOnly: true,
  });

  return res.json(user);
};

exports.logout = async (req, res) => {
  const { accessToken, refreshToken } = req.cookies;

  if (accessToken) {
    const allRefreshTokens = await redis.getRefreshTokens();

    const email = Object.keys(allRefreshTokens).find(
      key => allRefreshTokens[key] === refreshToken
    );

    await redis.deleteRefreshToken(email);

    res.clearCookie(EnumTokens.ACCESS_TOKEN);
    res.clearCookie(EnumTokens.REFRESH_TOKEN);
  }

  if (req.user) {
    req.session = null;
  }

  res.sendStatus(204);
};
