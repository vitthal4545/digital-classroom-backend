const Joi = require("joi");

const otpValidation = Joi.object({
  email: Joi.string().email().required(),
});

const signupValidation = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  studentClass: Joi.string().when("userType", {
    is: "student",
    then: Joi.required(),
  }),
  userType: Joi.string().valid("student", "teacher", "hod").required(),
  department: Joi.string().required(),
});

const loginValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const verifyOTPValidation = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).pattern(/^\d+$/).required(),
});

module.exports = {
  otpValidation,
  signupValidation,
  loginValidation,
  verifyOTPValidation,
};
