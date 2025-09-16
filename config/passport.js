// /config/passport.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const OAuth2Strategy = require('passport-oauth2').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Organization = require('../models/Organization');
const axios = require('axios');

// Helper function to fetch user info from SSO provider
const fetchUserInfo = async (accessToken) => {
  try {
    const response = await axios.get(process.env.SSO_USER_INFO_URL, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user info from SSO provider:', error.message);
    throw new Error('Failed to fetch user information from SSO provider');
  }
};

// Local Strategy to support username or email
passport.use(new LocalStrategy(
  { usernameField: 'loginCredential', passwordField: 'password' },
  async (loginCredential, password, done) => {
    try {
      const user = await User.findByLoginCredential(loginCredential);
      if (!user) {
        return done(null, false, { message: 'Invalid username/email or password' });
      }
      if (user.isSSO) {
        return done(null, false, { message: 'Please use SSO to login' });
      }
      const isMatch = await bcrypt.compare(password, user.hashedPassword);
      if (!isMatch) {
        return done(null, false, { message: 'Invalid username/email or password' });
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// OAuth2 Strategy for future Google/GitHub integration
passport.use(new OAuth2Strategy(
  {
    authorizationURL: process.env.SSO_AUTHORIZATION_URL,
    tokenURL: process.env.SSO_TOKEN_URL,
    clientID: process.env.SSO_CLIENT_ID,
    clientSecret: process.env.SSO_CLIENT_SECRET,
    callbackURL: process.env.SSO_CALLBACK_URL,
    scope: ['profile', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Fetch additional user info from the provider's API
      let userInfo;
      try {
        userInfo = await fetchUserInfo(accessToken);
      } catch (error) {
        console.error('Failed to fetch user info:', error.message);
        return done(new Error('Unable to retrieve user information from SSO provider'), null);
      }

      // Extract user data with fallbacks
      const ssoId = profile.id || userInfo.id || userInfo.sub;
      const email = userInfo.email || profile.email;
      const firstName = userInfo.first_name || userInfo.given_name || userInfo.firstName || profile.name?.givenName;
      const lastName = userInfo.last_name || userInfo.family_name || userInfo.lastName || profile.name?.familyName;
      const username = userInfo.username || profile.username || userInfo.preferred_username;

      // Validate required fields
      if (!ssoId) {
        return done(new Error('SSO provider did not return a user ID'), null);
      }
      if (!email) {
        return done(new Error('Email is required from SSO provider'), null);
      }
      if (!firstName || !lastName) {
        return done(new Error('First name and last name are required from SSO provider'), null);
      }

      // Check if user already exists with this SSO ID
      let user = await User.findOne({ ssoId });
      
      if (user) {
        // Update existing SSO user
        user.email = email.toLowerCase();
        user.firstName = firstName.trim();
        user.lastName = lastName.trim();
        user.ssoToken = accessToken;
        await user.save();
        return done(null, user);
      }

      // Check if user exists with this email (for account linking)
      user = await User.findOne({ email: email.toLowerCase() });
      
      if (user) {
        if (!user.isSSO) {
          // Link existing manual account to SSO
          user.ssoId = ssoId;
          user.isSSO = true;
          user.ssoToken = accessToken;
          user.firstName = firstName.trim();
          user.lastName = lastName.trim();
          await user.save();
          return done(null, user);
        } else {
          return done(new Error('Email already associated with another SSO account'), null);
        }
      }

      // Create new SSO user
      const organization = await Organization.findOne({ isSuperOrg: true });
      if (!organization) {
        return done(new Error('EngineerSmith super org not found'), null);
      }

      // Generate a unique loginId
      let loginId = username || email.split('@')[0];
      loginId = loginId.toLowerCase().replace(/[^a-z0-9_-]/g, '');
      
      // Ensure loginId is unique
      let counter = 1;
      let originalLoginId = loginId;
      while (await User.findOne({ loginId })) {
        loginId = `${originalLoginId}${counter}`;
        counter++;
      }

      user = new User({
        loginId,
        email: email.toLowerCase(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        ssoId,
        ssoToken: accessToken,
        organizationId: organization._id,
        role: 'student',
        isSSO: true,
      });

      await user.save();
      return done(null, user);
    } catch (error) {
      console.error('OAuth2 Strategy Error:', error);
      return done(error);
    }
  }
));

module.exports = passport;