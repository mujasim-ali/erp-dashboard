const { v4: uuidv4 } = require("uuid");
const { db } = require("../db/database");
const { logActivity } = require("../middleware/activityLogger");

const createBoard = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { board_name } = req.body;
    if (!board_name) return res.status(400).json({ error: "Board name is required" });

    const boardId = uuidv4();
    await db.execute({
      sql: `INSERT INTO boards (board_id, board_name, project_id, updated_by) VALUES (?, ?, ?, ?)`,
      args: [boardId, board_name.trim(), projectId, req.user.user_id],
    });

    await logActivity({
      userId: req.user.user_id,
      entityId: boardId,
      entityType: "board",
      action: "BOARD_CREATED",
      details: { board_name },
      projectId,
    });

    const board = await db.execute({
      sql: "SELECT * FROM boards WHERE board_id = ?",
      args: [boardId],
    });

    res.status(201).json({ message: "Board created", board: board.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create board" });
  }
};

const getBoardsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const result = await db.execute({
      sql: `SELECT b.*,
              (SELECT COUNT(*) FROM tasks t WHERE t.board_id = b.board_id) as task_count,
              (SELECT COUNT(*) FROM tasks t WHERE t.board_id = b.board_id AND t.status = 'done') as done_count
            FROM boards b WHERE b.project_id = ? ORDER BY b.created_at`,
      args: [projectId],
    });
    res.json({ boards: result.rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch boards" });
  }
};

const getBoardWithTasks = async (req, res) => {
  try {
    const { boardId } = req.params;
    const board = await db.execute({
      sql: "SELECT * FROM boards WHERE board_id = ?",
      args: [boardId],
    });
    if (board.rows.length === 0) return res.status(404).json({ error: "Board not found" });

    const tasks = await db.execute({
      sql: `SELECT t.*, u.name as assignee_name, u.email as assignee_email
            FROM tasks t LEFT JOIN users u ON u.user_id = t.assigned_to
            WHERE t.board_id = ? ORDER BY t.created_at DESC`,
      args: [boardId],
    });

    res.json({ board: board.rows[0], tasks: tasks.rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch board" });
  }
};

const updateBoard = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { board_name } = req.body;
    if (!board_name) return res.status(400).json({ error: "Board name is required" });

    await db.execute({
      sql: "UPDATE boards SET board_name = ?, updated_by = ? WHERE board_id = ?",
      args: [board_name.trim(), req.user.user_id, boardId],
    });

    res.json({ message: "Board updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update board" });
  }
};

const deleteBoard = async (req, res) => {
  try {
    const { boardId } = req.params;

    const taskCount = await db.execute({
      sql: "SELECT COUNT(*) as count FROM tasks WHERE board_id = ?",
      args: [boardId],
    });
    if (Number(taskCount.rows[0].count) > 0) {
      return res.status(400).json({ error: "Cannot delete board with existing tasks. Move or delete tasks first." });
    }

    await db.execute({ sql: "DELETE FROM boards WHERE board_id = ?", args: [boardId] });
    res.json({ message: "Board deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete board" });
  }
};

module.exports = { createBoard, getBoardsByProject, getBoardWithTasks, updateBoard, deleteBoard };
