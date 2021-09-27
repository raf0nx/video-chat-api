const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const authDAO = require("../dao/authDAO");
const config = require("../config/index");

passport.serializeUser(function (user, done) {
  const parsedUser = JSON.parse(JSON.stringify(user));
  done(null, parsedUser[0].id);
});

passport.deserializeUser(async function (id, done) {
  let user;
  let error = null;

  try {
    user = await authDAO.getUserById(id, true);
  } catch (err) {
    error = err;
  }

  done(error, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: config.CLIENT_ID,
      clientSecret: config.CLIENT_SECRET,
      callbackURL: config.CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      let user;
      let error = null;

      try {
        user = await authDAO.findOrCreate(profile);
      } catch (err) {
        error = err;
      }

      return done(error, user);
    }
  )
);
