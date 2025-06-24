const User = require('../models/User');
const sendEmail = require('../utils/SendEmail');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
const generateToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

exports.register = async (req, res) => {
  try {
    const { fullName, email, address, password } = req.body;
    let user = await User.findOne({ email });

    const otp = generateOtp();

    if (user && !user.isVerified) {
      user.fullName = fullName;
      user.address = address;
      user.password = password;
      user.registerOtp = otp;
      await user.save();
      await sendEmail(email, 'Verify Your Account on SmartBike-Resale', `Your OTP is ${otp}`);
      return res.status(200).json({
        message: 'OTP re-sent to your email',
        userId: user._id
      });
    }

    if (user) return res.status(400).json({ message: 'Email already registered and verified' });

    user = new User({ fullName, email, address, password, registerOtp: otp });
    await user.save();
    await sendEmail(email, 'Verify Your Account on SmartBike-Resale.', `Your OTP is ${otp}`);
    res.status(201).json({
        message: 'OTP sent to your email. Verify to complete registration',
        userId: user._id
    });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.verifyRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const { otp } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.isVerified) return res.status(400).json({ message: 'User already verified' });

    if (user.registerOtp === otp) {
      user.isVerified = true;
      user.registerOtp = null;
      await user.save();
      return res.status(200).json({ message: 'Account verified successfully' });
    }

    res.status(400).json({ message: 'Invalid OTP' });

  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    if (!user.isVerified) {
      const otp = generateOtp();
      user.registerOtp = otp;
      await user.save();
      await sendEmail(user.email, 'Verify Your Account', `Your OTP is ${otp}`);
      return res.status(401).json({
        message: 'Account not verified. OTP sent to your email',
        userId: user._id
      });
    }

    const accessToken = generateToken(user._id);
    user.accessToken = accessToken;
    await user.save();

    const { password: _, registerOtp, ...userData } = user.toObject();

    res.status(200).json({
      message: 'Login successful',
      accessToken,
      user: userData
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (!user || !user.isVerified) {
      return res.status(404).json({ message: 'User not found or not verified' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

    user.otp = otp;
    await user.save();

    console.log("Sending OTP to:", email);

    await sendEmail(
      email, // ✅ Make sure this is a string
      'Password Reset OTP',
      `Your OTP for password reset is: ${otp}`
    );

    res.status(200).json({ message: 'OTP sent to your email' });
  } catch (err) {
    console.error("Send email failed:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


// POST /api/v1/auth/verify/otp
exports.verifyOtpAndResetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user || user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid email or OTP' });
    }

    user.password = newPassword;
    user.otp = null; // Clear the OTP after use
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
