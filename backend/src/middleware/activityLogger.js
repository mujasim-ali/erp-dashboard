const { db } = require("../db/database");
const { v4: uuidv4 } = require("uuid");

async function logActivity({ userId, entityId, entityType, action, details, projectId }) {
  try {
    await db.execute({
      sql: `INSERT INTO activity_log (log_id, user_id, entity_id, entity_type, action, details, project_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        uuidv4(),
        userId || null,
        entityId,
        entityType,
        action,
        typeof details === "object" ? JSON.stringify(details) : details,
        projectId || null,
      ],
    });
  } catch (err) {
    console.error("Activity log error:", err.message);
  }
}

module.exports = { logActivity };
