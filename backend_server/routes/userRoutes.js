// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {uploadAvatar} = require('../middlewares/upload');


const { getUserProfile, changePassword, uploadAvatarImage } = require('../controllers/usercontroller');

router.get('/profile', authMiddleware, getUserProfile);
router.post('/change-password', authMiddleware, changePassword);
router.post('/profile/upload-avatar', authMiddleware, uploadAvatar.single('avatar'), uploadAvatarImage);

module.exports = router;
