const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { db } = require("../db/database");
const { logActivity } = require("../middleware/activityLogger");

const JWT_SECRET = process.env.JWT_SECRET || "erp_secret_key";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

const register = async (req, res) => {
  try {
    const { name, email, password, role = "user" } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }

    // Check existing user
    const existing = await db.execute({
      sql: "SELECT user_id FROM users WHERE email = ?",
      args: [email.toLowerCase()],
    });
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = uuidv4();

    await db.execute({
      sql: `INSERT INTO users (user_id, name, email, password, role) VALUES (?, ?, ?, ?, ?)`,
      args: [userId, name.trim(), email.toLowerCase().trim(), hashedPassword, role],
    });

    const token = jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    await logActivity({
      userId,
      entityId: userId,
      entityType: "user",
      action: "USER_REGISTERED",
      details: { name, email },
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: { user_id: userId, name, email: email.toLowerCase(), role },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await db.execute({
      sql: "SELECT * FROM users WHERE email = ?",
      args: [email.toLowerCase().trim()],
    });

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.user_id, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES,
    });

    await logActivity({
      userId: user.user_id,
      entityId: user.user_id,
      entityType: "user",
      action: "USER_LOGIN",
      details: { email },
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
};

const getMe = async (req, res) => {
  try {
    const result = await db.execute({
      sql: "SELECT user_id, name, email, role, created_at FROM users WHERE user_id = ?",
      args: [req.user.user_id],
    });
    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, password } = req.body;
    const updates = [];
    const args = [];

    if (name) {
      updates.push("name = ?");
      args.push(name.trim());
    }
    if (password) {
      updates.push("password = ?");
      args.push(await bcrypt.hash(password, 12));
    }
    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    updates.push("updated_at = datetime('now')");
    args.push(req.user.user_id);

    await db.execute({
      sql: `UPDATE users SET ${updates.join(", ")} WHERE user_id = ?`,
      args,
    });

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const result = await db.execute(
      "SELECT user_id, name, email, role, created_at FROM users ORDER BY created_at DESC"
    );
    res.json({ users: result.rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

module.exports = { register, login, getMe, updateProfile, getAllUsers };
