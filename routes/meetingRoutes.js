const express = require("express");
const router = express.Router();
const {
  createMeeting,
  joinMeeting,
  getMeetingById,
  endMeeting,
} = require("../controllers/meetingController");

module.exports = (io) => {
  router.post("/create", (req, res) => createMeeting(req, res, io)); // Teacher creates a meeting
  router.post("/join", joinMeeting); // Student joins a meeting
  router.get("/:meetingId", getMeetingById); // Get meeting details
  router.put("/:meetingId/end", endMeeting); // Teacher ends the meeting

  return router;
};
