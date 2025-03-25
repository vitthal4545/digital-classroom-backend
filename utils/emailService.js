const nodemailer = require("nodemailer");

require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTP = async () => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP for Digital Classroom Signup",
    text: `Your OTP for signUp is: ${otp}. It will expire in 5 minutes`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendOTP;
