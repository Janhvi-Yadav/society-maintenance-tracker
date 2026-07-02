const mongoose = require('mongoose');

// This is a "sub-document" — every time the status changes, we push
// one of these into the complaint's history array. So the complaint
// carries its own timeline with it, instead of us needing a separate
// "ComplaintHistory" collection and joining it back later.
const historyEntrySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved'],
    required: true
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,   // which admin made this change
    ref: 'User'
  },
  note: {
    type: String,
    trim: true
  },
  changedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false }); // we don't need a separate id for each history line

const complaintSchema = new mongoose.Schema({
  resident: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['Plumbing', 'Electrical', 'Cleanliness', 'Security', 'Parking', 'Other'],
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  photo: {
    type: String   // stores the filename of the uploaded photo, e.g. "1719999999-leak.jpg"
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved'],
    default: 'Open'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  // The full timeline of status changes lives right here.
  // history[0] is auto-added when the complaint is first created (status: Open).
  history: [historyEntrySchema],

  // Set to true once an admin marks a long-open complaint as overdue.
  // We don't auto-calculate this on every page load — instead a small
  // helper function (see controllers/adminController.js) checks complaints
  // against a configurable "days threshold" and flags them. This keeps
  // overdue status explicit and easy to query (just filter isOverdue: true).
  isOverdue: {
    type: Boolean,
    default: false
  },
  resolvedAt: {
    type: Date    // set when status becomes "Resolved", used for record-keeping
  }
}, { timestamps: true }); // createdAt tells us when the complaint was raised

module.exports = mongoose.model('Complaint', complaintSchema);
