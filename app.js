require('dotenv').config();


const fs = require('fs');

if (!fs.existsSync('public/uploads/complaints')) {
  fs.mkdirSync('public/uploads/complaints', { recursive: true });
}

const express = require('express');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const methodOverride = require('method-override');

const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const residentRoutes = require('./routes/resident');
const adminRoutes = require('./routes/admin');

const app = express();

// 1. Connect to MongoDB
connectDB();

// 2. View engine - EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 3. Body parsers - so we can read form data (req.body)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 4. Allows HTML forms to send PUT/DELETE requests using ?_method=DELETE etc.
app.use(methodOverride('_method'));

// 5. Serve static files (CSS, client JS, uploaded photos)
app.use(express.static(path.join(__dirname, 'public')));

// 6. Sessions - stored in MongoDB so logins survive server restarts
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-change-me',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ 
    mongoUrl: process.env.MONGO_URI,
    touchAfter: 24 * 3600
  }),
  cookie: { 
    maxAge: 1000 * 60 * 60 * 24,
    secure: false
  }
}));


app.use(flash());


app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// 9. Routes
app.use('/auth', authRoutes);
app.use('/resident', residentRoutes);
app.use('/admin', adminRoutes);

// Home route - redirect based on login status
app.get('/', (req, res) => {
  if (!req.session.user) return res.redirect('/auth/login');
  if (req.session.user.role === 'admin') return res.redirect('/admin/dashboard');
  return res.redirect('/resident/complaints');
});

// 10. Catch-all 404
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
