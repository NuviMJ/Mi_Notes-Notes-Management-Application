const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests from any localhost port during development
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:5174", 
      "http://localhost:5175",
      "http://localhost:5176",
      "http://localhost:3000"
    ];
    
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    // Check if the origin is localhost with any port
    if (origin.startsWith("http://localhost:")) {
      return callback(null, true);
    }
    
    // Check against allowed origins
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    // For production, you might want to be more restrictive
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files
app.use("/uploads", express.static(uploadsDir));

// Database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Nuvi#2325",
  database: "elearning_notes"
});

db.connect(err => {
  if (err) {
    console.error("MySQL connection error:", err);
    process.exit(1);
  }
  console.log("MySQL connected successfully!");
});

// Import routes
const authRoutes = require("./routes/auth");
const moduleRoutes = require("./routes/modules");
const noteRoutes = require("./routes/notes");
const examRoutes = require("./routes/exams");

// API Routes
app.use("/api/auth", authRoutes(db));
app.use("/api/modules", moduleRoutes(db));
app.use("/api/notes", noteRoutes(db));
app.use("/api/exams", examRoutes(db));

// Legacy route for semesters (keeping for backward compatibility)
app.get("/api/semesters", (req, res) => {
  db.query("SELECT * FROM semesters ORDER BY id", (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Server error" });
    }
    res.json(results);
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Server is running",
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({ 
    message: "Something went wrong!", 
    error: process.env.NODE_ENV === "development" ? err.message : undefined 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
