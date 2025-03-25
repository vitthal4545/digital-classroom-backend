const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    department: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    userType: { type: String, required: true, default: "teacher" },
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
    gender: { type: String, required: true, enum: ["Male", "Female"] },
    active: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Teacher", teacherSchema);
