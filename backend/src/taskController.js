const { v4: uuidv4 } = require("uuid");
const { db } = require("../db/database");
const { logActivity } = require("../middleware/activityLogger");

const createTask = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { title, description, assigned_to, priority = "medium", due_date, project_id } = req.body;

    if (!title) return res.status(400).json({ error: "Task title is required" });

    // Get project_id from board if not provided
    let resolvedProjectId = project_id;
    if (!resolvedProjectId) {
      const board = await db.execute({
        sql: "SELECT project_id FROM boards WHERE board_id = ?",
        args: [boardId],
      });
      if (board.rows.length === 0) return res.status(404).json({ error: "Board not found" });
      resolvedProjectId = board.rows[0].project_id;
    }

    const taskId = uuidv4();
    await db.execute({
      sql: `INSERT INTO tasks (task_id, title, description, board_id, project_id, assigned_to, priority, due_date, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [taskId, title.trim(), description || null, boardId, resolvedProjectId,
             assigned_to || null, priority, due_date || null, req.user.user_id],
    });

    await logActivity({
      userId: req.user.user_id,
      entityId: taskId,
      entityType: "task",
      action: "TASK_CREATED",
      details: { title, priority },
      projectId: resolvedProjectId,
    });

    const task = await db.execute({
      sql: `SELECT t.*, u.name as assignee_name FROM tasks t
            LEFT JOIN users u ON u.user_id = t.assigned_to WHERE t.task_id = ?`,
      args: [taskId],
    });

    res.status(201).json({ message: "Task created", task: task.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create task" });
  }
};

const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, priority, assigned_to, search } = req.query;

    let sql = `SELECT t.*, u.name as assignee_name, u.email as assignee_email,
                 b.board_name
               FROM tasks t
               LEFT JOIN users u ON u.user_id = t.assigned_to
               LEFT JOIN boards b ON b.board_id = t.board_id
               WHERE t.project_id = ?`;
    const args = [projectId];

    if (status) { sql += " AND t.status = ?"; args.push(status); }
    if (priority) { sql += " AND t.priority = ?"; args.push(priority); }
    if (assigned_to) { sql += " AND t.assigned_to = ?"; args.push(assigned_to); }
    if (search) { sql += " AND (t.title LIKE ? OR t.description LIKE ?)"; args.push(`%${search}%`, `%${search}%`); }

    sql += " ORDER BY t.created_at DESC";

    const result = await db.execute({ sql, args });
    res.json({ tasks: result.rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

const getMyTasks = async (req, res) => {
  try {
    const result = await db.execute({
      sql: `SELECT t.*, p.project_name, b.board_name
            FROM tasks t
            LEFT JOIN projects p ON p.project_id = t.project_id
            LEFT JOIN boards b ON b.board_id = t.board_id
            WHERE t.assigned_to = ? ORDER BY t.due_date ASC, t.priority DESC`,
      args: [req.user.user_id],
    });
    res.json({ tasks: result.rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

const getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await db.execute({
      sql: `SELECT t.*, u.name as assignee_name, u.email as assignee_email,
              b.board_name, p.project_name,
              cu.name as creator_name
            FROM tasks t
            LEFT JOIN users u ON u.user_id = t.assigned_to
            LEFT JOIN users cu ON cu.user_id = t.created_by
            LEFT JOIN boards b ON b.board_id = t.board_id
            LEFT JOIN projects p ON p.project_id = t.project_id
            WHERE t.task_id = ?`,
      args: [taskId],
    });

    if (task.rows.length === 0) return res.status(404).json({ error: "Task not found" });

    const logs = await db.execute({
      sql: `SELECT al.*, u.name as user_name FROM activity_log al
            LEFT JOIN users u ON u.user_id = al.user_id
            WHERE al.entity_id = ? ORDER BY al.created_at DESC LIMIT 20`,
      args: [taskId],
    });

    res.json({ task: task.rows[0], activity: logs.rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch task" });
  }
};

const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, status, priority, assigned_to, due_date, board_id } = req.body;

    const existing = await db.execute({
      sql: "SELECT * FROM tasks WHERE task_id = ?",
      args: [taskId],
    });
    if (existing.rows.length === 0) return res.status(404).json({ error: "Task not found" });

    const old = existing.rows[0];
    const changes = {};
    if (title && title !== old.title) changes.title = { from: old.title, to: title };
    if (status && status !== old.status) changes.status = { from: old.status, to: status };
    if (priority && priority !== old.priority) changes.priority = { from: old.priority, to: priority };

    await db.execute({
      sql: `UPDATE tasks SET
              title = COALESCE(?, title),
              description = COALESCE(?, description),
              status = COALESCE(?, status),
              priority = COALESCE(?, priority),
              assigned_to = COALESCE(?, assigned_to),
              due_date = COALESCE(?, due_date),
              board_id = COALESCE(?, board_id),
              updated_at = datetime('now')
            WHERE task_id = ?`,
      args: [title || null, description || null, status || null, priority || null,
             assigned_to || null, due_date || null, board_id || null, taskId],
    });

    await logActivity({
      userId: req.user.user_id,
      entityId: taskId,
      entityType: "task",
      action: "TASK_UPDATED",
      details: changes,
      projectId: old.project_id,
    });

    res.json({ message: "Task updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update task" });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    const validStatuses = ["todo", "in_progress", "review", "done"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(", ")}` });
    }

    const existing = await db.execute({
      sql: "SELECT * FROM tasks WHERE task_id = ?",
      args: [taskId],
    });
    if (existing.rows.length === 0) return res.status(404).json({ error: "Task not found" });

    await db.execute({
      sql: "UPDATE tasks SET status = ?, updated_at = datetime('now') WHERE task_id = ?",
      args: [status, taskId],
    });

    await logActivity({
      userId: req.user.user_id,
      entityId: taskId,
      entityType: "task",
      action: "TASK_STATUS_CHANGED",
      details: { from: existing.rows[0].status, to: status },
      projectId: existing.rows[0].project_id,
    });

    res.json({ message: "Task status updated", status });
  } catch (err) {
    res.status(500).json({ error: "Failed to update task status" });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await db.execute({
      sql: "SELECT * FROM tasks WHERE task_id = ?",
      args: [taskId],
    });
    if (task.rows.length === 0) return res.status(404).json({ error: "Task not found" });

    if (req.user.role !== "admin" && task.rows[0].created_by !== req.user.user_id) {
      return res.status(403).json({ error: "Only task creator or admin can delete" });
    }

    await db.execute({ sql: "DELETE FROM tasks WHERE task_id = ?", args: [taskId] });
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete task" });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const isAdmin = req.user.role === "admin";

    const projectFilter = isAdmin ? "" : `WHERE p.project_id IN (
      SELECT project_id FROM project_members WHERE user_id = '${userId}')`;

    const stats = await db.execute(
      `SELECT
         (SELECT COUNT(*) FROM projects p ${projectFilter}) as total_projects,
         (SELECT COUNT(*) FROM tasks t WHERE ${isAdmin ? "1=1" : `t.project_id IN (SELECT project_id FROM project_members WHERE user_id = '${userId}')`}) as total_tasks,
         (SELECT COUNT(*) FROM tasks t WHERE t.status = 'done' AND ${isAdmin ? "1=1" : `t.project_id IN (SELECT project_id FROM project_members WHERE user_id = '${userId}')`}) as completed_tasks,
         (SELECT COUNT(*) FROM tasks t WHERE t.status = 'in_progress' AND ${isAdmin ? "1=1" : `t.project_id IN (SELECT project_id FROM project_members WHERE user_id = '${userId}')`}) as in_progress_tasks,
         (SELECT COUNT(*) FROM tasks t WHERE t.assigned_to = '${userId}') as my_tasks,
         (SELECT COUNT(*) FROM users) as total_users`
    );

    const recentActivity = await db.execute({
      sql: `SELECT al.*, u.name as user_name FROM activity_log al
            LEFT JOIN users u ON u.user_id = al.user_id
            ORDER BY al.created_at DESC LIMIT 10`,
      args: [],
    });

    const tasksByStatus = await db.execute({
      sql: `SELECT status, COUNT(*) as count FROM tasks GROUP BY status`,
      args: [],
    });

    res.json({
      stats: stats.rows[0],
      recent_activity: recentActivity.rows,
      tasks_by_status: tasksByStatus.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
};

module.exports = {
  createTask, getTasksByProject, getMyTasks, getTaskById,
  updateTask, updateTaskStatus, deleteTask, getDashboardStats,
};
