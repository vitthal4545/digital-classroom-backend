const express = require("express");
const { authenticate } = require("../middlewares/authMiddlewares");
const {
  createSubject,
  getSubjects,
  getSubjectById,
  deleteSubject,
} = require("../controllers/subjectController");
const { verifyTeacher } = require("../middlewares/authMiddlewares");

const router = express.Router();

router.post("/", authenticate, verifyTeacher, createSubject);
router.get("/", getSubjects);
router.get("/:id", authenticate, getSubjectById);
router.delete("/:id", authenticate, verifyTeacher, deleteSubject);

module.exports = router;
