// These functions run BEFORE a route's main logic, to guard access.
// They are plugged into routes like: router.get('/dashboard', isLoggedIn, isAdmin, controllerFn)

// Blocks access if nobody is logged in
function isLoggedIn(req, res, next) {
  if (req.session.user) {
    return next(); // user is logged in, continue to the actual route
  }
  req.flash('error', 'Please log in to continue');
  res.redirect('/auth/login');
}

// Blocks access if the logged-in user isn't an admin
function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  req.flash('error', 'Admin access only');
  res.redirect('/auth/login');
}

// Blocks access if the logged-in user isn't a resident
function isResident(req, res, next) {
  if (req.session.user && req.session.user.role === 'resident') {
    return next();
  }
  req.flash('error', 'Resident access only');
  res.redirect('/auth/login');
}

module.exports = { isLoggedIn, isAdmin, isResident };
