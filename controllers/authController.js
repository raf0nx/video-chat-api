const authDAO = require("../dao/authDAO");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const utils = require("../utils/utils");
const redis = require("../redis/index");
require("dotenv").config();

exports.register = async (req, res) => {
	const userData = req.body;

	try {
		const newUser = await authDAO.createUser(userData);
		return res.status(201).send({
			message: "User registered successfully!",
			user: {
				name: newUser.name,
				email: newUser.email,
			},
		});
	} catch (err) {
		console.error(err);
	}
};

exports.login = async (req, res) => {
	const { email, password } = req.body;

	const user = await authDAO.findUserByEmail(email);

	if (!user) {
		res.status(400).send({
			message: "User with this email address was not found",
		});
	}

	const accessToken = utils.generateAccessToken({ name: user.name });
	const refreshToken = jwt.sign(
		{ name: user.name },
		process.env.REFRESH_TOKEN_SECRET
	);

	try {
		if (await bcrypt.compare(password, user.password)) {
			await redis.setRefreshToken(email, refreshToken);
			delete user.dataValues.password;

			res.cookie("accessToken", accessToken, {
				maxAge: 30 * 60 * 1000,
				httpOnly: true,
			});

			res.cookie("refreshToken", refreshToken, {
				maxAge: 30 * 60 * 1000,
				httpOnly: true,
			});

			return res.json({ user, accessToken, refreshToken });
		} else {
			return res.status(401).send({ message: "Invalid password" });
		}
	} catch (err) {
		console.error(err);
	}
};

exports.logout = async (req, res) => {
	const token = req.body.token;

	if (token) {
		const allRefreshTokens = await redis.getRefreshTokens();

		const email = Object.keys(allRefreshTokens).find(
			key => allRefreshTokens[key] === token
		);

		await redis.deleteRefreshToken(email);

		res.clearCookie("accessToken");
		res.clearCookie("refreshToken");
	}

	if (req.user) {
		req.session = null;
	}

	res.sendStatus(204);
};
