require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const OTP = require("../models/otpModel");
const HOD = require("../models/HOD");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000);

    const hashedOTP = crypto
      .createHash("sha256")
      .update(otp.toString())
      .digest("hex");

    //Send OTP via Email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP for Digital Classroom Signup",
      text: `Your OTP for signUp is: ${otp}. It will expire in 5 minutes`,
    });

    //save OTP in DB
    await OTP.deleteMany({ email });
    await OTP.create({
      email,
      otp: hashedOTP,
      expireAt: new Date(Date.now() + 5 * 60000),
    });

    res.status(200).json({ message: "OTP sent successfully !" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to send OTP", error: error.message });
  }
};

//verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const storedOTP = await OTP.findOne({ email });

    if (!storedOTP) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Check if OTP is expired
    if (new Date(storedOTP.expireAt).getTime() < Date.now()) {
      await OTP.deleteOne({ _id: storedOTP._id });
      return res.status(400).json({ message: "OTP expired" });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ message: "Invalid OTP format" });
    }

    const hashedOTP = crypto
      .createHash("sha256")
      .update(otp.trim())
      .digest("hex");

    const storedOtpBuffer = Buffer.from(storedOTP.otp);
    const hashedOtpBuffer = Buffer.from(hashedOTP);

    if (
      storedOtpBuffer.length !== hashedOtpBuffer.length ||
      !crypto.timingSafeEqual(storedOtpBuffer, hashedOtpBuffer)
    ) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await OTP.deleteOne({ _id: storedOTP._id });

    res.status(200).json({ message: "OTP verified successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

//signup route
exports.signup = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      studentClass,
      userType,
      department,
      gender,
      mobileNumber,
    } = req.body;

    //check if user exists or not
    const existingStudent = await Student.findOne({ email });
    const existingTeacher = await Teacher.findOne({ email });
    const existingHOD = await HOD.findOne({ email });

    if (existingStudent || existingTeacher || existingHOD) {
      return res.status(400).json({ message: "User already exists" });
    }

    //hash passwords
    const hashedPassword = await bcrypt.hash(password, 10);

    //creating user based on his role
    let newUser;
    if (userType === "student") {
      if (!mobileNumber) {
        return res
          .status(400)
          .json({ message: "Mobile number is required for students" });
      }

      newUser = await Student.create({
        name,
        email,
        password: hashedPassword,
        department,
        class: studentClass,
        userType,
        gender,
        mobileNumber,
      });
    } else if (userType === "teacher") {
      newUser = await Teacher.create({
        name,
        email,
        password: hashedPassword,
        department,
        userType,
        gender,
      });
    } else if (userType === "hod") {
      newUser = await HOD.create({
        name,
        email,
        password: hashedPassword,
        department,
        userType,
        gender,
      });
    }

    //Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, userType },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    //Store cookies
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(201).json({
      success: true,
      message: "Signup successful",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        userType: userType,
        department: newUser.department,
        gender: newUser.gender,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

//login route
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    //check if user exists
    const [student, teacher, hod] = await Promise.all([
      Student.findOne({ email }),
      Teacher.findOne({ email }),
      HOD.findOne({ email }),
    ]);

    const user = student || teacher || hod;
    const userType = student ? "student" : teacher ? "teacher" : "hod";

    if (!user) {
      return res
        .status(401)
        .json({ message: "User not found. Please Sign up before login" });
    }

    //compare the entered pass with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // // ✅ Check if user is verified before allowing login
    // if (userType === "student" && !user.isVerified) {
    //   return res
    //     .status(403)
    //     .json({ status: "pending", message: "Waiting for HOD approval" });
    // }

    // if (userType === "teacher" && !user.isVerified) {
    //   return res
    //     .status(403)
    //     .json({ status: "pending", message: "Waiting for Admin approval" });
    // }

    //generate token
    const token = jwt.sign(
      { id: user._id, userType: userType },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    //set jwt token as HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 1000,
    });

    //send response with user details and token
    res.status(200).json({
      message: "Login Successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: userType,
        isVerified: userType === "hod" ? true : user.isVerified,
        teacherId: userType === "teacher" ? user._id : null,
      },
      token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

//logout route
exports.logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout successful" });
};
