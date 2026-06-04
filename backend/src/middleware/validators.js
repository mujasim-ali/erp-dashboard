const { body, param, query, validationResult } = require("express-validator");

// ── Reusable: handle validation errors ────────────────────────────────────
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ── Auth validators ────────────────────────────────────────────────────────
const validateRegister = [
  body("name")
    .trim().notEmpty().withMessage("Name is required")
    .isLength({ min: 2, max: 50 }).withMessage("Name must be 2-50 characters")
    .matches(/^[a-zA-Z\s]+$/).withMessage("Name can only contain letters and spaces"),
  body("email")
    .trim().notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Must be a valid email")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
    .matches(/\d/).withMessage("Password must contain at least one number"),
  body("role")
    .optional()
    .isIn(["admin", "user"]).withMessage("Role must be admin or user"),
  validate,
];

const validateLogin = [
  body("email")
    .trim().notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Must be a valid email")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("Password is required"),
  validate,
];

// ── Project validators ─────────────────────────────────────────────────────
const validateProject = [
  body("project_name")
    .trim().notEmpty().withMessage("Project name is required")
    .isLength({ min: 2, max: 100 }).withMessage("Project name must be 2-100 characters"),
  body("description")
    .optional()
    .isLength({ max: 500 }).withMessage("Description max 500 characters"),
  validate,
];

// ── Board validators ───────────────────────────────────────────────────────
const validateBoard = [
  body("board_name")
    .trim().notEmpty().withMessage("Board name is required")
    .isLength({ min: 2, max: 100 }).withMessage("Board name must be 2-100 characters"),
  validate,
];

// ── Task validators ────────────────────────────────────────────────────────
const validateTask = [
  body("title")
    .trim().notEmpty().withMessage("Task title is required")
    .isLength({ min: 2, max: 200 }).withMessage("Title must be 2-200 characters"),
  body("description")
    .optional()
    .isLength({ max: 1000 }).withMessage("Description max 1000 characters"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high", "critical"]).withMessage("Invalid priority"),
  body("status")
    .optional()
    .isIn(["todo", "in_progress", "review", "done"]).withMessage("Invalid status"),
  body("due_date")
    .optional()
    .isISO8601().withMessage("due_date must be a valid date (YYYY-MM-DD)"),
  validate,
];

const validateTaskStatus = [
  body("status")
    .notEmpty().withMessage("Status is required")
    .isIn(["todo", "in_progress", "review", "done"]).withMessage("Invalid status"),
  validate,
];

// ── Employee validators ────────────────────────────────────────────────────
const validateEmployee = [
  body("name")
    .trim().notEmpty().withMessage("Name is required")
    .isLength({ min: 2, max: 100 }).withMessage("Name must be 2-100 characters"),
  body("email")
    .trim().notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Must be a valid email")
    .normalizeEmail(),
  body("department")
    .trim().notEmpty().withMessage("Department is required")
    .isLength({ max: 100 }).withMessage("Department max 100 characters"),
  body("position")
    .trim().notEmpty().withMessage("Position is required")
    .isLength({ max: 100 }).withMessage("Position max 100 characters"),
  body("salary")
    .optional()
    .isFloat({ min: 0 }).withMessage("Salary must be a positive number"),
  body("status")
    .optional()
    .isIn(["active", "inactive", "on_leave", "terminated"]).withMessage("Invalid status"),
  body("phone")
    .optional()
    .matches(/^[\d\s\+\-\(\)]{7,20}$/).withMessage("Invalid phone number"),
  body("joined_date")
    .optional()
    .isISO8601().withMessage("joined_date must be a valid date (YYYY-MM-DD)"),
  validate,
];

// ── Inventory validators ───────────────────────────────────────────────────
const validateInventoryItem = [
  body("item_name")
    .trim().notEmpty().withMessage("Item name is required")
    .isLength({ min: 2, max: 200 }).withMessage("Item name must be 2-200 characters"),
  body("category")
    .trim().notEmpty().withMessage("Category is required")
    .isLength({ max: 100 }).withMessage("Category max 100 characters"),
  body("quantity")
    .optional()
    .isInt({ min: 0 }).withMessage("Quantity must be a non-negative integer"),
  body("unit_price")
    .optional()
    .isFloat({ min: 0 }).withMessage("Unit price must be a positive number"),
  body("reorder_level")
    .optional()
    .isInt({ min: 0 }).withMessage("Reorder level must be a non-negative integer"),
  validate,
];

const validateStockAdjustment = [
  body("adjustment")
    .notEmpty().withMessage("adjustment is required")
    .isInt().withMessage("adjustment must be an integer (positive to add, negative to remove)"),
  body("reason")
    .optional()
    .isLength({ max: 200 }).withMessage("Reason max 200 characters"),
  validate,
];

// ── UUID param validator ───────────────────────────────────────────────────
const validateUUID = (paramName) => [
  param(paramName)
    .isUUID().withMessage(`${paramName} must be a valid UUID`),
  validate,
];

module.exports = {
  validateRegister, validateLogin,
  validateProject, validateBoard,
  validateTask, validateTaskStatus,
  validateEmployee,
  validateInventoryItem, validateStockAdjustment,
  validateUUID,
  validate,
};
