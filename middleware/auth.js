const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return authenticateUser(req, res, next);
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }

    req.user = user;
    next();
  });
};

authenticateUser = (req, res, next) =>
  req.user ? next() : res.sendStatus(401);
