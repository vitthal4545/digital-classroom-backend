const mongoose = require("mongoose");

const otpSchema = mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  expireAt: { type: Date, required: true, expires: 300 },
});

module.exports = mongoose.model("OTP", otpSchema);
