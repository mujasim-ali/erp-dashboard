const { createClient } = require("@libsql/client");
const path = require("path");

const db = createClient({
  url: process.env.DATABASE_URL || `file:${path.join(__dirname, "../../erp.db")}`,
});

async function initializeDatabase() {
  // Users table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      user_id    TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      email      TEXT UNIQUE NOT NULL,
      password   TEXT NOT NULL,
      role       TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('admin','user')),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Projects table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS projects (
      project_id   TEXT PRIMARY KEY,
      project_name TEXT NOT NULL,
      description  TEXT,
      created_by   TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      created_at   TEXT DEFAULT (datetime('now')),
      updated_at   TEXT DEFAULT (datetime('now'))
    )
  `);

  // Boards table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS boards (
      board_id   TEXT PRIMARY KEY,
      board_name TEXT NOT NULL,
      project_id TEXT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
      created_at TEXT DEFAULT (datetime('now')),
      updated_by TEXT REFERENCES users(user_id)
    )
  `);

  // Tasks table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      task_id     TEXT PRIMARY KEY,
      title       TEXT NOT NULL,
      description TEXT,
      board_id    TEXT NOT NULL REFERENCES boards(board_id) ON DELETE CASCADE,
      project_id  TEXT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
      assigned_to TEXT REFERENCES users(user_id),
      status      TEXT DEFAULT 'todo' CHECK(status IN ('todo','in_progress','review','done')),
      priority    TEXT DEFAULT 'medium' CHECK(priority IN ('low','medium','high','critical')),
      due_date    TEXT,
      created_by  TEXT REFERENCES users(user_id),
      created_at  TEXT DEFAULT (datetime('now')),
      updated_at  TEXT DEFAULT (datetime('now'))
    )
  `);

  // Activity log table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS activity_log (
      log_id     TEXT PRIMARY KEY,
      user_id    TEXT REFERENCES users(user_id),
      entity_id  TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      action     TEXT NOT NULL,
      details    TEXT,
      project_id TEXT REFERENCES projects(project_id),
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Project members (many-to-many)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS project_members (
      project_id TEXT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
      user_id    TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      role       TEXT DEFAULT 'member',
      joined_at  TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (project_id, user_id)
    )
  `);

  // AI chat history
  await db.execute(`
    CREATE TABLE IF NOT EXISTS ai_chat_history (
      id         TEXT PRIMARY KEY,
      user_id    TEXT NOT NULL REFERENCES users(user_id),
      project_id TEXT REFERENCES projects(project_id),
      role       TEXT NOT NULL CHECK(role IN ('user','assistant')),
      content    TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  console.log("✅ Database initialized successfully");
}

module.exports = { db, initializeDatabase };
