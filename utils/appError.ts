class AppError extends Error {
  statusCode: number;
  errorCode: string;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: any, errorCode: string) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = String(process.env.NODE_ENV).trim() === 'dev' ? errorCode : '00';
    this.status = `${statusCode.toString().startsWith('4') ? 'Fail' : 'Error'}`;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
export default AppError;
module.exports = AppError;
