import { protectedRoutes, validateEmail } from '../controllers/auth/authController';
import { getBookings } from '../controllers/user/user';

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth/authController');

router.route('/signup').post(validateEmail, authController.signup);
router.route('/validate-otp').post(validateEmail, authController.verifyOTP);
router.get('/get-bookings', protectedRoutes, getBookings);

export default router;
