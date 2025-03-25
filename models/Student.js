const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    department: { type: String, required: true },
    class: {
      type: String,
      required: true,
      enum: ["1st Year", "2nd Year", "3rd Year", "4th Year"],
    },
    userType: { type: String, required: true, default: "student" },
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
    gender: { type: String, required: true, enum: ["Male", "Female"] },
    mobileNumber: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
