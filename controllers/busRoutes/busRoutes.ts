import { NextFunction, Request, Response } from 'express';
import Route from '../../models/routes/routeModel';
import AppError from '../../utils/appError';
import Razorpay from 'razorpay';
import Booking from '../../models/bus/booking';
import Payments from '../../models/bus/payment';
import User from '../../models/auth/userModel';
import Bus from '../../models/bus/busModel';

const createRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { source, destination, departure, arrival, price } = req.body;

    if (!source || !destination) new AppError(`Source / Destination missing`, 400, 'ERR');
    if (!departure || !arrival) new AppError(`Departure / arrival missing`, 400, 'ERR');

    const newRoute = await Route.create({ source, destination, departure, arrival, price });

    res.status(200).json({
      status: 'sucess',
      responseCode: 'ROUTE_CREATED',
      routeDetails: {
        source: newRoute.source,
        destination: newRoute.destination,
        departure: newRoute.departure,
        arrival: newRoute.arrival,
        route_id: newRoute.route_id,
        price: newRoute.price,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      responseCode: 'ROUTE_CREATE_FAIL',
      message: error?.message,
    });
  }
};
// ASSIGN BUS

const assignBusToRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bus_id, route_id, journeyDate } = req.body;

    if (!journeyDate) {
      throw new AppError(`Journey date required`, 404, `Err`);
    }
    const bus = await Bus.findOne({ bus_id });
    if (!bus) {
      return res.status(404).send({ error: 'Bus not found' });
    }
    if (bus.isAssociatedWithRoute) {
      throw new AppError(`Bus already assigned on other route`, 404, 'Err');
    }
    const route = await Route.findOne({ route_id });
    if (!route) {
      return res.status(404).send({ error: 'Route not found' });
    }

    bus.route_id = route?._id;
    bus.journeyDate = journeyDate;
    bus.isAssociatedWithRoute = true;
    await bus.save();

    res.status(200).json({
      bus,
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error?.message,
    });
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

const helloWorld = (req: Request, res: Response, next: NextFunction) => {
  res.send(`Hello`);
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
    const { name, email_id, source, destination, journeyDate } = req.body;

    const newBooking = await Booking.create({
      name,
      email_id,
      userId: user?.user_id,
      user: user?._id,
      source,
      destination,
      journeyDate,
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
      await Booking.updateOne({
        paymentStatus: 'success',
      });
      const _user = req.user;

      const payment = await Payments.create({
        user: _user?._id,
        booking: booking._id,
        razorpayPaymentId: razorpay_payment_id,
        amount: +paidAmount / 100, // Convert amount back to rupees
      });

      res.status(200).json({ message: 'Payment successful', responseCode: 'BOOKING_SUCCESS' });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: 'Payment not captured or failed' });
  }
};

const getAvailableBusOnRoutes = async (req: Request, res: Response, next: NextFunction) => {
  const { source, destination, journeyDate } = req.body;

  try {
    const routes = await Route.find({ source, destination });
    if (routes.length === 0) {
      return res.status(404).send({ error: 'No routes found' });
    }
    const [day, month, year] = journeyDate.split('/');

    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    const routeIds = routes.map((route) => route._id);
    const buses = await Bus.find({
      route_id: { $in: routeIds },
      journeyDate: journeyDate,
    });
    let _routes: any = [];

    routes?.forEach((trip) => {
      _routes.push({
        source: trip?.source,
        destination: trip?.destination,
        departure: trip?.departure,
        arrival: trip?.arrival,
        price: trip?.price,
      });
    });

    res.status(200).json({
      availableTrips: _routes,
    });
  } catch (error) {
    res.status(400).send(error);
  }
};
export {
  createRoute,
  getBusRoutes,
  initiateBooking,
  createBusBooking,
  busBookingSuccess,
  assignBusToRoute,
  getAvailableBusOnRoutes,
  helloWorld,
};
