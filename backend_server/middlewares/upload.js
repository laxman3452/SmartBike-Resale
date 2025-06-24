
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../utils/cloudinary'); 
const multer = require('multer');

// For bike uploads
const bikeStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'bike_uploads',
    allowed_formats: ['jpg', 'png', 'jpeg']
  }
});

// For avatar uploads
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'avatars',
    allowed_formats: ['jpg', 'png', 'jpeg']
  }
});

// Multer upload handlers
const uploadBike = multer({ storage: bikeStorage });
const uploadAvatar = multer({ storage: avatarStorage });

module.exports = {
  uploadBike,
  uploadAvatar
};
