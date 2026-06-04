const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  createBoard, getBoardsByProject, getBoardWithTasks, updateBoard, deleteBoard
} = require("../controllers/boardController");
const { authenticate, requireProjectAccess } = require("../middleware/auth");

router.use(authenticate);

// Under /projects/:projectId/boards
router.get("/", requireProjectAccess, getBoardsByProject);
router.post("/", requireProjectAccess, createBoard);

// Under /boards/:boardId
router.get("/:boardId", getBoardWithTasks);
router.put("/:boardId", updateBoard);
router.delete("/:boardId", deleteBoard);

module.exports = router;
