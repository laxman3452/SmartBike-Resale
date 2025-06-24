// controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcrypt');

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).select('-password -registerOtp -otp');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User profile fetched successfully',
      user
    });

  } catch (err) {
    console.error('❌ Error fetching user profile:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new passwords are required' });
    }

    const user = await User.findById(userId);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save(); // pre('save') will hash new password

    res.status(200).json({ message: 'Password updated successfully' });

  } catch (err) {
    console.error('❌ Error in changePassword:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.uploadAvatarImage = async (req, res) => {
  try {
    const userId = req.userId;

    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: 'No avatar image provided' });
    }

    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    user.avatar = req.file.path; // Cloudinary image URL
    await user.save();

    res.status(200).json({
      message: 'Avatar uploaded successfully',
      avatarUrl: user.avatar
    });

  } catch (err) {
    console.error('❌ Error uploading avatar:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};