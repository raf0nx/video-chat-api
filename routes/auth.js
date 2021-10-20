const express = require("express");
const router = express.Router();
const passport = require("passport");
const { check } = require("express-validator");
const bcrypt = require("bcrypt");

const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");
const authDAO = require("../dao/authDAO");

const successLoginUrl = "http://localhost:8080/auth/success";
const errorLoginUrl = "http://localhost:8080/error";

router.post(
  "/register",
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
  authController.register
);

router.post(
  "/login",
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
  authController.login
);

router.post("/logout", authMiddleware.authenticateToken, authController.logout);

router.get("/user", authMiddleware.authenticateToken, (req, res) =>
  res.json(req.user)
);

// Google authentication
router.get(
  "/google/login",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureMessage: "Cannot login to google, please try again later!",
    failureRedirect: errorLoginUrl,
    successRedirect: successLoginUrl,
  })
);

module.exports = router;
