const express = require("express");
const {
  getStudentInfo,
  getSubjects,
  joinSubject,
} = require("../controllers/studentController");
const { authenticate } = require("../middlewares/authMiddlewares");
const router = express.Router();

// Route to get student info (protected route)
router.get("/me", authenticate, getStudentInfo);

router.post("/join-subject", authenticate, joinSubject);

// Route to fetch subjects based on class & semester
router.get("/joined-subjects", authenticate, getSubjects);

module.exports = router;
