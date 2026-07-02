const mongoose = require('mongoose');

// We only ever expect ONE document in this collection.
// It stores app-wide settings that admin can change without touching code.
const settingsSchema = new mongoose.Schema({
  overdueThresholdDays: {
    type: Number,
    default: 5    // a complaint becomes "overdue" if it stays Open/In Progress for this many days
  }
});

module.exports = mongoose.model('Settings', settingsSchema);
