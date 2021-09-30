const express = require("express");
const authController = require("../controllers/authController");
const router = express.Router();
const passport = require("passport");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/users", authController.getUsers);
router.get("/users/:id", authController.getUserById);
router.patch("/users/:id", authController.editUser);
router.delete("/users/:id", authController.deleteUser);
router.post("/token", authController.createRefreshToken);
router.get("/failed", (_, res) => res.send("You failed to log in"));
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/failed" }),
  authController.googleCallback
);

module.exports = router;
