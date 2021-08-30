const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
	const user = req.body;

	if (!user.room || !user.username) {
		return res.status(422).send({
			message:
				'Unprocessable entity! At least one required param is not provided!',
		});
	}

	return res.status(200).send({
		room: user.room,
		username: user.username,
	});
});

module.exports = router;
