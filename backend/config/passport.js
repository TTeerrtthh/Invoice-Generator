const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const jwt = require('jsonwebtoken');

module.exports = function (passport) {
  // If Google OAuth credentials are not provided, skip setting the strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails && profile.emails[0] && profile.emails[0].value;
            let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] });
            if (!user) {
              // create new user
              user = new User({ username: profile.displayName || email || 'google-user', email: email || (`user+${profile.id}@example.com`), googleId: profile.id, password: 'oauth' });
              await user.save();
            } else if (!user.googleId) {
              // attach googleId if missing
              user.googleId = profile.id;
              await user.save();
            }
            return done(null, user);
          } catch (err) {
            return done(err, null);
          }
        }
      )
    );
  }

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => {
    User.findById(id).then((u) => done(null, u)).catch(done);
  });
};
