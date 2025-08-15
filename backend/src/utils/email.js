// src/utils/email.js
require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,                // smtp.gmail.com
  port: Number(process.env.SMTP_PORT),        // 465
  secure: process.env.SMTP_SECURE === 'true', // true for 465
  auth: {
    user: process.env.SMTP_USER,              // yourgmail@gmail.com
    pass: process.env.SMTP_PASS               // 16-char app password
  }
});

async function sendEmail(to, subject, text, html) {
  const info = await transporter.sendMail({
    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
    to,
    subject,
    text,
    html
  });
  return info;
}

module.exports = { sendEmail };
