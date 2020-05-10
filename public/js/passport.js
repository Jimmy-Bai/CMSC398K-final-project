const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../../db/User');

// Initialize passport using local strategy authentication
function Initialize(passport) {
  const AuthenticateUser = async (username, password, done) => {
    // Check if user exist
    const user = await User.findOne({ username_lower: username.toLowerCase() });

    if (!user) {
      console.log('User is not found');
      return done(null, false, { message: 'Invalid username. Please check your username.' });
    }

    // Compare password if user is found
    if (await bcrypt.compare(password, user.password)) {
      return done(null, user);
    } else {
      return done(null, false, { message: 'Incorrest password! Please check your password.' });
    }
  }

  // User LocalStrategy for authentication and serialization
  passport.use(new LocalStrategy({ usernameField: 'username', passReqToCallBack: true }, AuthenticateUser));
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
};

module.exports = {
  Initialize: Initialize
}