const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables directly from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// --- Google OAuth Strategy ---
try {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientID || !clientSecret) {
    throw new Error('Google OAuth credentials (GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET) are missing from your .env file.');
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: clientID,
        clientSecret: clientSecret,
        callbackURL: '/api/auth/google/callback', // This will be prefixed by the server URL
        scope: ['profile', 'email'],
        proxy: true // Important for handling reverse proxies (like when deployed)
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if the user already exists in your database
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            // If user exists, update their info just in case it changed
            user.name = profile.displayName;
            user.avatar = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : user.avatar;
            await user.save();
            return done(null, user); // Pass user to the next step
          }

          // If user does not exist, create a new user
          const newUser = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null,
            avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null,
          });

          return done(null, newUser); // Pass the new user
        } catch (err) {
          console.error('Error during Google OAuth strategy:', err);
          return done(err, null);
        }
      }
    )
  );

  console.log('✅ Google authentication strategy configured successfully.');

} catch (error) {
  console.error('❌ Failed to configure Google authentication strategy:', error.message);
}


// --- JWT Strategy for protecting routes ---
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

passport.use(
  new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
    try {
      const user = await User.findById(jwt_payload.id);
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (err) {
      return done(err, false);
    }
  })
);


// --- Session Management (required by Passport) ---
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done)=>{
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Export the configured passport instance
module.exports = passport;