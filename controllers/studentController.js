const Student = require("../models/Student");
const Subject = require("../models/subjectModel");

const getStudentInfo = async (req, res) => {
  try {
    const student = await Student.findById(req.user._id).populate({
      path: "subjects",
      select: "name teacherName",
    });
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (error) {
    console.error("❌ Error in getStudentInfo:", error);
    res.status(500).json({ error: error.message });
  }
};

const joinSubject = async (req, res) => {
  try {
    console.log("req body of joinSubject api request", req.body);
    const { joinCode } = req.body;
    const studentId = req.user.id;

    // Check if the subject with this joinCode exists
    const subject = await Subject.findOne({ joinCode });

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    // Check if student is already in the subject
    if (subject.students.includes(studentId)) {
      return res
        .status(400)
        .json({ message: "You are already enrolled in this subject" });
    }

    // Add student to the subject
    subject.students.push(studentId);
    await subject.save();

    res
      .status(200)
      .json({ message: "Successfully joined the subject", subject });
  } catch (error) {
    console.error("❌ Error adding subject:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getSubjects = async (req, res) => {
  try {
    console.log("🔍 Received request to fetch joined subjects:", req.user);

    // Ensure student ID is available from the request
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: No user found" });
    }

    // Find subjects that the student has joined
    const subjects = await Subject.find({ students: req.user._id })
      .populate("createdBy", "name email")
      .exec();
    res.json(subjects);
  } catch (error) {
    console.error("Error in getSubjects:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getStudentInfo, getSubjects, joinSubject };
