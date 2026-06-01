const { db } = require("../db/database");

const getActivityLogs = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { limit = 50, offset = 0, entity_type, action } = req.query;

    let sql = `SELECT al.*, u.name as user_name FROM activity_log al
               LEFT JOIN users u ON u.user_id = al.user_id
               WHERE al.project_id = ?`;
    const args = [projectId];

    if (entity_type) { sql += " AND al.entity_type = ?"; args.push(entity_type); }
    if (action) { sql += " AND al.action = ?"; args.push(action); }

    sql += " ORDER BY al.created_at DESC LIMIT ? OFFSET ?";
    args.push(Number(limit), Number(offset));

    const result = await db.execute({ sql, args });

    const total = await db.execute({
      sql: "SELECT COUNT(*) as count FROM activity_log WHERE project_id = ?",
      args: [projectId],
    });

    res.json({
      logs: result.rows,
      total: Number(total.rows[0].count),
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch activity logs" });
  }
};

const getGlobalActivityLogs = async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const result = await db.execute({
      sql: `SELECT al.*, u.name as user_name FROM activity_log al
            LEFT JOIN users u ON u.user_id = al.user_id
            ORDER BY al.created_at DESC LIMIT ? OFFSET ?`,
      args: [Number(limit), Number(offset)],
    });
    res.json({ logs: result.rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch logs" });
  }
};

module.exports = { getActivityLogs, getGlobalActivityLogs };
