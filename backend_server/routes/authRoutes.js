const express = require('express');
const router = express.Router();
const { register, verifyRegistration, forgotPassword, verifyOtpAndResetPassword } = require('../controllers/authController');

router.post('/register', register);
router.post('/register/verify/:id', verifyRegistration);
router.post('/login', require('../controllers/authController').login);
router.post('/forgot-password', forgotPassword);
router.post('/verify/otp', verifyOtpAndResetPassword);




module.exports = router;
