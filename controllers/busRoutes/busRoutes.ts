import { NextFunction, Request, Response, response } from 'express';
import Route from '../../models/routes/routeModel';
import AppError from '../../utils/appError';
import Razorpay from 'razorpay';
import Booking from '../../models/bus/booking';
import Payments from '../../models/bus/payment';
import User from '../../models/auth/userModel';

const createRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { source, destination } = req.body;

    if (!source || !destination) new AppError(`Source / Destination missing`, 400, 'ERR');

    const newRoute = await Route.create({ source, destination });

    res.status(200).json({
      status: 'sucess',
      responseCode: 'ROUTE_CREATED',
      routeDetails: {
        source: newRoute.source,
        destination: newRoute.destination,
      },
    });
  } catch (error: any) {
    console.log(error?.message);
    res.status(400).json({
      status: 'fail',
      responseCode: 'ROUTE_CREATE_FAIL',
      message: error?.message,
    });
  }
};
// ASSIGN BUS

const assignBus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    //
  } catch (error) {
    //
  }
};

const getBusRoutes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { source, destination, date } = req.body;

    const availableRoutes = await Route.find({
      source,
      destination,
    });

    res.status(200).json({
      status: 'success',
      responseCode: 'ROUTES_FOUND',
      availableRoutes,
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      responseCode: 'ROUTES_NOR_FOUND',
    });
  }
};
declare var process: {
  env: {
    RAZOR_KEY_ID: string;
    RAZOR_KEY_SECRET: string;
  };
};

const razorpay = new Razorpay({
  key_id: process.env.RAZOR_KEY_ID,
  key_secret: process.env.RAZOR_KEY_SECRET,
});

const initiateBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    const { name, email_id } = req.body;

    const newBooking = await Booking.create({
      name,
      email_id,
      userId: user?.user_id,
      user: user?._id,
    });
    res.status(201).json({ message: 'Booking created successfully', booking_id: newBooking.booking_id });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: 'Booking failed' });
  }
};
const createBusBooking = async (req: Request, res: Response, next: NextFunction) => {
  const { amount, currency = 'INR', receipt, booking_id } = req.body;
  try {
    const user: any = req.user;
    const currentUser = await User.findById(user._id);
    console.log(currentUser, booking_id);
    const booking = await Booking.findOne({ booking_id });

    if (!currentUser || !booking) {
      return res.status(404).json({ message: 'User or booking not found' });
    }

    const response = await razorpay.orders.create({
      amount: amount * 100, // Amount in paise
      currency,
      receipt: `booking_${booking.booking_id}`,
    });

    res.json({
      orderId: response.id,
      currency: response.currency,
      amount: response.amount,
    });
  } catch (error: any) {
    new AppError(error?.message, 404, 'Error');
    res.status(500).send(error);
  }
};
const busBookingSuccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { razorpay_payment_id, orderId, signature, amount } = req.body;

    const response = await razorpay.payments.capture(razorpay_payment_id, amount, 'INR');

    const razorpayPayment = await razorpay.payments.fetch(razorpay_payment_id);

    const { order_id: razorpayOrderId, notes, amount: paidAmount, status } = razorpayPayment;

    if (status === 'captured') {
      const booking = await Booking.findOne({ booking_id: notes.booking_id });

      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      console.log(`booking`, booking);
      const _user = req.user;
      // Create a record of the payment in your database
      const payment = await Payments.create({
        user: _user?._id,
        booking: booking._id,
        razorpayPaymentId: razorpay_payment_id,
        amount: +paidAmount / 100, // Convert amount back to rupees
        // Other payment details as needed
      });

      console.log(`payment`, payment);
      // Optionally, update booking status or perform other actions

      res.status(200).json({ message: 'Payment successful', responseCode: 'BOOKING_SUCCESS' });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: 'Payment not captured or failed' });
  }
};
export { createRoute, getBusRoutes, initiateBooking, createBusBooking, busBookingSuccess };
