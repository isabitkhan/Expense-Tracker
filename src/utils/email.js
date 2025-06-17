import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOtpEmail = async (email, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "🔐 OTP Verification",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f4f6f8; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #2e86de;">OTP Verification</h2>
        <p style="font-size: 16px; color: #333;">Hello,</p>
        <p style="font-size: 16px; color: #333;">
          Use the following One-Time Password (OTP) to verify your email address.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 24px; font-weight: bold; color: #2e86de; letter-spacing: 2px;">${otp}</span>
        </div>
        <p style="font-size: 15px; color: #d9534f; font-weight: bold;">
          ⚠️ This OTP is valid for <strong>60 seconds only</strong>. Please complete your verification promptly.
        </p>
        <p style="font-size: 14px; color: #555;">
          If you didn’t request this code, please ignore this email or contact support if you have concerns.
        </p>
        <p style="margin-top: 40px; font-size: 14px; color: #999;">
          Regards,<br/>
          The Your Company Team
        </p>
      </div>
    `,
  });
};


export const resendOtpEmail = async (email, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "🔁 Resend OTP Verification",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f4f6f8; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #e67e22;">Your OTP Has Been Resent</h2>
        <p style="font-size: 16px; color: #333;">Hello,</p>
        <p style="font-size: 16px; color: #333;">
          Here's your new One-Time Password (OTP) for email verification:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 24px; font-weight: bold; color: #e67e22; letter-spacing: 2px;">${otp}</span>
        </div>
        <p style="font-size: 15px; color: #d9534f; font-weight: bold;">
          ⚠️ This OTP is valid for <strong>60 seconds only</strong>. Please verify quickly.
        </p>
        <p style="font-size: 14px; color: #555;">
          If you didn’t request this, ignore this email or contact support.
        </p>
        <p style="margin-top: 40px; font-size: 14px; color: #999;">
          Regards,<br/>
          The Your Company Team
        </p>
      </div>
    `,
  });
};

export const sendSuccessVerificationEmail = async (email) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "✅ Email Verified Successfully",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f0fff0; border: 1px solid #c1e1c1; border-radius: 8px;">
        <h2 style="color: #28a745;">🎉 Email Verified!</h2>
        <p style="font-size: 16px; color: #333;">
          Congratulations! Your email has been successfully verified.
        </p>
        <p style="font-size: 14px; color: #666;">
          You can now access all features of your account. If you have any questions, feel free to reach out to support.
        </p>
        <p style="margin-top: 40px; font-size: 14px; color: #999;">
          Regards,<br/>
          The Your Company Team
        </p>
      </div>
    `,
  });
};

export const sendResetPasswordEmail = async (email, resetLink) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "🔐 Reset Your Password",
    html: `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}" target="_blank">${resetLink}</a>
      <p>This link will expire in 10 minutes.</p>
    `,
  });
};
