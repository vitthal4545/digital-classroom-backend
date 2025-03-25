const jwt = require("jsonwebtoken");
const HOD = require("../models/HOD");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
require("dotenv").config();

const authenticate = async (req, res, next) => {
  console.log("🔑 Auth Middleware Triggered");
  let token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Unauthorized - No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decoded of authenticate middleware", decoded);

    let user;

    if ((user = await HOD.findById(decoded.id).select("-password"))) {
      user = user.toObject(); // ✅ Convert Mongoose Document to Plain Object
      user.userType = "hod";
    } else if (
      (user = await Teacher.findById(decoded.id).select("-password"))
    ) {
      user = user.toObject();
      user.userType = "teacher";
    } else if (
      (user = await Student.findById(decoded.id).select("-password"))
    ) {
      user = user.toObject();
      user.userType = "student";
    }

    if (!user) {
      return res.status(401).json({ message: "User not found, invalid token" });
    }

    console.log("✅ Authenticated User:", user);
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
};

const verifyHOD = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await HOD.findById(req.user._id);
    if (!user || user.userType !== "hod") {
      return res.status(403).json({ message: "Forbidden: Only HODs allowed" });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const verifyTeacher = async (req, res, next) => {
  try {
    console.log("🔍 Checking if user is a teacher:", req.user);
    const token =
      req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const teacher = await Teacher.findById(decoded.id);

    if (!teacher) {
      return res.status(403).json({
        message: "Access denied. Only teachers can perform this action.",
      });
    }

    req.teacher = teacher;
    console.log("🔍 verify middleware working end");
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const verifyStudent = async (req, res, next) => {
  try {
    if (!req.user || req.user.userType !== "student") {
      return res
        .status(403)
        .json({ message: "Forbidden: Only students allowed" });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { authenticate, verifyHOD, verifyTeacher, verifyStudent };
