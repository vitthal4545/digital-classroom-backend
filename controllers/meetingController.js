const Meeting = require("../models/Meeting.js");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
import { v4 as uuidv4 } from "uuid";
const io =
  // ✅ 1. Create a Meeting (Teacher)
  (exports.createMeeting = async (req, res, io) => {
    try {
      console.log("request body of createMeeting:-", req.body);
      const { title, teacherId } = req.body;

      if (!title || !teacherId) {
        return res
          .status(400)
          .json({ message: "Title and teacherId are required" });
      }

      const teacher = await Teacher.findById(teacherId);
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }

      const meetingId = uuidv4(); // Generate unique meeting ID
      const meetingCode = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

      const meeting = new Meeting({
        meetingId,
        meetingCode,
        title,
        createdBy: teacherId,
        participants: [],
      });

      await meeting.save();

      // 🔥 Emit event so frontend knows the meeting is created
      io.emit("meeting-created", { meetingId, teacherId });

      res.status(201).json({
        message: "Meeting created successfully",
        meetingId,
      });
    } catch (error) {
      console.error("🔥 Error in createMeeting:", error); // Log full error
      res.status(500).json({
        message: "Error creating meeting",
        error: error.message, // Send actual error message
      });
    }
  });

// ✅ 2. Join a Meeting (Student enters Meeting ID)
exports.joinMeeting = async (req, res) => {
  try {
    const { studentId, meetingId } = req.body;

    if (!studentId || !meetingId) {
      return res
        .status(400)
        .json({ message: "Student ID and meeting ID are required" });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const meeting = await Meeting.findOneAndUpdate(
      { meetingId },
      { $addToSet: { participants: studentId } }, // Prevents duplicates
      { new: true }
    ).populate("participants");

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    io.emit("student-joined", { meetingId, studentId });

    res.status(200).json({ message: "Joined meeting successfully", meeting });
  } catch (error) {
    console.error("🔥 Error in joinMeeting:", error);
    res.status(500).json({ message: "Error joining meeting", error });
  }
};

// ✅ 3. Get Meeting Details
exports.getMeetingById = async (req, res) => {
  try {
    const { meetingId } = req.params;

    const meeting = await Meeting.findOne({ meetingId }).populate(
      "createdBy participants"
    );
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    res.status(200).json(meeting);
  } catch (error) {
    res.status(500).json({ message: "Error fetching meeting details", error });
  }
};

// ✅ 4. End a Meeting (Teacher)
exports.endMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;

    const meeting = await Meeting.findOne({ meetingId });
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    meeting.endTime = new Date();
    await meeting.save();

    res.status(200).json({ message: "Meeting ended successfully", meeting });
  } catch (error) {
    res.status(500).json({ message: "Error ending meeting", error });
  }
};
