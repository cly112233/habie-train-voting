import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data.db");

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initTables(db);
  }
  return db;
}

function initTables(db: Database.Database) {
  // 为已有数据库添加 avatar 列（如果不存在）
  try { db.exec("ALTER TABLE users ADD COLUMN avatar TEXT DEFAULT ''"); } catch { /* 列已存在 */ }
  try { db.exec("ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0"); } catch { /* 列已存在 */ }

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      bio TEXT DEFAULT '',
      avatar TEXT DEFAULT '',
      is_admin INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS cycles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK(type IN ('character','modifier')),
      start_date TEXT NOT NULL,
      submission_end_date TEXT NOT NULL,
      voting_start_date TEXT NOT NULL,
      voting_end_date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS characters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id),
      cycle_id INTEGER NOT NULL REFERENCES cycles(id),
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('平民','警长','特殊中立','杀手方中立','杀手')),
      short_desc TEXT NOT NULL,
      description TEXT NOT NULL,
      shop TEXT DEFAULT '',
      story TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      is_resubmit INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS modifiers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id),
      cycle_id INTEGER NOT NULL REFERENCES cycles(id),
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      story TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      is_resubmit INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id),
      submission_type TEXT NOT NULL CHECK(submission_type IN ('character','modifier')),
      submission_id INTEGER NOT NULL,
      cycle_id INTEGER NOT NULL REFERENCES cycles(id),
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, submission_type, cycle_id)
    );

    CREATE TABLE IF NOT EXISTS reactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id),
      submission_type TEXT NOT NULL CHECK(submission_type IN ('character','modifier')),
      submission_id INTEGER NOT NULL,
      reaction TEXT NOT NULL CHECK(reaction IN ('like','dislike')),
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, submission_type, submission_id)
    );

    CREATE TABLE IF NOT EXISTS suggestions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id),
      submission_type TEXT NOT NULL CHECK(submission_type IN ('character','modifier')),
      submission_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_characters_cycle ON characters(cycle_id);
    CREATE INDEX IF NOT EXISTS idx_modifiers_cycle ON modifiers(cycle_id);
    CREATE INDEX IF NOT EXISTS idx_votes_cycle ON votes(cycle_id, submission_type);
    CREATE INDEX IF NOT EXISTS idx_reactions_submission ON reactions(submission_type, submission_id);
    CREATE INDEX IF NOT EXISTS idx_suggestions_submission ON suggestions(submission_type, submission_id);
  `);
}
