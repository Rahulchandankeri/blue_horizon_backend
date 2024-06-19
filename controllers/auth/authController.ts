import { NextFunction, Request, Response } from 'express';
import User, { IUser } from '../../models/auth/userModel';
import { sendVerificationEmail } from '../../utils/sendVerificationMail';
import { generateSecureNumericOTP } from '../../utils/generateOTP';
import { promisify } from 'util';
import SUCCESS_CODES from '../../constants/successCode';

const { body, validationResult } = require('express-validator');
const AppError = require('../../utils/appError');

const jwt = require('jsonwebtoken');

type Troles = ['user', 'admin', 'super_admin'];

declare global {
  namespace Express {
    interface Request {
      user?: IUser; // Define 'user' property on Request with type IUser
    }
  }
}
const validateEmail = [
  body('email_id', 'Enter valid email').trim().escape().normalizeEmail().isEmail(),

  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      next(new AppError('valid email-id is required', 400, 'email_0'));
    }
    next();
  },
];

exports.signup = async (req: Request, res: Response, next: NextFunction) => {
  const { email_id } = req.body;

  try {
    const _otp = Number(generateSecureNumericOTP(5));

    const existingUser = await User.findOne({ email_id });

    if (!existingUser) {
      const newUser = await User.create({
        email_id,
        user_id: (Date.now() + Math.random()).toFixed(0),
        otp: _otp,
      });

      handleVerification(newUser, _otp, res);
    }
    if (existingUser) {
      existingUser.otp = _otp;
      existingUser.save();
    }

    handleVerification(existingUser, _otp, res);
  } catch (error) {
    //
  } finally {
  }
};

// GENERATE JWT TOKEN
const generate_JWT_Token = (id: any) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY });
  return token;
};

// VERIFY USER OTP
exports.verifyOTP = async (req: Request, res: Response, next: NextFunction) => {
  const { email_id, otp } = req.body;
  try {
    // ONCE OTP IS SENT TO EMAIL - WE RECEIVE OTP & EMAIL FROM CLIENT

    // FIND USER BASED ON EMAIL & OTP
    const user: any = await User.findOne({ email_id, otp });

    // IF USER NOT FOUND OR OTP DOES NOT MATCH - THROW ERROR
    if (!user) throw next(new AppError('Invalid OTP / Has been expired', 400, 'otp0'));

    // IF USER EXISTS GENRATE JWT TOKEN
    const accessToken = generate_JWT_Token(user._id);

    // SET OTP AS UNDEFINED - IMMEDIATELY AFTER GENRATING TOKEN
    user.otp = undefined;
    user.save();

    const jwtExpiry: any = process.env.JWT_EXPIRY ? process.env.JWT_EXPIRY.slice(0, 1) : 1;

    res
      .status(201)
      .cookie('accessToken', accessToken, {
        expires: new Date(Date.now() + jwtExpiry * 24 * 60 * 60 * 1000),
        httpOnly: false,
        secure: false,
        path: '/',
      })
      .json({
        status: 'success',
        responseCode: SUCCESS_CODES.LOGIN_SUCCESS,
        userDetails: {
          email: user.email_id,
          accessToken,
        },
      });
  } catch (error: any) {
    res.status(400).json({
      status: 'Fail',
      message: error?.message,
    });
  }
};
const handleVerification = async (user: any, otp: number, res: Response) => {
  try {
    const hasSent: boolean = await sendVerificationEmail(user, otp);

    if (hasSent) {
      res.status(200).json({
        status: 'success',
        responseCode: SUCCESS_CODES.OTP_SENT,
        message: 'Please check your email id',
      });
    } else {
      res.status(400).json({
        status: 'Fail',
        responseCode: 'auth0',
        message: 'Failed',
      });
    }
  } catch (error) {
    //
  }
};

// VERIFY USER
const protectedRoutes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token = '';
    const authCookie = req.headers.authorization;

    if (authCookie && authCookie.startsWith('Bearer ')) {
      token = authCookie.substring('Bearer '.length);
    }
    if (!token) throw new AppError('You are not logged in!', 403, 'err403');

    // VERIFY TOKEN
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // FIND USER BASED ON DECODED
    const currentUser = await User.findById(decoded.id);

    // CHECK IF USER STILL EXISTS
    if (!currentUser) new AppError('The user does not exist!', 401, 'err401');

    req.user = currentUser!.toObject() as IUser;
    next();
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      error: error?.message,
    });
  }
};

const restrictAccessTo = (...roles: Troles) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !roles.includes(req.user.role))
        new AppError('You do not have permission to perform this action', 403, 'err403');
      next();
    } catch (error: any) {
      res.status(401).json({
        status: 'Fail',
        error: error?.message,
      });
    }
  };
};

export { protectedRoutes, validateEmail, restrictAccessTo };
