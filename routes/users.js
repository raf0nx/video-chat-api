const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/auth");

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
