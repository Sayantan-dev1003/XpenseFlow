const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User.model');
const bcrypt = require('bcryptjs');

// Local Strategy
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      if (!user.password) {
        return done(null, false, { message: 'Please use social login for this account' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return done(null, false, { message: 'Invalid email or password' });
      }


      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Google Strategy
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findOne({ googleId: profile.id });
      
      if (user) {
        return done(null, user);
      }

      // Check if user exists with same email
      user = await User.findOne({ email: profile.emails[0].value.toLowerCase() });
      
      if (user) {
        // Link Google account to existing user
        user.googleId = profile.id;
        user.profilePicture = profile.photos[0].value;
        await user.save();
        return done(null, user);
      }

      // For Google OAuth, we don't create new users without company association
      // Users must be created by admins first
      return done(null, false, { message: 'This Google account is not registered. Please use the login credentials sent to your email.' });
    } catch (error) {
      return done(error);
    }
  }
));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;