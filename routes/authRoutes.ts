import { validateEmail } from '../controllers/auth/authController';

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth/authController');

router.route('/signup').post(validateEmail, authController.signup);
router.route('/validate-otp').post(validateEmail, authController.verifyOTP);

module.exports = router;
