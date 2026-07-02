const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isImportant: {
    type: Boolean,
    default: false   // important notices get pinned to the top of the board
  }
}, { timestamps: true });

module.exports = mongoose.model('Notice', noticeSchema);
