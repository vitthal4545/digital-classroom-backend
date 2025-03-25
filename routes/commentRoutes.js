const express = require("express");
const router = express.Router();
const {
  addComment,
  getCommentsByAnnouncement,
} = require("../controllers/commentController");
const { authenticate } = require("../middlewares/authMiddlewares");

// Add a comment (Authenticated users only)
router.post("/:announcementId", authenticate, addComment);

// Get comments for a specific announcement
router.get("/:announcementId", getCommentsByAnnouncement);

module.exports = router;
