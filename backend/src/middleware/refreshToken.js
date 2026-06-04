const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { db } = require("../db/database");

const JWT_SECRET = process.env.JWT_SECRET || "erp_secret_key";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "erp_refresh_secret_key";
const ACCESS_EXPIRES = "15m";       // short-lived access token
const REFRESH_EXPIRES = "7d";       // long-lived refresh token

// ── Generate token pair ───────────────────────────────────────────────────
function generateTokens(userId, role) {
  const accessToken = jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: ACCESS_EXPIRES });
  const refreshToken = jwt.sign({ userId, role, jti: uuidv4() }, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES,
  });
  return { accessToken, refreshToken };
}

// ── Store refresh token in DB ─────────────────────────────────────────────
async function saveRefreshToken(userId, token) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await db.execute({
    sql: `INSERT OR REPLACE INTO refresh_tokens (token, user_id, expires_at)
          VALUES (?, ?, ?)`,
    args: [token, userId, expiresAt],
  });
}

// ── Route: POST /api/auth/refresh ─────────────────────────────────────────
const refreshAccessToken = async (req, res) => {
  try {
    // Accept token from cookie OR body
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!token) {
      return res.status(401).json({ error: "Refresh token required" });
    }

    // Verify signature
    let decoded;
    try {
      decoded = jwt.verify(token, REFRESH_SECRET);
    } catch {
      return res.status(401).json({ error: "Invalid or expired refresh token" });
    }

    // Check token exists in DB (not revoked)
    const stored = await db.execute({
      sql: "SELECT * FROM refresh_tokens WHERE token = ? AND user_id = ?",
      args: [token, decoded.userId],
    });

    if (stored.rows.length === 0) {
      return res.status(401).json({ error: "Refresh token has been revoked" });
    }

    // Check expiry
    if (new Date(stored.rows[0].expires_at) < new Date()) {
      await db.execute({ sql: "DELETE FROM refresh_tokens WHERE token = ?", args: [token] });
      return res.status(401).json({ error: "Refresh token expired, please login again" });
    }

    // Get fresh user data
    const userResult = await db.execute({
      sql: "SELECT user_id, role FROM users WHERE user_id = ?",
      args: [decoded.userId],
    });
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    const user = userResult.rows[0];

    // Rotate: delete old, issue new pair
    await db.execute({ sql: "DELETE FROM refresh_tokens WHERE token = ?", args: [token] });
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.user_id, user.role);
    await saveRefreshToken(user.user_id, newRefreshToken);

    // Set new refresh token as httpOnly cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
  } catch (err) {
    console.error("Refresh token error:", err);
    res.status(500).json({ error: "Token refresh failed" });
  }
};

// ── Route: POST /api/auth/logout ──────────────────────────────────────────
const logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (token) {
      await db.execute({ sql: "DELETE FROM refresh_tokens WHERE token = ?", args: [token] });
    }
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ error: "Logout failed" });
  }
};

// ── Route: POST /api/auth/logout-all (revoke all sessions) ───────────────
const logoutAll = async (req, res) => {
  try {
    await db.execute({
      sql: "DELETE FROM refresh_tokens WHERE user_id = ?",
      args: [req.user.user_id],
    });
    res.clearCookie("refreshToken");
    res.json({ message: "All sessions terminated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to terminate sessions" });
  }
};

module.exports = {
  generateTokens, saveRefreshToken,
  refreshAccessToken, logout, logoutAll,
};
