import Database from "better-sqlite3";
import path from "path";

const db = new Database(path.join(__dirname, "../data.db"));

db.pragma("foreign_keys = ON");

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS api_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cache_key TEXT UNIQUE NOT NULL,
      data TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      city TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      created_at INTEGER NOT NULL
    )
  `);

  console.log("✅ Database initialized");
}

initDatabase();

export default db;
