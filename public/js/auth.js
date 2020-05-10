// Ensures that current user is authenticated
// Redirect if user is not authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  req.flash('error_alert', 'Please log in to view the dashboard.');
  res.redirect('/user/signin');
}

// Redirect user to dashboard if user is already logged in
function forwardAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }

  res.redirect('/dashboard');
}

module.exports = {
  ensureAuthenticated: ensureAuthenticated,
  forwardAuthenticated: forwardAuthenticated
}