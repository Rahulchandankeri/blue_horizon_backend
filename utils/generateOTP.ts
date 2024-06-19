/**
 * Generate a numeric OTP of the specified length
 * @param {number} length - The length of the OTP to generate
 * @returns {string} - The generated OTP
 */
export function generateSecureNumericOTP(length: any) {
  if (typeof length !== 'number' || length <= 0) {
    throw new Error('Invalid length. Length must be a positive number.');
  }

  const digits = '0123456789';
  let otp = '';
  let lastDigit: any = null;

  while (otp.length < length) {
    const randomDigit: any = digits[Math.floor(Math.random() * 10)];

    // Avoid sequential digits
    if (lastDigit !== null && Math.abs(lastDigit - randomDigit) === 1) {
      continue;
    }

    otp += randomDigit;
    lastDigit = randomDigit;
  }

  return otp;
}
