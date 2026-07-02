const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Instead of saving to local disk (public/uploads/),
// we now save directly to Cloudinary.
// The file URL returned by Cloudinary is what gets stored in the database.
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'society-tracker/complaints', // folder name inside your Cloudinary account
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, crop: 'limit' }] // resize large images automatically
  }
});

// Only allow image files, cap size at 5MB
function fileFilter(req, file, cb) {
  const allowed = /jpeg|jpg|png|webp/;
  const isAllowed = allowed.test(file.mimetype);
  if (isAllowed) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed'));
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = upload;
