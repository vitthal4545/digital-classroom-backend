const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const connectDB = require("./config/db.js");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const hodRoutes = require("./routes/hodRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const studentRoutes = require("./routes/studentRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const meetingRoutes = require("./routes/meetingRoutes");
const commentRoutes = require("./routes/commentRoutes.js");

// Initialize App
dotenv.config();
const app = express();

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  cors({
    origin: [
      "https://digital-classroom-gamma.vercel.app",
      "http://192.168.1.6:5173",
      "http://localhost:5173",
    ],
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
      collectionName: "sessions",
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

// Connect to MongoDB
connectDB()
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
  });

// Attach Routes
app.use("/api/meetings", meetingRoutes); // Removed io passing
app.use("/api/auth", authRoutes);
app.use("/api/hod", hodRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/comments", commentRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
