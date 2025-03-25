const Announcement = require("../models/Announcement");
const cloudinary = require("../config/cloudinary");
const mongoose = require("mongoose");
const Subject = require("../models/subjectModel");

// Create a new announcement (Only Teachers)
exports.createAnnouncement = async (req, res) => {
  try {
    console.log("Received body:", JSON.stringify(req.body, null, 2));

    const { title, content, link, teacherId } = req.body;
    console.log("req.body of createAnnouncement:- ", req.body);
    const subjectId = req.params.subjectId;

    const fileUrl = req.file ? req.file.path : null;

    const announcement = new Announcement({
      title,
      content,
      attachments: fileUrl,
      link,
      subjectId,
      teacherId,
      timestamp: new Date(),
    });
    await announcement.save();
    res
      .status(201)
      .json({ message: "Announcement created successfully", announcement });
  } catch (error) {
    console.error("Error occurred while creating announcement:", error);
    res.status(500).json({
      message: "Server error while creating announcement",
      error: error.message || "Unknown error",
    });
  }
};

// Get all announcements for a subject
exports.getAnnouncements = async (req, res) => {
  try {
    const subjectId = req.params.subjectId;
    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      console.error("Invalid subjectId:", subjectId);
      return;
    } else {
      console.log("the subjectId is valid ObjectId");
    }

    const announcements = await Announcement.find({ subjectId }).sort({
      timestamp: -1,
    });
    res.status(200).json(announcements);
    console.log("Get Announcements:- ", announcements);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error while fetching announcements" });
  }
};

exports.getAnnouncementById = async (req, res) => {
  try {
    console.log("Announcement ID:", req.params.announcementId);
    const { announcementId } = req.params;
    const announcement = await Announcement.findById(req.params.announcementId);
    console.log("Announcement found:", announcement);

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    res.json(announcement);
  } catch (error) {
    console.error("Error fetching announcement:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete an announcement (Only Teacher)
exports.deleteAnnouncement = async (req, res) => {
  try {
    const { announcementId } = req.params;
    const announcement = await Announcement.findById(announcementId);
    console.log("User trying to delete:", req.user);
    console.log("Announcement teacherId:", announcement.teacherId);

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    // Ensure only the teacher who created it can delete
    // if (announcement.teacherId.toString() !== req.user.id) {
    //   return res.status(403).json({ message: "Unauthorized action" });
    // }

    if (!announcement.teacherId.equals(req.user._id)) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    await Announcement.findByIdAndDelete(announcementId);
    res.status(200).json({ message: "Announcement deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error while deleting announcement" });
  }
};

exports.getStudentsbySubjectId = async (req, res) => {
  try {
    const { subjectId } = req.params;
    console.log("subjectId:- ", subjectId);

    const subject = await Subject.findById(subjectId).populate(
      "students",
      "name email"
    );

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.status(200).json(subject.students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching students" });
  }
};
