const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();
const passport = require('passport');

router.post('/register', authController.createUser);
router.post('/login', authController.login);
// router.post('/logout', authController.logout);
router.get('/users', authController.getUsers);
router.get('/users/:id', authController.getUserById);
router.patch('/users/:id', authController.editUser);
router.delete('/users/:id', authController.deleteUser);
router.get('/failed', (req, res) => res.send('You failed to log in'));
router.get('/passed', (req, res) => {
	const parsedUser = JSON.parse(JSON.stringify(req.user));
	res.send(`Welcome mr ${parsedUser.name}`);
});
router.get(
	'/google',
	passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
	'/google/callback',
	passport.authenticate('google', { failureRedirect: '/auth/failed' }),
	function (req, res) {
		res.redirect('/auth/passed');
	}
);

router.get('/logout', (req, res) => {
	req.session = null;
	req.logout();
	res.redirect('/');
});

module.exports = router;
