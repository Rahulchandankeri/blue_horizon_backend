import express from 'express';
import { createBus } from '../controllers/bus/bus';
import { protectedRoutes, validateEmail } from '../controllers/auth/authController';
import { busBookingSuccess, createBusBooking, initiateBooking } from '../controllers/busRoutes/busRoutes';
const router = express.Router();

router.post('/create', protectedRoutes, createBus);
router.post('/initiate-booking', validateEmail, protectedRoutes, initiateBooking);
router.post('/create-booking', protectedRoutes, createBusBooking);
router.post('/booking-success', protectedRoutes, busBookingSuccess);

export default router;
