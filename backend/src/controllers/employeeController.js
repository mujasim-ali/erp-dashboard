const { v4: uuidv4 } = require("uuid");
const { db } = require("../db/database");
const { logActivity } = require("../middleware/activityLogger");

const createEmployee = async (req, res) => {
  try {
    const {
      name, email, phone, department, position,
      salary = 0, status = "active", joined_date,
      user_id, avatar_url,
    } = req.body;

    if (!name || !email || !department || !position) {
      return res.status(400).json({ error: "name, email, department and position are required" });
    }

    const existing = await db.execute({
      sql: "SELECT employee_id FROM employees WHERE email = ?",
      args: [email.toLowerCase()],
    });
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Employee with this email already exists" });
    }

    const employeeId = uuidv4();
    await db.execute({
      sql: `INSERT INTO employees
              (employee_id, user_id, name, email, phone, department, position, salary, status, joined_date, avatar_url, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        employeeId, user_id || null, name.trim(), email.toLowerCase().trim(),
        phone || null, department.trim(), position.trim(),
        salary, status, joined_date || new Date().toISOString().split("T")[0],
        avatar_url || null, req.user.user_id,
      ],
    });

    await logActivity({
      userId: req.user.user_id,
      entityId: employeeId,
      entityType: "employee",
      action: "EMPLOYEE_CREATED",
      details: { name, department, position },
    });

    const employee = await db.execute({
      sql: "SELECT * FROM employees WHERE employee_id = ?",
      args: [employeeId],
    });

    res.status(201).json({ message: "Employee created", employee: employee.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create employee" });
  }
};

const getEmployees = async (req, res) => {
  try {
    const { department, status, search, limit = 50, offset = 0 } = req.query;

    let sql = "SELECT * FROM employees WHERE 1=1";
    const args = [];

    if (department) { sql += " AND department = ?"; args.push(department); }
    if (status) { sql += " AND status = ?"; args.push(status); }
    if (search) {
      sql += " AND (name LIKE ? OR email LIKE ? OR position LIKE ?)";
      args.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    args.push(Number(limit), Number(offset));

    const result = await db.execute({ sql, args });

    const total = await db.execute({
      sql: "SELECT COUNT(*) as count FROM employees",
      args: [],
    });

    // Department breakdown
    const departments = await db.execute({
      sql: "SELECT department, COUNT(*) as count FROM employees WHERE status = 'active' GROUP BY department",
      args: [],
    });

    res.json({
      employees: result.rows,
      total: Number(total.rows[0].count),
      departments: departments.rows,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch employees" });
  }
};

const getEmployeeById = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const result = await db.execute({
      sql: "SELECT * FROM employees WHERE employee_id = ?",
      args: [employeeId],
    });
    if (result.rows.length === 0) return res.status(404).json({ error: "Employee not found" });

    // Their assigned tasks
    const tasks = await db.execute({
      sql: `SELECT t.task_id, t.title, t.status, t.priority, p.project_name
            FROM tasks t
            LEFT JOIN projects p ON p.project_id = t.project_id
            WHERE t.assigned_to = (SELECT user_id FROM employees WHERE employee_id = ?)
            ORDER BY t.created_at DESC LIMIT 10`,
      args: [employeeId],
    });

    res.json({ employee: result.rows[0], tasks: tasks.rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch employee" });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const {
      name, email, phone, department, position,
      salary, status, joined_date, avatar_url,
    } = req.body;

    const existing = await db.execute({
      sql: "SELECT * FROM employees WHERE employee_id = ?",
      args: [employeeId],
    });
    if (existing.rows.length === 0) return res.status(404).json({ error: "Employee not found" });

    await db.execute({
      sql: `UPDATE employees SET
              name       = COALESCE(?, name),
              email      = COALESCE(?, email),
              phone      = COALESCE(?, phone),
              department = COALESCE(?, department),
              position   = COALESCE(?, position),
              salary     = COALESCE(?, salary),
              status     = COALESCE(?, status),
              joined_date= COALESCE(?, joined_date),
              avatar_url = COALESCE(?, avatar_url),
              updated_at = datetime('now')
            WHERE employee_id = ?`,
      args: [
        name || null, email || null, phone || null,
        department || null, position || null, salary ?? null,
        status || null, joined_date || null, avatar_url || null,
        employeeId,
      ],
    });

    await logActivity({
      userId: req.user.user_id,
      entityId: employeeId,
      entityType: "employee",
      action: "EMPLOYEE_UPDATED",
      details: { status, department },
    });

    res.json({ message: "Employee updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update employee" });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const result = await db.execute({
      sql: "SELECT * FROM employees WHERE employee_id = ?",
      args: [employeeId],
    });
    if (result.rows.length === 0) return res.status(404).json({ error: "Employee not found" });

    await db.execute({
      sql: "DELETE FROM employees WHERE employee_id = ?",
      args: [employeeId],
    });
    res.json({ message: "Employee deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete employee" });
  }
};

const getEmployeeStats = async (req, res) => {
  try {
    const stats = await db.execute(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive,
        SUM(CASE WHEN status = 'on_leave' THEN 1 ELSE 0 END) as on_leave,
        SUM(CASE WHEN status = 'terminated' THEN 1 ELSE 0 END) as terminated,
        COUNT(DISTINCT department) as total_departments,
        ROUND(AVG(salary), 2) as avg_salary
      FROM employees
    `);

    const byDepartment = await db.execute(`
      SELECT department, COUNT(*) as count,
             ROUND(AVG(salary), 2) as avg_salary
      FROM employees WHERE status = 'active'
      GROUP BY department ORDER BY count DESC
    `);

    res.json({ stats: stats.rows[0], by_department: byDepartment.rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch employee stats" });
  }
};

module.exports = {
  createEmployee, getEmployees, getEmployeeById,
  updateEmployee, deleteEmployee, getEmployeeStats,
};

