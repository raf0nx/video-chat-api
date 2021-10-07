const jwt = require("jsonwebtoken");
const utils = require("../utils/utils");
require("dotenv").config();

exports.authenticateToken = (req, res, next) => {
  if (req.user) {
    next();
  }

  const { accessToken, refreshToken } = req.cookies;

  if (!accessToken) {
    return res.sendStatus(401);
  }

  jwt.verify(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET,
    async (err, user) => {
      if (err) {
        const newToken = refreshToken
          ? await utils.refreshAccessToken(refreshToken)
          : null;

        if (!newToken) {
          return res.sendStatus(403);
        }

        res.cookie("accessToken", accessToken, {
          maxAge: 30 * 60 * 1000,
          httpOnly: true,
        });
      }

      req.user = user;
      next();
    }
  );
};
