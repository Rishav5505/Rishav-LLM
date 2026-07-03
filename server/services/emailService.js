import dotenv from 'dotenv';
dotenv.config();

/**
 * Dispatch transactional emails utilizing the Brevo v3 Transactional Email API.
 * Uses native fetch for modern, dependency-free HTTP requests.
 */
const sendMail = async ({ toEmail, toName, subject, htmlContent }) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.SENDER_EMAIL || 'rishavkumar33372@gmail.com';

  if (!apiKey) {
    console.error('Email Dispatch Failed: BREVO_API_KEY is not defined in server/.env');
    return false;
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: 'Rishav AI',
          email: senderEmail
        },
        to: [
          {
            email: toEmail,
            name: toName || toEmail
          }
        ],
        subject,
        htmlContent
      })
    });

    const result = await response.json();
    if (!response.ok) {
      console.error('Brevo API Error Response:', result);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Brevo Email Dispatch Exception:', error);
    return false;
  }
};

/**
 * Send account verification email containing confirmation link.
 */
export const sendVerificationEmail = async (toEmail, name, token, clientUrl) => {
  const url = `${clientUrl}/verify-email/${token}`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Verify your email</title>
      </head>
      <body style="font-family: sans-serif; background-color: #0b0f19; color: #f3f4f6; padding: 30px; margin: 0;">
        <div style="max-width: 550px; margin: 0 auto; background-color: #171d30; border: 1px solid #222b45; border-radius: 16px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.35);">
          <div style="text-align: center; margin-bottom: 25px;">
            <span style="font-size: 24px; font-weight: bold; color: #ffffff;">Rishav AI</span>
          </div>
          <h2 style="color: #ffffff; font-size: 20px; margin-top: 0;">Email Verification Required</h2>
          <p style="color: #9ca3af; font-size: 14px; line-height: 1.6;">
            Hello ${name},<br><br>
            Thank you for registering on Rishav AI. To complete your account registration and log in, please verify your email address by clicking the button below:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${url}" style="background-color: #740968; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 14px; padding: 12px 30px; border-radius: 8px; box-shadow: 0 4px 15px rgba(116,9,104,0.4); display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #6b7280; font-size: 12px; line-height: 1.6;">
            If the button doesn't work, copy and paste this URL into your browser:<br>
            <a href="${url}" style="color: #9c158d; text-decoration: none;">${url}</a>
          </p>
          <hr style="border: 0; border-top: 1px solid #222b45; margin: 25px 0;">
          <p style="color: #4b5563; font-size: 11px; text-align: center; margin: 0;">
            This email was sent automatically by Rishav AI. If you did not create an account, you can ignore this email.
          </p>
        </div>
      </body>
    </html>
  `;

  return await sendMail({
    toEmail,
    toName: name,
    subject: 'Rishav AI - Verify Your Email Address',
    htmlContent
  });
};

/**
 * Send password reset email containing OTP.
 */
export const sendOtpEmail = async (toEmail, name, otp) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Password OTP</title>
      </head>
      <body style="font-family: sans-serif; background-color: #0b0f19; color: #f3f4f6; padding: 30px; margin: 0;">
        <div style="max-width: 550px; margin: 0 auto; background-color: #171d30; border: 1px solid #222b45; border-radius: 16px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.35);">
          <div style="text-align: center; margin-bottom: 25px;">
            <span style="font-size: 24px; font-weight: bold; color: #ffffff;">Rishav AI</span>
          </div>
          <h2 style="color: #ffffff; font-size: 20px; margin-top: 0;">Password Reset OTP</h2>
          <p style="color: #9ca3af; font-size: 14px; line-height: 1.6;">
            Hello ${name},<br><br>
            We received a request to reset your password. Use the following One-Time Password (OTP) to complete the reset. This code is valid for <strong>10 minutes</strong>:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #0f1322; border: 1px solid #222b45; color: #9c158d; font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 6px; padding: 15px 30px; border-radius: 10px; display: inline-block; box-shadow: inset 0 0 10px rgba(0,0,0,0.5);">
              ${otp}
            </div>
          </div>
          <p style="color: #9ca3af; font-size: 13px; line-height: 1.6;">
            Please do not share this OTP code with anyone. If you did not request a password reset, you can safely ignore this email and your password will remain unchanged.
          </p>
          <hr style="border: 0; border-top: 1px solid #222b45; margin: 25px 0;">
          <p style="color: #4b5563; font-size: 11px; text-align: center; margin: 0;">
            This email was sent automatically by Rishav AI.
          </p>
        </div>
      </body>
    </html>
  `;

  return await sendMail({
    toEmail,
    toName: name,
    subject: 'Rishav AI - Password Reset OTP Code',
    htmlContent
  });
};
