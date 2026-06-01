const express = require("express");
const router = express.Router();
const {
  projectChat, suggestTasks, generateProjectSummary,
  generateTaskDescription, analyzeWorkload,
  clearChatHistory, getChatHistory,
} = require("../controllers/aiController");
const { authenticate, requireProjectAccess } = require("../middleware/auth");

router.use(authenticate);

// Project-scoped AI
router.post("/projects/:projectId/chat", requireProjectAccess, projectChat);
router.get("/projects/:projectId/chat/history", requireProjectAccess, getChatHistory);
router.delete("/projects/:projectId/chat/history", requireProjectAccess, clearChatHistory);
router.get("/projects/:projectId/suggest-tasks", requireProjectAccess, suggestTasks);
router.get("/projects/:projectId/summary", requireProjectAccess, generateProjectSummary);
router.get("/projects/:projectId/workload", requireProjectAccess, analyzeWorkload);

// Generic AI utilities
router.post("/generate-task-description", generateTaskDescription);

module.exports = router;
