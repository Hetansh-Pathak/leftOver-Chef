const { OAuth2Client } = require('google-auth-library');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

// OAuth configuration
const oauth = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || 'demo-google-client-id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'demo-google-secret',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'
  },
  facebook: {
    clientId: process.env.FACEBOOK_APP_ID || 'demo-facebook-app-id',
    clientSecret: process.env.FACEBOOK_APP_SECRET || 'demo-facebook-secret',
    callbackURL: process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:5000/api/auth/facebook/callback'
  }
};

// Google OAuth client for token verification
const googleClient = new OAuth2Client(oauth.google.clientId);

// Passport configuration
passport.use(new GoogleStrategy({
  clientID: oauth.google.clientId,
  clientSecret: oauth.google.clientSecret,
  callbackURL: oauth.google.callbackURL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const userProfile = {
      id: profile.id,
      provider: 'google',
      name: profile.displayName,
      email: profile.emails[0].value,
      avatar: profile.photos[0].value,
      accessToken,
      refreshToken
    };
    return done(null, userProfile);
  } catch (error) {
    return done(error, null);
  }
}));

passport.use(new FacebookStrategy({
  clientID: oauth.facebook.clientId,
  clientSecret: oauth.facebook.clientSecret,
  callbackURL: oauth.facebook.callbackURL,
  profileFields: ['id', 'displayName', 'email', 'photos']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const userProfile = {
      id: profile.id,
      provider: 'facebook',
      name: profile.displayName,
      email: profile.emails ? profile.emails[0].value : null,
      avatar: profile.photos ? profile.photos[0].value : null,
      accessToken,
      refreshToken
    };
    return done(null, userProfile);
  } catch (error) {
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Function to verify Google token from frontend
const verifyGoogleToken = async (token) => {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: oauth.google.clientId
    });
    
    const payload = ticket.getPayload();
    return {
      success: true,
      user: {
        id: payload.sub,
        provider: 'google',
        name: payload.name,
        email: payload.email,
        avatar: payload.picture,
        emailVerified: payload.email_verified
      }
    };
  } catch (error) {
    console.error('Google token verification failed:', error);
    return {
      success: false,
      error: 'Invalid Google token'
    };
  }
};

module.exports = {
  oauth,
  passport,
  verifyGoogleToken
};
