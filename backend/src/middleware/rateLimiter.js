const rateLimit = require("express-rate-limit");

// ── General API limiter ────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests from this IP, please try again after 15 minutes",
    retryAfter: "15 minutes",
  },
});

// ── Auth limiter (strict) ──────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // only 10 login/register attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many login attempts from this IP, please try again after 15 minutes",
    retryAfter: "15 minutes",
  },
  skipSuccessfulRequests: true, // don't count successful logins
});

// ── AI limiter (expensive calls) ──────────────────────────────────────────
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // 30 AI calls per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "AI request limit reached. You can make 30 AI requests per hour.",
    retryAfter: "1 hour",
  },
});

// ── Password reset limiter ─────────────────────────────────────────────────
const passwordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    error: "Too many password reset attempts, please try again after 1 hour",
  },
});

module.exports = { apiLimiter, authLimiter, aiLimiter, passwordLimiter };
