const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { OAuthUser } = require('../models');

passport.serializeUser(function (user, done) {
	const parsedUser = JSON.parse(JSON.stringify(user));
	done(null, parsedUser[0].id);
});

passport.deserializeUser(async function (id, done) {
	let user;
	let error = null;

	try {
		user = await OAuthUser.findByPk(id);
	} catch (err) {
		error = err;
	}
	done(error, user);
});

passport.use(
	new GoogleStrategy(
		{
			clientID:
				'4219937188-t07a2duv5ijjstlfph20cqrh5lcgh3bf.apps.googleusercontent.com',
			clientSecret: '_BC6q7xTtWHGKu_2kN2bZH7w',
			callbackURL: 'http://localhost:3000/auth/google/callback',
		},
		async (accessToken, refreshToken, profile, done) => {
			let user;
			let error = null;

			try {
				user = await OAuthUser.findOrCreate({
					where: {
						id: profile.id,
						name: profile.name.givenName,
						email: profile.emails[0].value,
					},
				});
			} catch (err) {
				error = err;
			}

			return done(error, user);
		}
	)
);
