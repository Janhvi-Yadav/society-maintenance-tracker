const bcrypt = require('bcryptjs');
const User = require('../models/User');

// GET /auth/register - just shows the form
exports.getRegister = (req, res) => {
  res.render('auth/register', { title: 'Register' });
};

// POST /auth/register - creates a new resident account
exports.postRegister = async (req, res) => {
  try {
    const { name, email, password, flatNumber } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash('error', 'An account with this email already exists');
      return res.redirect('/auth/register');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
      flatNumber,
      role: 'resident'
    });

    req.flash('success', 'Account created! Please log in.');
    res.redirect('/auth/login');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong. Please try again.');
    res.redirect('/auth/register');
  }
};

// GET /auth/login
exports.getLogin = (req, res) => {
  res.render('auth/login', { title: 'Login' });
};

// POST /auth/login
exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/auth/login');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/auth/login');
    }

    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    // Save session first, THEN redirect
    // Without this the redirect fires before MongoDB saves the session
    // and the next page sees no session = stuck on login page
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        req.flash('error', 'Login failed, please try again');
        return res.redirect('/auth/login');
      }
      if (user.role === 'admin') {
        return res.redirect('/admin/dashboard');
      } else {
        return res.redirect('/resident/complaints');
      }
    });

  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong. Please try again.');
    res.redirect('/auth/login');
  }
};

// GET /auth/logout
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
};