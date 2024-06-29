import { NextFunction, Request, Response } from 'express';

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  res.status(err.statusCode).json({
    status: err.status,
    errorCode: err.errorCode,
    message: String(process.env.NODE_ENV).trim() === 'dev' ? err.message : 'Something went wrong!',
  });
};
