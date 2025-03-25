const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema({
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true,
  },
  title: { type: String, required: true },
  content: { type: String, required: true },
  attachments: {
    type: String,
    default: null,
  },
  link: { type: String, default: null },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Announcement", AnnouncementSchema);
