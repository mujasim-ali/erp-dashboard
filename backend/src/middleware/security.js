const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const validator = require("express-validator");

// ─── Rate Limiters ──────────────────────────────────────────────────────────

// Login attempt limiter - 5 attempts per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts. Please try again after 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method !== "POST",
});

// Register limiter - 3 new accounts per hour from same IP
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: "Too many accounts created from this IP. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// General API limiter - 100 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limit for health check
    return req.path === "/health";
  },
});

// ─── Input Sanitization ─────────────────────────────────────────────────────

// Sanitize all string inputs to prevent NoSQL injection
const sanitizeInputs = mongoSanitize({
  allowDots: false,
  replaceWith: "_",
});

// ─── Input Validators ──────────────────────────────────────────────────────

const authValidators = {
  register: [
    validator.body("name")
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Name must be 2-100 characters")
      .matches(/^[a-zA-Z\s'-]+$/)
      .withMessage("Name contains invalid characters"),
    validator.body("email")
      .trim()
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail(),
    validator.body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[a-zA-Z\d@$!%*?&]/)
      .withMessage("Password must contain uppercase, lowercase, number and special character"),
    validator.body("role")
      .optional()
      .isIn(["admin", "user"])
      .withMessage("Invalid role"),
  ],

  login: [
    validator.body("email")
      .trim()
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail(),
    validator.body("password")
      .notEmpty()
      .withMessage("Password is required"),
  ],

  updateProfile: [
    validator.body("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Name must be 2-100 characters"),
    validator.body("password")
      .optional()
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
  ],
};

const projectValidators = {
  create: [
    validator.body("project_name")
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage("Project name must be 3-100 characters"),
    validator.body("description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description max 500 characters"),
  ],
  update: [
    validator.body("project_name")
      .optional()
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage("Project name must be 3-100 characters"),
    validator.body("description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description max 500 characters"),
  ],
};

const taskValidators = {
  create: [
    validator.body("title")
      .trim()
      .isLength({ min: 3, max: 200 })
      .withMessage("Title must be 3-200 characters"),
    validator.body("description")
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage("Description max 2000 characters"),
    validator.body("priority")
      .optional()
      .isIn(["low", "medium", "high", "critical"])
      .withMessage("Invalid priority"),
    validator.body("status")
      .optional()
      .isIn(["todo", "in_progress", "review", "done"])
      .withMessage("Invalid status"),
  ],
  updateStatus: [
    validator.body("status")
      .isIn(["todo", "in_progress", "review", "done"])
      .withMessage("Invalid status"),
  ],
};

const employeeValidators = {
  create: [
    validator.body("name")
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Name must be 2-100 characters"),
    validator.body("email")
      .trim()
      .isEmail()
      .withMessage("Invalid email")
      .normalizeEmail(),
    validator.body("department")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Department must be 2-50 characters"),
    validator.body("position")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Position must be 2-50 characters"),
    validator.body("salary")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Salary must be a positive number"),
    validator.body("status")
      .optional()
      .isIn(["active", "inactive", "on_leave", "terminated"])
      .withMessage("Invalid status"),
  ],
};

const inventoryValidators = {
  create: [
    validator.body("item_name")
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Item name must be 2-100 characters"),
    validator.body("category")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Category must be 2-50 characters"),
    validator.body("quantity")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Quantity must be 0 or positive"),
    validator.body("unit_price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Unit price must be positive"),
  ],
  adjustStock: [
    validator.body("adjustment")
      .isInt()
      .withMessage("Adjustment must be an integer")
      .notEmpty()
      .withMessage("Adjustment is required"),
    validator.body("reason")
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage("Reason max 200 characters"),
  ],
};

// ─── Validation Error Handler ──────────────────────────────────────────────

const validationErrorHandler = (req, res, next) => {
  const errors = validator.validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

module.exports = {
  // Rate limiters
  loginLimiter,
  registerLimiter,
  apiLimiter,
  // Sanitization
  sanitizeInputs,
  // Validators
  authValidators,
  projectValidators,
  taskValidators,
  employeeValidators,
  inventoryValidators,
  // Error handler
  validationErrorHandler,
};
