const nodemailer = require('nodemailer');

// TRANSPORT
const transport = {
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_FROM_EMAIL,
    pass: process.env.SMTP_FROM_PASS,
  },
};

// TRANSPORTER
const transporter = nodemailer.createTransport(transport);
transporter.verify((err: Error, success: any) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`Connection to mail success!`);
  }
});

module.exports = transporter;
