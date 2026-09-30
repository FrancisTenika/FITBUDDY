const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static HTML and assets
app.use(express.static(path.join(__dirname, "public")));

// API Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/workouts", require("./routes/workouts"));
app.use("/api/ai", require("./routes/ai"));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "FitBuddy backend is running",
    timestamp: new Date().toISOString(),
    version: "2.0.0",
    services: {
      auth: "active",
      workouts: "active",
      users: "active",
      aiPlanner: "active"
    }
  });
});

// Fallback to HTML for non-API routes (SPA routing)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 FitBuddy Server running on port ${PORT}`));