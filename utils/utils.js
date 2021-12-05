const jwt = require("jsonwebtoken");
const redis = require("../redis/index");
const path = require("path");
const rfs = require("rotating-file-stream");
require("dotenv").config();

exports.generateAccessToken = user => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1800s",
  });
};

exports.refreshAccessToken = async refreshToken => {
  const refreshTokens = await redis.getRefreshTokens();

  if (!Object.values(refreshTokens).includes(refreshToken)) {
    return null;
  }

  return jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    (err, user) =>
      err ? null : exports.generateAccessToken({ name: user.name })
  );
};

exports.accessLogStream = rfs.createStream("access.log", {
  interval: "1d",
  path: path.resolve("./", "logs"),
});
