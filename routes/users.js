const express = require("express");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

router.get("/", authMiddleware.authenticateToken, authController.getUsers);
router.get(
  "/:id",
  authMiddleware.authenticateToken,
  authController.getUserById
);
router.patch("/:id", authMiddleware.authenticateToken, authController.editUser);
router.delete(
  "/:id",
  authMiddleware.authenticateToken,
  authController.deleteUser
);

module.exports = router;
