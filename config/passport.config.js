const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const authDAO = require("../dao/authDAO");
const config = require("../config/index");

passport.use(
  new GoogleStrategy(
    {
      clientID: config.CLIENT_ID,
      clientSecret: config.CLIENT_SECRET,
      callbackURL: config.CALLBACK_URL,
      passReqToCallback: true,
    },
    async (_, _2, _3, profile, done) => {
      const defaultUser = {
        name: profile.name.givenName,
        email: profile.emails[0].value,
        picture: profile.photos[0].value,
        googleId: profile.id,
      };
      let user = null;

      try {
        user = await authDAO.findOrCreate(profile.id, defaultUser);
      } catch (err) {
        console.error(err);
        done(err, null);
      }

      if (user && user[0]) {
        return done(null, user && user[0]);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  let user = null;

  try {
    user = await authDAO.getUserById(id);
  } catch (err) {
    console.error(err);
    done(err, null);
  }

  if (user) {
    return done(null, user);
  }
});
