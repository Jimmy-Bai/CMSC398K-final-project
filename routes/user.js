const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');

const User = require('../db/User');
const UserProfile = require('../db/UserProfile');
const router = express.Router();

module.exports = function (io) {
  // Render user sign up page
  router.get('/signup', function (req, res) {
    res.render('user_sign_up');
  });

  // Render user sign in page
  router.get('/signin', function (req, res) {
    // console.log(auth_error);
    res.render('user_sign_in');
  });

  // Sign up Handler
  router.post('/signup', async function (req, res) {
    const { email: _email,
      username: _username,
      password: _password,
      password2: _password2
    } = req.body;
    const _uuid = Date.now().valueOf();
    const userDB = await User.findOne({ username_lower: _username.toLowerCase() });
    const emailDB = await User.findOne({ email_lower: _email.toLowerCase() });
    let msg = [];

    // Validate fields
    // Validate correct email format
    if (!_email.match(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/g)) {
      msg.push({ msg: 'Not a valid email address. Please check and retype email.' });
    }

    // Validate user does not exist
    if (userDB) {
      msg.push({ msg: 'Username already exist. Please change your username.' });
    }

    // Validate email does not exist
    if (emailDB) {
      msg.push({ msg: 'Email address already exist for another account. Please change your email.' });
    }

    // Validate passwords are equal
    if (_password != _password2) {
      msg.push({ msg: 'Password does not match! Please check and retype password.' });
    }

    // DEBUG
    msg.forEach(element => console.log(`MESSAGE: ${element.msg}`));
    // Rerender current page with the info if not all fields are validated
    // Else add new user to database
    if (msg.length > 0) {
      res.render('user_sign_up', {
        msg: msg,
        email: _email,
        username: _username,
        password: _password,
        password2: _password2
      });
    } else {
      // Create new user
      const newUser = new User({
        email: _email,
        email_lower: _email.toLowerCase(),
        username: _username,
        username_lower: _username.toLowerCase(),
        password: _password,
        uuid: _uuid
      });

      // Create new user profile
      const newUserProfile = new UserProfile({
        username: _username,
        uuid: _uuid
      });

      // Hash password using bcrypt
      bcrypt.genSalt(10, (error, salt) => {
        if (error) {
          console.log(error);
          throw error;
        } else {
          bcrypt.hash(newUser.password, salt, async (error, hash) => {
            if (error) {
              console.log(error);
              throw error;
            } else {
              // Save hashed password to new user
              newUser.password = hash;

              // Save new user and new user profile to database
              await newUserProfile.save();
              await newUser.save();
              req.flash('success_alert', 'You have been registered! You can now sign in.');
              res.redirect('/user/signin');
            }
          });
        }
      });
    }
  });

  // Sign in Handler
  router.post('/signin', function (req, res, next) {
    passport.authenticate('local', {
      successRedirect: '/dashboard',
      failureRedirect: '/user/signin',
      failureFlash: true
    })(req, res, next);
  });

  // Sign out Handler
  router.get('/logout', function (req, res) {
    req.logout();
    req.flash('success_alert', 'You successfully logged out.');
    res.redirect('/user/signin');
  });

  return router;
};