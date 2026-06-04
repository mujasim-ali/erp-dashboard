const hpp = require("hpp");

// ── Strip dangerous characters from strings ────────────────────────────────
function sanitizeString(value) {
  if (typeof value !== "string") return value;
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")           // strip HTML tags
    .replace(/javascript:/gi, "")      // strip js: protocol
    .replace(/on\w+\s*=/gi, "")        // strip event handlers
    .trim();
}

// ── Recursively sanitize all string fields in req.body ────────────────────
function sanitizeObject(obj) {
  if (!obj || typeof obj !== "object") return obj;
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === "string") {
      obj[key] = sanitizeString(obj[key]);
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      obj[key] = sanitizeObject(obj[key]);
    }
  }
  return obj;
}

// ── Middleware: sanitize body, query, params ───────────────────────────────
const sanitizeInputs = (req, res, next) => {
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);
  next();
};

// ── Middleware: block NoSQL injection patterns ─────────────────────────────
const blockNoSQLInjection = (req, res, next) => {
  const dangerous = ["$where", "$gt", "$lt", "$ne", "$in", "$nin", "$or", "$and", "$not", "$nor", "$regex"];
  const bodyStr = JSON.stringify(req.body || {});
  const queryStr = JSON.stringify(req.query || {});

  for (const op of dangerous) {
    if (bodyStr.includes(op) || queryStr.includes(op)) {
      return res.status(400).json({ error: "Invalid input detected" });
    }
  }
  next();
};

// ── HPP - prevent HTTP parameter pollution ────────────────────────────────
const preventParamPollution = hpp({
  whitelist: ["status", "priority", "department", "category", "role"],
});

module.exports = { sanitizeInputs, blockNoSQLInjection, preventParamPollution };
