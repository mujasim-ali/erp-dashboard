const express = require("express");
const router = express.Router();
const {
  createProject, getProjects, getProjectById,
  updateProject, deleteProject, addMember, removeMember,
} = require("../controllers/projectController");
const { authenticate, requireProjectAccess } = require("../middleware/auth");

router.use(authenticate);

router.get("/", getProjects);
router.post("/", createProject);
router.get("/:projectId", requireProjectAccess, getProjectById);
router.put("/:projectId", requireProjectAccess, updateProject);
router.delete("/:projectId", requireProjectAccess, deleteProject);

// Members
router.post("/:projectId/members", requireProjectAccess, addMember);
router.delete("/:projectId/members/:userId", requireProjectAccess, removeMember);

module.exports = router;
