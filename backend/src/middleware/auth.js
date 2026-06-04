const jwt = require("jsonwebtoken");
const { db } = require("../db/database");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "erp_secret_key");

    const result = await db.execute({
      sql: "SELECT user_id, name, email, role FROM users WHERE user_id = ?",
      args: [decoded.userId],
    });

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

const requireProjectAccess = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.body.project_id;
    if (!projectId) return next();

    // Admins have global access
    if (req.user.role === "admin") return next();

    // Check if user is a member or creator
    const result = await db.execute({
      sql: `SELECT 1 FROM projects p
            LEFT JOIN project_members pm ON pm.project_id = p.project_id AND pm.user_id = ?
            WHERE p.project_id = ? AND (p.created_by = ? OR pm.user_id IS NOT NULL)`,
      args: [req.user.user_id, projectId, req.user.user_id],
    });

    if (result.rows.length === 0) {
      return res.status(403).json({ error: "Access denied to this project" });
    }
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { authenticate, requireAdmin, requireProjectAccess };
