import { NextFunction, Request, Response } from 'express';
import Payments from '../../models/bus/payment';
import mongoose from 'mongoose';

const getBookings = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  try {
    const bookings = await Payments.aggregate([
      {
        $match: { user: user?._id },
      },
      {
        $lookup: {
          from: 'bookings', // Name of the collection to join with
          localField: 'booking', // Field in the Payments collection
          foreignField: '_id', // Field in the Bookings collection
          as: 'bookings', // Name for the joined field (array)
        },
      },
      {
        $unwind: '$bookings', // Unwind the bookings array
      },
      {
        $group: {
          _id: null,
          bookingDetails: {
            $push: '$bookings', // Push each booking into the bookingDetails array
          },
        },
      },
      {
        $project: {
          _id: 0, // Exclude _id field
          __v: 0, // Exclude __v field
          'bookingDetails._id': 0, // Exclude _id field from nested bookings
          'bookingDetails.__v': 0, // Exclude __v field from nested bookings
          'bookingDetails.date': 0, // Exclude date field from nested bookings
          'bookingDetails.user': 0, // Exclude user field from nested bookings
        },
      },
    ]);

    res.status(200).json({
      bookingDetails: bookings?.[0]?.bookingDetails,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error,
    });
  }
};

export { getBookings };
