import { NextFunction, Request, Response, response } from 'express';
import Bus from '../../models/bus/busModel';
import SUCCESS_CODES from '../../constants/successCode';
import Route from '../../models/routes/routeModel';
const AppError = require('../../utils/appError');

const createBus = async (req: Request, res: Response, next: NextFunction) => {
  const { reg_number, totalSeats, capacity, variant } = req.body;

  if (!reg_number || totalSeats || capacity) {
    new AppError('Mandatory fields', 400);
  }

  try {
    const newBus = await Bus.create({
      reg_number,
      totalSeats,
      capacity,
      variant,
    });

    if (!newBus) new AppError('Something went wrong, While creating bus', 402, 'Error');

    const response = {
      reg_number: newBus.reg_number,
      totalSeats: newBus.totalSeats,
      capacity: newBus.capacity,
      variant: newBus.variant,
      bus_id: newBus?.bus_id,
    };

    res.status(200).json({
      status: 'success',
      responseCode: SUCCESS_CODES.BUS_CREATED,
      busDetails: {
        ...response,
      },
    });
  } catch (err: any) {
    console.log(err);
    if (err?.code === 11000 && err?.keyPattern && err?.keyPattern.reg_number === 1) {
      // Duplicate key error
      const errorResponse = {
        status: 'error',
        message: `Bus with registration number '${reg_number}' already exists.`,
      };
      return res.status(400).json(errorResponse);
    }

    res.status(400).json({
      status: 'fail',
      responseCode: 'An error occurred while creating the bus',
    });
  }
};

export { createBus };
