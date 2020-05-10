const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../../db/User');

// Authenticate user using passport's local strategy
// function Initialize(passport) {
//   passport.use(new LocalStrategy({ usernameField: 'username', passReqToCallBack : true }, (username, password, done) => {
//     // Check if user exist
//     User.findOne({ username_lower: username.toLowerCase() })
//       .then((user) => {
//         if (!user) {
//           console.log('User is not found');
//           return done(null, false, { message: 'Invalid username. Please check your username.' });
//         }

//         // Compare enter password and hashed password
//         bcrypt.compare(password, user.password, (error, isMatch) => {
//           if (error) {
//             console.log(error);
//             throw error;
//           }

//           if (isMatch) {
//             console.log('Matched')
//             return done(null, user);
//           } else {
//             console.log('Not matched');
//             return done(null, false, { message: 'Incorrest password! Please check your password.' });
//           }
//         });
//       })
//       .catch((error) => console.log(error));
//   }));

//   // Serialize then deserialize user in order to establish a session
//   passport.serializeUser((user, done) => {
//     done(null, user.id);
//   });

//   passport.deserializeUser((id, done) => {
//     User.findById(id, (err, user) => {
//       done(err, user);
//     });
//   });
// };

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

module.exports = Initialize;