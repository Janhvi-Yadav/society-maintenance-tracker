const express = require('express');
const router = express.Router();
const residentController = require('../controllers/residentController');
const { isLoggedIn, isResident } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Every route here requires the user to be logged in AND a resident
router.use(isLoggedIn, isResident);

router.get('/complaints', residentController.listComplaints);
router.get('/complaints/new', residentController.getNewComplaint);
// upload.single('photo') runs multer just for this one route, expecting
// a file field named "photo" from the form
router.post('/complaints', upload.single('photo'), residentController.createComplaint);
router.get('/complaints/:id', residentController.viewComplaint);

router.get('/notices', residentController.viewNotices);

module.exports = router;
