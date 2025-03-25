const express = require("express");
const router = express.Router();
const { getTeacherInfo } = require("../controllers/teacherController");
const { authenticate } = require("../middlewares/authMiddlewares");

router.get("/profile", authenticate, getTeacherInfo);
module.exports = router;
