const cloudinary = require('cloudinary').v2;

// Reads your Cloudinary credentials from .env
// These are available on your Cloudinary dashboard (free account)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = cloudinary;
