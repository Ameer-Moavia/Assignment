const express = require('express');
const router = express.Router();
const {
    signup, login, sendOtp, verifyOtp,
    requestPasswordReset, resetPassword
} = require('../controllers/auth.controller');

router.post('/signup', signup);
router.post('/login', login);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

module.exports = router;
