const Complaint = require('../models/Complaint');
const Notice = require('../models/Notice');

// GET /resident/complaints - lists all complaints raised by this resident
exports.listComplaints = async (req, res) => {
  const complaints = await Complaint.find({ resident: req.session.user.id })
    .sort({ createdAt: -1 }); // newest first

  res.render('resident/complaints', {
    title: 'My Complaints',
    complaints
  });
};

// GET /resident/complaints/new - shows the "raise a complaint" form
exports.getNewComplaint = (req, res) => {
  res.render('resident/new-complaint', { title: 'Raise a Complaint' });
};

// POST /resident/complaints - creates a new complaint
exports.createComplaint = async (req, res) => {
  try {
    const { category, description } = req.body;

    // req.file is set by multer if a photo was uploaded (it's optional)
    // req.file.path is the full Cloudinary URL (e.g. https://res.cloudinary.com/...)
    const photo = req.file ? req.file.path : null;

    await Complaint.create({
      resident: req.session.user.id,
      category,
      description,
      photo,
      status: 'Open',
      // Every complaint starts with one history entry recording its creation
      history: [{
        status: 'Open',
        changedBy: req.session.user.id,
        note: 'Complaint raised',
        changedAt: new Date()
      }]
    });

    req.flash('success', 'Complaint submitted successfully');
    res.redirect('/resident/complaints');
  } catch (err) {
    console.error(err);
    req.flash('error', err.message || 'Could not submit complaint');
    res.redirect('/resident/complaints/new');
  }
};

// GET /resident/complaints/:id - view one complaint with its full history
exports.viewComplaint = async (req, res) => {
  const complaint = await Complaint.findOne({
    _id: req.params.id,
    resident: req.session.user.id // make sure residents can only see their OWN complaints
  }).populate('history.changedBy', 'name role');

  if (!complaint) {
    req.flash('error', 'Complaint not found');
    return res.redirect('/resident/complaints');
  }

  res.render('resident/complaint-detail', {
    title: 'Complaint Details',
    complaint
  });
};

// GET /resident/notices - view the notice board
exports.viewNotices = async (req, res) => {
  // Important notices first (pinned), then newest first within each group
  const notices = await Notice.find()
    .sort({ isImportant: -1, createdAt: -1 })
    .populate('postedBy', 'name');

  res.render('resident/notices', { title: 'Notice Board', notices });
};
