const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const HOD = require("../models/HOD");
const Subject = require("../models/subjectModel");

//fetch hod profile
exports.getHODProfile = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: No user found" });
    }
    const hod = await HOD.findById(req.user._id);

    if (!hod) {
      return res.status(404).json({ message: "HOD not found" });
    }
    res.json(hod);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Fetch approved teachers
exports.getApprovedTeachers = async (req, res) => {
  try {
    const approvedTeachers = await Teacher.find({ isVerified: true }).select(
      "name email _id"
    );
    res.json(approvedTeachers);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Fetch pending teacher requests
exports.getPendingTeachers = async (req, res) => {
  try {
    const pendingTeachers = await Teacher.find({ isVerified: false });
    res.json(pendingTeachers);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.approveTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;

    if (!teacherId) {
      return res.status(400).json({ message: "Teacher ID is required" });
    }

    const teacher = await Teacher.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Update approval status
    teacher.isVerified = true;
    await teacher.save();

    res.json({ message: "Teacher approved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error approving teacher", error });
  }
};

exports.rejectTeacher = async (req, res) => {
  try {
    const teacherId = req.params.teacherId;

    // Find and delete teacher
    const teacher = await Teacher.findByIdAndDelete(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    res.status(200).json({ message: "Teacher rejected and removed" });
  } catch (error) {
    res.status(500).json({ message: "Error rejecting teacher", error });
  }
};

// Fetch pending student requests
exports.getPendingStudents = async (req, res) => {
  try {
    const pendingStudents = await Student.find({ isVerified: false }).select(
      "name email _id"
    );
    res.json(pendingStudents);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.approveStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Update approval status
    student.isVerified = true;
    await student.save();

    res.json({ message: "Student approved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error approving student", error });
  }
};

exports.getAcademicRecords = async (req, res) => {
  try {
    console.log("req.query of getAcademic Records:-", req.query);
    const { year, branch } = req.query;

    if (!year || !branch) {
      return res.status(400).json({ message: "Year and Branch are required" });
    }

    const students = await Student.find({ class: year, department: branch });
    const subjects = await Subject.find({
      className: year,
      department: branch,
    });

    res.status(200).json({ students, subjects });
  } catch (error) {
    console.error("Error fetching academic records:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
