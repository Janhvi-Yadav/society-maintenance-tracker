// Run this ONCE to create your admin account:
//   node seed-admin.js
//
// After running it, log in at /auth/login with the email/password below.
// You can change the values before running.

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function seedResident() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Change these before running if you want different credentials
  const email = 'admin@society.com';
  const password = 'admin123';
  const name = 'Admin';

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Admin already exists with this email. Exiting.');
    process.exit(0);
  }

  const hashed = await bcrypt.hash(password, 10);
  await User.create({ name, email, password: hashed, role: 'admin' });

  console.log('✅ Admin created!');
  console.log(`   Email   : ${email}`);
  console.log(`   Password: ${password}`);
  console.log('   Login at /auth/login');

  process.exit(0);
}

seedAdmin().catch(err => {
  console.error(err);
  process.exit(1);
});
