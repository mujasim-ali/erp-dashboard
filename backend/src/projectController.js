const { v4: uuidv4 } = require("uuid");
const { db } = require("../db/database");
const { logActivity } = require("../middleware/activityLogger");

const createProject = async (req, res) => {
  try {
    const { project_name, description } = req.body;
    if (!project_name) return res.status(400).json({ error: "Project name is required" });

    const projectId = uuidv4();
    await db.execute({
      sql: `INSERT INTO projects (project_id, project_name, description, created_by) VALUES (?, ?, ?, ?)`,
      args: [projectId, project_name.trim(), description || null, req.user.user_id],
    });

    // Auto-add creator as member
    await db.execute({
      sql: `INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, 'owner')`,
      args: [projectId, req.user.user_id],
    });

    // Auto-create a default board
    const boardId = uuidv4();
    await db.execute({
      sql: `INSERT INTO boards (board_id, board_name, project_id, updated_by) VALUES (?, ?, ?, ?)`,
      args: [boardId, "Main Board", projectId, req.user.user_id],
    });

    await logActivity({
      userId: req.user.user_id,
      entityId: projectId,
      entityType: "project",
      action: "PROJECT_CREATED",
      details: { project_name },
      projectId,
    });

    const project = await db.execute({
      sql: `SELECT p.*, u.name as creator_name FROM projects p
            JOIN users u ON u.user_id = p.created_by
            WHERE p.project_id = ?`,
      args: [projectId],
    });

    res.status(201).json({ message: "Project created", project: project.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create project" });
  }
};

const getProjects = async (req, res) => {
  try {
    let sql, args;
    if (req.user.role === "admin") {
      sql = `SELECT p.*, u.name as creator_name,
               (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.project_id) as task_count,
               (SELECT COUNT(*) FROM project_members pm WHERE pm.project_id = p.project_id) as member_count
             FROM projects p JOIN users u ON u.user_id = p.created_by
             ORDER BY p.created_at DESC`;
      args = [];
    } else {
      sql = `SELECT p.*, u.name as creator_name,
               (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.project_id) as task_count,
               (SELECT COUNT(*) FROM project_members pm2 WHERE pm2.project_id = p.project_id) as member_count
             FROM projects p
             JOIN users u ON u.user_id = p.created_by
             JOIN project_members pm ON pm.project_id = p.project_id AND pm.user_id = ?
             ORDER BY p.created_at DESC`;
      args = [req.user.user_id];
    }

    const result = await db.execute({ sql, args });
    res.json({ projects: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};

const getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;
    const result = await db.execute({
      sql: `SELECT p.*, u.name as creator_name FROM projects p
            JOIN users u ON u.user_id = p.created_by
            WHERE p.project_id = ?`,
      args: [projectId],
    });

    if (result.rows.length === 0) return res.status(404).json({ error: "Project not found" });

    const members = await db.execute({
      sql: `SELECT u.user_id, u.name, u.email, u.role as user_role, pm.role as project_role, pm.joined_at
            FROM project_members pm JOIN users u ON u.user_id = pm.user_id
            WHERE pm.project_id = ?`,
      args: [projectId],
    });

    const boards = await db.execute({
      sql: `SELECT b.*, 
              (SELECT COUNT(*) FROM tasks t WHERE t.board_id = b.board_id) as task_count
            FROM boards b WHERE b.project_id = ? ORDER BY b.created_at`,
      args: [projectId],
    });

    res.json({
      project: result.rows[0],
      members: members.rows,
      boards: boards.rows,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch project" });
  }
};

const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { project_name, description } = req.body;

    const project = await db.execute({
      sql: "SELECT * FROM projects WHERE project_id = ?",
      args: [projectId],
    });
    if (project.rows.length === 0) return res.status(404).json({ error: "Project not found" });

    if (req.user.role !== "admin" && project.rows[0].created_by !== req.user.user_id) {
      return res.status(403).json({ error: "Only the project owner or admin can update it" });
    }

    await db.execute({
      sql: `UPDATE projects SET project_name = COALESCE(?, project_name),
            description = COALESCE(?, description), updated_at = datetime('now')
            WHERE project_id = ?`,
      args: [project_name || null, description !== undefined ? description : null, projectId],
    });

    await logActivity({
      userId: req.user.user_id,
      entityId: projectId,
      entityType: "project",
      action: "PROJECT_UPDATED",
      details: { project_name, description },
      projectId,
    });

    res.json({ message: "Project updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update project" });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await db.execute({
      sql: "SELECT * FROM projects WHERE project_id = ?",
      args: [projectId],
    });
    if (project.rows.length === 0) return res.status(404).json({ error: "Project not found" });

    if (req.user.role !== "admin" && project.rows[0].created_by !== req.user.user_id) {
      return res.status(403).json({ error: "Only the project owner or admin can delete it" });
    }

    await db.execute({ sql: "DELETE FROM projects WHERE project_id = ?", args: [projectId] });
    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete project" });
  }
};

const addMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { user_id, role = "member" } = req.body;

    const existing = await db.execute({
      sql: "SELECT 1 FROM project_members WHERE project_id = ? AND user_id = ?",
      args: [projectId, user_id],
    });
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "User is already a member" });
    }

    await db.execute({
      sql: `INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)`,
      args: [projectId, user_id, role],
    });

    await logActivity({
      userId: req.user.user_id,
      entityId: projectId,
      entityType: "project",
      action: "MEMBER_ADDED",
      details: { user_id, role },
      projectId,
    });

    res.status(201).json({ message: "Member added successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to add member" });
  }
};

const removeMember = async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    await db.execute({
      sql: "DELETE FROM project_members WHERE project_id = ? AND user_id = ?",
      args: [projectId, userId],
    });
    res.json({ message: "Member removed" });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove member" });
  }
};

module.exports = {
  createProject, getProjects, getProjectById,
  updateProject, deleteProject, addMember, removeMember,
};
