const express = require("express");
const router = express.Router();
const passport = require("passport");

const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");
const { validateRequest } = require("../middleware/validation/validateRequest");
const {
  validateRegistration,
} = require("../middleware/validation/validateRegistration");
const { validateLogin } = require("../middleware/validation/validateLogin");
const config = require("../config/index");

router.post(
  "/register",
  validateRegistration(),
  validateRequest,
  authController.register
);

router.post("/login", validateLogin(), validateRequest, authController.login);

router.post("/logout", authMiddleware.authenticateToken, authController.logout);

router.get("/user", authMiddleware.authenticateToken, (req, res) =>
  res.json(req.user)
);

/**
 * GOOGLE AUTHENTICATION OAUTH 2.0
 */
router.get(
  "/google/login",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureMessage: "Cannot login to google, please try again later!",
    failureRedirect: config.ERROR_URL,
    successRedirect: config.SUCCESS_URL,
  })
);

module.exports = router;
