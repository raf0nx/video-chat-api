const express = require("express");
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

router.get("/", authMiddleware.authenticateToken, userController.getUsers);
router.get(
	"/:id",
	authMiddleware.authenticateToken,
	userController.getUserById
);
router.patch("/:id", authMiddleware.authenticateToken, userController.editUser);
router.delete(
	"/:id",
	authMiddleware.authenticateToken,
	userController.deleteUser
);

module.exports = router;
