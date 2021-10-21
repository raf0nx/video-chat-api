const { check } = require("express-validator");
const bcrypt = require("bcrypt");

const authDAO = require("../../dao/authDAO");

exports.validateLogin = () => [
  check("password").custom(async (password, { req }) => {
    const user = await authDAO.findUserByEmail(req.body.email);

    if (!user) {
      throw new Error("Invalid login credentials");
    }

    if (await bcrypt.compare(password, user.password)) {
      return true;
    } else {
      throw new Error("Invalid login credentials");
    }
  }),
];
