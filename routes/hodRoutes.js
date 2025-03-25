const express = require("express");
const router = express.Router();
const { authenticate, verifyHOD } = require("../middlewares/authMiddlewares");
const {
  getHODProfile,
  getApprovedTeachers,
  getPendingTeachers,
  approveTeacher,
  rejectTeacher,
  getPendingStudents,
  approveStudent,
  getAcademicRecords,
} = require("../controllers/hodController");

// Fetch HOD profile
router.get("/profile", authenticate, getHODProfile);

// Fetch approved teachers
router.get("/teachers/approved", authenticate, getApprovedTeachers);

// Fetch pending teacher requests
router.get("/teachers/pending", authenticate, getPendingTeachers);

// Approve a teacher
router.put(
  "/teachers/approve/:teacherId",
  authenticate,
  verifyHOD,
  approveTeacher
);

// Reject a teacher
router.delete(
  "/teachers/reject/:teacherId",
  authenticate,
  verifyHOD,
  rejectTeacher
);

// Fetch pending student requests
router.get("/students/pending", authenticate, verifyHOD, getPendingStudents);

// Approve a student
router.put(
  "/students/approve/:studentId",
  authenticate,
  verifyHOD,
  approveStudent
);

router.get("/records", authenticate, verifyHOD, getAcademicRecords);

module.exports = router;
