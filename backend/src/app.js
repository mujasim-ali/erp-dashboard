require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { initializeDatabase } = require("./db/database");

const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/projects");
const boardRoutes = require("./routes/boards");
const taskRoutes = require("./routes/tasks");
const activityRoutes = require("./routes/activity");
const aiRoutes = require("./routes/ai");
const employeeRoutes = require("./routes/employees");
const inventoryRoutes = require("./routes/inventory");

const app = express();

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

// ─── Health check ────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "ERP Backend",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/projects/:projectId/boards", boardRoutes);
app.use("/api/projects/:projectId/tasks", taskRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/ai", aiRoutes);

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// ─── Error handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error", details: err.message });
});

// ─── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;

async function start() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`\n🚀 ERP Backend running on http://localhost:${PORT}`);
      console.log(`📊 Health: http://localhost:${PORT}/health`);
      console.log(`📁 API base: http://localhost:${PORT}/api\n`);
    });
  } catch (err) {
    console.error("Failed to start:", err);
    process.exit(1);
  }
}

start();

module.exports = app;
