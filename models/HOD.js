const mongoose = require("mongoose");

const hodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    department: { type: String, required: true },
    userType: { type: String, required: true, default: "hod" },
    gender: { type: String, required: true, enum: ["Male", "Female"] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HOD", hodSchema);
