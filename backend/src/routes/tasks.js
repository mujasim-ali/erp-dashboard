const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  createTask, getTasksByProject, getMyTasks, getTaskById,
  updateTask, updateTaskStatus, deleteTask, getDashboardStats,
} = require("../controllers/taskController");
const { authenticate, requireProjectAccess } = require("../middleware/auth");

router.use(authenticate);

// Global
router.get("/my", getMyTasks);
router.get("/dashboard/stats", getDashboardStats);

// Under /projects/:projectId/tasks
router.get("/", requireProjectAccess, getTasksByProject);
router.post("/board/:boardId", createTask);

// Single task
router.get("/:taskId", getTaskById);
router.put("/:taskId", updateTask);
router.patch("/:taskId/status", updateTaskStatus);
router.delete("/:taskId", deleteTask);

module.exports = router;
