const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema({
  meetingId: { type: String, required: true, unique: true }, // Unique meeting ID
  meetingCode: { type: String, required: true, unique: true }, // Unique meeting code
  title: { type: String, required: true }, // Meeting title
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true,
  }, // Reference to teacher
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }], // List of students
  startTime: { type: Date }, // When the meeting starts
  endTime: { type: Date }, // When the meeting ends
});

const Meeting = mongoose.model("Meeting", meetingSchema);
module.exports = Meeting;
