const { check } = require("express-validator");

const authDAO = require("../../dao/authDAO");

exports.validateRegistration = () => [
  check("name")
    .isAlphanumeric()
    .withMessage("Sholud contain only letters and numbers")
    .bail()
    .isLength({ min: 3, max: 255 })
    .withMessage("Should be between 3 and 255 characters"),
  check("email")
    .isEmail()
    .withMessage("Must be a valid email address")
    .bail()
    .normalizeEmail()
    .custom(async email => {
      const user = await authDAO.findUserByEmail(email);

      if (user) {
        throw new Error("Email already in use");
      }

      return true;
    }),
  check("password")
    .isStrongPassword()
    .withMessage(
      "Should be at least 8 characters and contain minimum one lowercase, uppercase and special character"
    )
    .bail()
    .isLength({ max: 255 })
    .withMessage("Cannot have more than 255 characters"),
  check("passwordConfirm").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }

    return true;
  }),
];
