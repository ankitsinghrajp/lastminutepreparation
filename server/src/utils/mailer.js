import { configDotenv } from "dotenv";
import nodemailer from "nodemailer";
configDotenv();
export const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === "true",
    auth:{
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});


export async function sendVerificationEmail(toEmail, token, userId) {
  const frontEndVerifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}&id=${userId}`;

  const text = `
Hi there,

Thank you for signing up for LastMinutePreparation! 
To complete your registration, please verify your email address by clicking the link below:

${frontEndVerifyUrl}

If you did not create an account, you can safely ignore this email.

Best regards,
The LastMinutePreparation Team
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: "Verify your email address – LastMinutePreparation",
    text,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Verify your email address</h2>
        <p>Hi there,</p>
        <p>Thank you for joining <strong>LastMinutePreparation</strong>! Please verify your email address to activate your account.</p>
        <p style="margin: 20px 0;">
          <a href="${frontEndVerifyUrl}" style="background-color: #4f46e5; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
        </p>
        <p>If the button above doesn’t work, copy and paste this link into your browser:</p>
        <p><a href="${frontEndVerifyUrl}" style="color: #4f46e5;">${frontEndVerifyUrl}</a></p>
        <p>If you didn’t create an account, please ignore this email.</p>
        <br/>
        <p>Best regards,<br/>
        <strong>The LastMinutePreparation Team</strong></p>
      </div>
    `,
  });
}
