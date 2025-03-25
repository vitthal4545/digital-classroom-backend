const Teacher = require("../models/Teacher");

// Get teacher information
const getTeacherInfo = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: No user found" });
    }
    const teacher = await Teacher.findById(req.user._id);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.json(teacher);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getTeacherInfo,
};
