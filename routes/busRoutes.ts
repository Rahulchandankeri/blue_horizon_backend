import express from 'express';
import { createBus } from '../controllers/bus/bus';
import { protectedRoutes, validateEmail } from '../controllers/auth/authController';
import {
  assignBusToRoute,
  busBookingSuccess,
  createBusBooking,
  getAvailableBusOnRoutes,
  initiateBooking,
} from '../controllers/busRoutes/busRoutes';
import { getBookings } from '../controllers/user/user';
const router = express.Router();

router.post('/create', protectedRoutes, createBus);
router.post('/initiate-booking', validateEmail, protectedRoutes, initiateBooking);
router.post('/create-booking', protectedRoutes, createBusBooking);
router.post('/complete-payment', protectedRoutes, busBookingSuccess);
router.post('/my-bookings', protectedRoutes, getBookings);
router.post('/assign-busToTrip', protectedRoutes, assignBusToRoute);
router.post('/getTrips', getAvailableBusOnRoutes);

export default router;
