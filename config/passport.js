// /config/passport.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const OAuth2Strategy = require('passport-oauth2').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Organization = require('../models/Organization');

// Updated Local Strategy to support username or email
passport.use(new LocalStrategy(
  { usernameField: 'loginCredential', passwordField: 'password' },
  async (loginCredential, password, done) => {
    try {
      // Use the static method to find by username or email
      const user = await User.findByLoginCredential(loginCredential);
      if (!user) {
        return done(null, false, { message: 'Invalid username/email or password' });
      }
      if (!user.isSSO) {
        const isMatch = await bcrypt.compare(password, user.hashedPassword);
        if (!isMatch) {
          return done(null, false, { message: 'Invalid username/email or password' });
        }
      } else {
        return done(null, false, { message: 'Use SSO for this account' });
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

passport.use(new OAuth2Strategy(
  {
    authorizationURL: 'https://simplycoding.org/oauth/authorize', // Replace with actual URL
    tokenURL: 'https://simplycoding.org/oauth/token', // Replace with actual URL
    clientID: process.env.SSO_CLIENT_ID,
    clientSecret: process.env.SSO_CLIENT_SECRET,
    callbackURL: process.env.NODE_ENV === 'production' ? process.env.SSO_CALLBACK_URL : process.env.SSO_CALLBACK_URL_DEV,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ ssoId: profile.id });
      if (!user) {
        // Create new user in EngineerSmith super org
        const organization = await Organization.findOne({ isSuperOrg: true });
        if (!organization) {
          return done(null, false, { message: 'EngineerSmith super org not found' });
        }
        user = new User({
          loginId: profile.username || `sso_${profile.id}`,
          email: profile.email || undefined, // Set email if available from SSO
          ssoId: profile.id,
          ssoToken: accessToken,
          organizationId: organization._id,
          role: 'student', // Default to student
          isSSO: true,
        });
        await user.save();
      } else {
        user.ssoToken = accessToken;
        await user.save();
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

module.exports = passport;