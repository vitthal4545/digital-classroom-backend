const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  announcementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Announcement",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "userRole", // ✅ Dynamic reference to either Teacher or Student
  },
  userRole: {
    type: String,
    required: true,
    enum: ["teacher", "student"], // ✅ Only allow "teacher" or "student"
  },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Comment", CommentSchema);
