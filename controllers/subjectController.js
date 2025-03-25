const Subject = require("../models/subjectModel");
const Teacher = require("../models/Teacher");

// ✅ Create a new subject
const createSubject = async (req, res) => {
  try {
    const { name, className, sem, department, description, teacherId } =
      req.body;

    const joinCode = Math.random().toString(36).substr(2, 6).toUpperCase();
    console.log("joincode:-", joinCode);

    if (
      !name ||
      !className ||
      !sem ||
      !department ||
      !description ||
      !teacherId
    ) {
      return res
        .status(400)
        .json({ error: "All fields are required, including teacherId." });
    }

    const newSubject = new Subject({
      name,
      className,
      sem,
      department,
      description,
      joinCode,
      createdBy: teacherId,
    });

    await newSubject.save();
    res
      .status(201)
      .json({ message: "Subject created successfully!", subject: newSubject });
  } catch (error) {
    res.status(500).json({ message: "Error creating subject", error });
  }
};

// ✅ Get all subjects
const getSubjects = async (req, res) => {
  try {
    const { teacherId } = req.query;
    const subjects = await Subject.find({ createdBy: teacherId }).populate(
      "createdBy",
      "name email userType"
    );

    const formattedSubjects = subjects.map((subject) => ({
      _id: subject._id,
      name: subject.name,
      semester: subject.sem,
      department: subject.department,
      className: subject.className,
      description: subject.description,
      teacherName: subject.createdBy ? subject.createdBy.name : "Unknown",
      userType: subject.createdBy ? subject.createdBy.userType : "Unknown",
    }));

    res.status(200).json(formattedSubjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res
      .status(500)
      .json({ message: "Error fetching subjects", error: error.message });
  }
};

// ✅ Get subject by ID
const getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id).populate(
      "createdBy",
      "name email userType"
    );
    if (!subject) {
      console.log("Subject not found.");
      return res.status(404).json({ message: "Subject not found" });
    }

    res.status(200).json(subject);
  } catch (error) {
    res.status(500).json({ message: "Error fetching subject", error });
  }
};

// ✅ Delete subject (Only the teacher who created it can delete)

const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    // Check if the logged-in teacher is the creator of the subject
    if (subject.createdBy.toString() !== req.teacher._id.toString()) {
      return res.status(403).json({
        message: "Access denied. You can only delete subjects you created.",
      });
    }

    await subject.deleteOne();
    res.status(200).json({ message: "Subject deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting subject", error });
  }
};

module.exports = { createSubject, getSubjects, getSubjectById, deleteSubject };
