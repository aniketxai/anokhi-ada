import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

try {
  const info = await transporter.sendMail({
    from: process.env.SMTP_USER,

    to: 'aniketxai@gmail.com',

    subject: 'SMTP Test',

    text: 'Mail working successfully',
  });

  
} catch (err) {
  
}