import { transporter } from '../configs/mail.config';
import { InewUser } from '../controllers/auth/types/typesUser';

export const sendVerificationEmail = async (newUser: InewUser, otp: number) => {
  const mail = {
    from: process.env.SMTP_FROM_EMAIL,
    to: newUser?.email_id,
    subject: 'Verification Code For Blue Horizon',
    html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Verify your login</title>
<!--[if mso]><style type="text/css">body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }</style><![endif]-->
</head>

<body style="font-family: Helvetica, Arial, sans-serif; margin: 0px; padding: 0px; background-color: #ffffff;">
<table role="presentation"
style="width: 100%; border-collapse: collapse; border: 0px; border-spacing: 0px; font-family: Arial, Helvetica, sans-serif; background-color: rgb(239, 239, 239);">
<tbody>
  <tr>
    <td align="center" style="padding: 2rem 2rem; vertical-align: top; width: 100%;">
      <table role="presentation" style="max-width: 600px; border-collapse: collapse; border: 0px; border-spacing: 0px; text-align: left;">
        <tbody>
          <tr>
            <td style="padding: 40px 0px 0px;">
               
              <div style="padding: 20px; background-color: rgb(255, 255, 255);">
                <div style="color: rgb(0, 0, 0); text-align: left;">
                  <h1 style="margin: 1rem 0">Verification code</h1>
                  <p style="padding-bottom: 16px">Please use the verification code below to sign in.</p>
                  <p style="padding-bottom: 16px"><strong style="font-size: 130%">${otp}</strong></p>
                  <p style="padding-bottom: 16px">If you didn’t request this, you can ignore this email.</p>
                  <p style="padding-bottom: 16px">Thanks,<br>Rahul</p>
                </div>
              </div>
            
            </td>
          </tr>
        </tbody>
      </table>
    </td>
  </tr>
</tbody>
</table>
</body>

</html>`,
  };
  return new Promise<boolean>((resolve, reject) => {
    // SEND OTP TO EMAIL
    transporter.sendMail(mail, (err: any, data: any) => {
      // IF THERE IS ERROR SENDING EMAIL - REJECT WITH ERROR
      if (err) {
        console.error('Error sending email:', err);
        reject(false);
      } else {
        resolve(true);
      }
    });
  });
};
