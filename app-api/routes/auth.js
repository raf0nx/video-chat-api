const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

router.post('/register', authController.createUser);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/users', authController.getUsers);
router.get('/users/:id', authController.getUserById);
router.patch('/users/:id', authController.editUser);
router.delete('/users/:id', authController.deleteUser);

module.exports = router;
