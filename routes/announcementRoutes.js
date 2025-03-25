const express = require("express");
const router = express.Router();
const {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  deleteAnnouncement,
  getStudentsbySubjectId,
} = require("../controllers/announcementController");
const { authenticate } = require("../middlewares/authMiddlewares");
const { upload } = require("../middlewares/multer");

router.post("/:subjectId", authenticate, upload, createAnnouncement);

router.get("/:subjectId", authenticate, getAnnouncements);

router.get(
  "/single/:announcementId",
  (req, res, next) => {
    console.log("the middleware for get announcement is firing");
    next();
  },
  getAnnouncementById
);
router.get("/joined-students/:subjectId", authenticate, getStudentsbySubjectId);

router.delete("/:announcementId", authenticate, deleteAnnouncement);

module.exports = router;
