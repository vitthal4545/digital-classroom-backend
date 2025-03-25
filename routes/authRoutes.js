const express = require("express");
const {
  sendOTP,
  verifyOTP,
  signup,
  login,
  logout,
} = require("../controllers/authController");
const router = express.Router();

// Routes
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

module.exports = router;
