const express = require("express");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");
const router = express.Router();
const passport = require("passport");

const successLoginUrl = "http://localhost:8080/auth/success";
const errorLoginUrl = "http://localhost:8080/error";

router.post("/register", authController.register);
router.post("/login", authController.login);
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
