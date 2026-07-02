const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isLoggedIn, isAdmin } = require('../middleware/auth');

// Every route here requires the user to be logged in AND an admin
router.use(isLoggedIn, isAdmin);

router.get('/dashboard', adminController.dashboard);

router.get('/complaints', adminController.listComplaints);
router.get('/complaints/:id', adminController.viewComplaint);
router.post('/complaints/:id/status', adminController.updateComplaint);

router.get('/notices', adminController.viewNotices);
router.post('/notices', adminController.createNotice);

router.get('/settings', adminController.getSettings);
router.post('/settings', adminController.updateSettings);

module.exports = router;
