const mongoose = require('mongoose');

// One schema for both residents and admin.
// The "role" field decides what a user is allowed to do (checked in middleware/auth.js)
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,        // no two users can sign up with the same email
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true       // this stores the HASHED password, never plain text
  },
  flatNumber: {
    type: String,         // e.g. "A-101" — only used for residents
    trim: true
  },
  role: {
    type: String,
    enum: ['resident', 'admin'],   // only these two values are allowed
    default: 'resident'
  }
}, { timestamps: true }); // automatically adds createdAt / updatedAt

module.exports = mongoose.model('User', userSchema);
