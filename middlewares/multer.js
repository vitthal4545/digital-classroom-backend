const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "announcements",
    allowedFormats: ["jpg", "jpeg", "png", "pdf", "docx", "mp4"],
    resource_type: "auto",
  },
});

const upload = multer({ storage }).single("file");

console.log("Multer upload middleware initialized");

module.exports = { upload };
