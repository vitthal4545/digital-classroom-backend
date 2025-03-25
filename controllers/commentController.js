const Comment = require("../models/Comment");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");


exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { _id: userId, userType: userRole } = req.user; // ✅ Extract userId and userRole from req.user
    const { announcementId } = req.params;

    if (!text.trim()) {
      return res.status(400).json({ message: "Comment text cannot be empty" });
    }

    const newComment = new Comment({
      announcementId,
      userId,
      userRole, // ✅ Save user role
      text,
    });

    await newComment.save();
    res.status(201).json({ message: "Comment added successfully", newComment });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getCommentsByAnnouncement = async (req, res) => {
  try {
    const { announcementId } = req.params;

    const comments = await Comment.find({ announcementId }).lean(); // Get comments as plain objects

    const userIds = comments.map((c) => c.userId);
    const students = await Student.find({ _id: { $in: userIds } }).select(
      "name"
    );
    const teachers = await Teacher.find({ _id: { $in: userIds } }).select(
      "name"
    );

    // Map user details
    const userMap = {};
    students.forEach(
      (s) => (userMap[s._id.toString()] = { name: s.name, role: "student" })
    );
    teachers.forEach(
      (t) => (userMap[t._id.toString()] = { name: t.name, role: "teacher" })
    );

    const populatedComments = comments.map((comment) => ({
      ...comment,
      user: userMap[comment.userId.toString()] || {
        name: "Unknown",
        role: "unknown",
      },
    }));

    res.status(200).json(populatedComments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Server error while fetching comments" });
  }
};

// // Add a new comment
// exports.addComment = async (req, res) => {
//   try {
//     console.log("add comment req.body:- ", req.body);
//     const { text } = req.body;
//     const { announcementId } = req.params;
//     const userId = req.user.id; // Extracted from the authenticated user

//     if (!text.trim()) {
//       return res.status(400).json({ message: "Comment cannot be empty" });
//     }

//     const newComment = new Comment({ announcementId, userId, text });
//     await newComment.save();

//     res.status(201).json({ message: "Comment added successfully", newComment });
//   } catch (error) {
//     console.error("Error adding comment:", error);
//     res.status(500).json({ message: "Server error while adding comment" });
//   }
// };

// // Get all comments for a specific announcement
// exports.getCommentsByAnnouncement = async (req, res) => {
//   try {
//     console.log("get comments req.body:- ", req.body);
//     const { announcementId } = req.params;

//     const comments = await Comment.find({ announcementId })
//       .populate("userId", "name") // Populate user details (only name)
//       .sort({ timestamp: -1 });

//     res.status(200).json(comments);
//   } catch (error) {
//     console.error("Error fetching comments:", error);
//     res.status(500).json({ message: "Server error while fetching comments" });
//   }
// };
