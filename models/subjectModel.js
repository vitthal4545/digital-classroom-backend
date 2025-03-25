const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    className: {
      type: String,
      required: true,
      enum: ["1st Year", "2nd Year", "3rd Year", "4th Year"],
    },
    sem: {
      type: String,
      required: true,
      enum: [
        "Sem 1",
        "Sem 2",
        "Sem 3",
        "Sem 4",
        "Sem 5",
        "Sem 6",
        "Sem 7",
        "Sem 8",
      ],
    },
    department: {
      type: String,
      required: true,
      enum: ["CSE", "Mechanical", "Civil", "Electrical", "Electronics"],
    },
    description: { type: String, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    joinCode: { type: String, unique: true, required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subject", subjectSchema);
