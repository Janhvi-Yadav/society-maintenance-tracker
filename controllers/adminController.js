const Complaint = require('../models/Complaint');
const Notice = require('../models/Notice');
const User = require('../models/User');
const Settings = require('../models/Settings');
const sendEmail = require('../config/mailer');

// Small helper: finds (or creates, on first run) the single settings document
async function getSettings() {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({}); // uses the default threshold from the model
  }
  return settings;
}

// Core overdue logic: any complaint that is NOT resolved, and was created
// more than `thresholdDays` ago, gets flagged. We run this check every time
// the admin opens their complaints list, so it's always up to date —
// no separate cron job needed for a project this size.
async function flagOverdueComplaints() {
  const settings = await getSettings();
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - settings.overdueThresholdDays);

  await Complaint.updateMany(
    {
      status: { $ne: 'Resolved' },     // still open or in progress
      createdAt: { $lt: thresholdDate }, // older than the threshold
      isOverdue: false                  // not already flagged
    },
    { $set: { isOverdue: true } }
  );
}

// GET /admin/complaints - list + filter all complaints
exports.listComplaints = async (req, res) => {
  await flagOverdueComplaints(); // keep overdue flags fresh on every visit

  const { category, status, date } = req.query;
  const filter = {};

  if (category) filter.category = category;
  if (status) filter.status = status;
  if (date) {
    // filter complaints raised on a specific day
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);
    filter.createdAt = { $gte: start, $lt: end };
  }

  // Overdue complaints surface at the top (isOverdue: true sorts first
  // because we sort descending — true is treated as 1, false as 0)
  const complaints = await Complaint.find(filter)
    .populate('resident', 'name flatNumber')
    .sort({ isOverdue: -1, createdAt: -1 });

  res.render('admin/complaints', {
    title: 'Manage Complaints',
    complaints,
    filters: { category, status, date } // sent back so the filter form can stay filled in
  });
};

// GET /admin/complaints/:id - view one complaint in detail
exports.viewComplaint = async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate('resident', 'name flatNumber email')
    .populate('history.changedBy', 'name role');

  if (!complaint) {
    req.flash('error', 'Complaint not found');
    return res.redirect('/admin/complaints');
  }

  res.render('admin/complaint-detail', { title: 'Complaint Details', complaint });
};

// POST /admin/complaints/:id/status - update status (and optionally priority + note)
exports.updateComplaint = async (req, res) => {
  try {
    const { status, priority, note } = req.body;
    const complaint = await Complaint.findById(req.params.id).populate('resident');

    if (!complaint) {
      req.flash('error', 'Complaint not found');
      return res.redirect('/admin/complaints');
    }

    const statusChanged = status && status !== complaint.status;

    if (priority) complaint.priority = priority;

    if (statusChanged) {
      complaint.status = status;

      // Record this change in history — this is the audit trail
      complaint.history.push({
        status,
        changedBy: req.session.user.id,
        note: note || '',
        changedAt: new Date()
      });

      // Once resolved, it's considered closed: stop tracking it as overdue
      // and stamp when it was resolved.
      if (status === 'Resolved') {
        complaint.isOverdue = false;
        complaint.resolvedAt = new Date();
      }
    }

    await complaint.save();

    // Email the resident if the status actually changed
    if (statusChanged) {
      sendEmail(
        complaint.resident.email,
        `Your complaint status changed to "${status}"`,
        `<p>Hi ${complaint.resident.name},</p>
         <p>Your complaint "<b>${complaint.category}</b>" is now marked as <b>${status}</b>.</p>
         ${note ? `<p>Note from admin: ${note}</p>` : ''}
         <p>- Society Maintenance Team</p>`
      );
    }

    req.flash('success', 'Complaint updated');
    res.redirect(`/admin/complaints/${complaint._id}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not update complaint');
    res.redirect('/admin/complaints');
  }
};

// GET /admin/dashboard - simple counts for the dashboard
exports.dashboard = async (req, res) => {
  await flagOverdueComplaints();

  // Group complaints by status, e.g. [{ _id: 'Open', count: 5 }, ...]
  const byStatus = await Complaint.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const byCategory = await Complaint.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);
const overdueCount = await Complaint.countDocuments({ isOverdue: true });
const totalCount = await Complaint.countDocuments();
 

const latestNotices = await Notice.find()
  .sort({ isImportant: -1, createdAt: -1 })
  .limit(3)
  .populate('postedBy', 'name');


res.render('admin/dashboard', {
  title: 'Dashboard',
  byStatus,
  byCategory,
  overdueCount,
  totalCount,
  latestNotices
});
};

// GET /admin/notices - admin's view of the notice board (with a post form)
exports.viewNotices = async (req, res) => {
  const notices = await Notice.find()
    .sort({ isImportant: -1, createdAt: -1 })
    .populate('postedBy', 'name');

  res.render('admin/notices', { title: 'Notice Board', notices });
};

// POST /admin/notices - post a new notice
exports.createNotice = async (req, res) => {
  try {
    const { title, content, isImportant } = req.body;

    await Notice.create({
      title,
      content,
      postedBy: req.session.user.id,
      isImportant: isImportant === 'on' // checkbox sends "on" when checked
    });

    // If marked important, email ALL residents about it
    if (isImportant === 'on') {
      const residents = await User.find({ role: 'resident' });
      residents.forEach(resident => {
        sendEmail(
          resident.email,
          `Important Notice: ${title}`,
          `<p>Hi ${resident.name},</p>
           <p>${content}</p>
           <p>- Society Maintenance Team</p>`
        );
      });
    }

    req.flash('success', 'Notice posted');
    res.redirect('/admin/notices');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not post notice');
    res.redirect('/admin/notices');
  }
};

// GET /admin/settings - configure the overdue threshold
exports.getSettings = async (req, res) => {
  const settings = await getSettings();
  res.render('admin/settings', { title: 'Settings', settings });
};

// POST /admin/settings - update the overdue threshold
exports.updateSettings = async (req, res) => {
  const settings = await getSettings();
  settings.overdueThresholdDays = Number(req.body.overdueThresholdDays);
  await settings.save();

  req.flash('success', 'Settings updated');
  res.redirect('/admin/settings');
};

// GET /admin/notices/new - separate page just for posting a notice
exports.getNewNotice = (req, res) => {
  res.render('admin/new-notice', { title: 'Post Notice' });
};
