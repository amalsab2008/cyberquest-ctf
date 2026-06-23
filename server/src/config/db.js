const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

let pool = null;
let sqliteDb = null;
let isSqlite = false;

// Load environment variables
const DB_URI = process.env.DATABASE_URL;

if (DB_URI) {
  console.log('Connecting to PostgreSQL database...');
  pool = new Pool({
    connectionString: DB_URI,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
} else {
  console.log('No DATABASE_URL found. Falling back to local SQLite...');
  isSqlite = true;
  const dbDir = path.join(__dirname, '..', '..', 'data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  const dbPath = path.join(dbDir, 'cyberquest.db');
  sqliteDb = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening SQLite database:', err.message);
    } else {
      console.log('Connected to local SQLite database at:', dbPath);
    }
  });
}

// Unified query wrapper that mimics the pg pool interface
async function query(text, params = []) {
  if (isSqlite) {
    return new Promise((resolve, reject) => {
      // Convert PostgreSQL style parameters $1, $2 to SQLite styles ?
      let sqliteText = text;
      // Replace $1, $2, ... with ?
      sqliteText = sqliteText.replace(/\$\d+/g, '?');

      // Check if it is a SELECT query or modifying query
      const isSelect = sqliteText.trim().toLowerCase().startsWith('select');

      if (isSelect) {
        sqliteDb.all(sqliteText, params, (err, rows) => {
          if (err) {
            console.error('SQLite query error:', err, 'SQL:', sqliteText);
            reject(err);
          } else {
            resolve({ rows });
          }
        });
      } else {
        sqliteDb.run(sqliteText, params, function (err) {
          if (err) {
            console.error('SQLite execute error:', err, 'SQL:', sqliteText);
            reject(err);
          } else {
            // For inserts, return lastID in rows structure for compatibility
            resolve({ 
              rows: [{ id: this.lastID }], 
              rowCount: this.changes 
            });
          }
        });
      }
    });
  } else {
    // PostgreSQL
    try {
      const res = await pool.query(text, params);
      return res;
    } catch (err) {
      console.error('PostgreSQL query error:', err, 'SQL:', text);
      throw err;
    }
  }
}

// Database schema initialization
async function initDb() {
  console.log('Initializing database schema...');

  const usersTable = isSqlite ? `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      roll_number TEXT NOT NULL,
      college_name TEXT NOT NULL,
      role TEXT DEFAULT 'student',
      score INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  ` : `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      roll_number VARCHAR(100) NOT NULL,
      college_name VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'student',
      score INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const challengesTable = isSqlite ? `
    CREATE TABLE IF NOT EXISTS challenges (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      points INTEGER NOT NULL,
      category TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      flag TEXT NOT NULL,
      files TEXT, -- JSON string
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  ` : `
    CREATE TABLE IF NOT EXISTS challenges (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      points INTEGER NOT NULL,
      category VARCHAR(100) NOT NULL,
      difficulty VARCHAR(50) NOT NULL,
      flag VARCHAR(255) NOT NULL,
      files JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const hintsTable = isSqlite ? `
    CREATE TABLE IF NOT EXISTS hints (
      id TEXT PRIMARY KEY,
      challenge_id TEXT NOT NULL,
      hint_text TEXT NOT NULL,
      penalty INTEGER DEFAULT 0,
      FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE
    );
  ` : `
    CREATE TABLE IF NOT EXISTS hints (
      id VARCHAR(255) PRIMARY KEY,
      challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
      hint_text TEXT NOT NULL,
      penalty INTEGER DEFAULT 0
    );
  `;

  const solvesTable = isSqlite ? `
    CREATE TABLE IF NOT EXISTS solves (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      challenge_id TEXT NOT NULL,
      points_awarded INTEGER NOT NULL,
      hints_used TEXT, -- JSON string of hint IDs
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
      UNIQUE(user_id, challenge_id)
    );
  ` : `
    CREATE TABLE IF NOT EXISTS solves (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
      points_awarded INTEGER NOT NULL,
      hints_used JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, challenge_id)
    );
  `;

  const submissionsTable = isSqlite ? `
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      challenge_id TEXT NOT NULL,
      submitted_flag TEXT NOT NULL,
      is_correct BOOLEAN NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE
    );
  ` : `
    CREATE TABLE IF NOT EXISTS submissions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
      submitted_flag VARCHAR(255) NOT NULL,
      is_correct BOOLEAN NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const badgesTable = isSqlite ? `
    CREATE TABLE IF NOT EXISTS badges (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL,
      rule_type TEXT NOT NULL
    );
  ` : `
    CREATE TABLE IF NOT EXISTS badges (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      icon VARCHAR(100) NOT NULL,
      rule_type VARCHAR(100) NOT NULL
    );
  `;

  const userBadgesTable = isSqlite ? `
    CREATE TABLE IF NOT EXISTS user_badges (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      badge_id TEXT NOT NULL,
      awarded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
      UNIQUE(user_id, badge_id)
    );
  ` : `
    CREATE TABLE IF NOT EXISTS user_badges (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      badge_id VARCHAR(255) NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
      awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, badge_id)
    );
  `;

  const unlockedHintsTable = isSqlite ? `
    CREATE TABLE IF NOT EXISTS unlocked_hints (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      challenge_id TEXT NOT NULL,
      hint_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
      FOREIGN KEY (hint_id) REFERENCES hints(id) ON DELETE CASCADE,
      UNIQUE(user_id, hint_id)
    );
  ` : `
    CREATE TABLE IF NOT EXISTS unlocked_hints (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
      hint_id VARCHAR(255) NOT NULL REFERENCES hints(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, hint_id)
    );
  `;

  try {
    await query(usersTable);
    await query(challengesTable);
    await query(hintsTable);
    await query(solvesTable);
    await query(submissionsTable);
    await query(badgesTable);
    await query(userBadgesTable);
    await query(unlockedHintsTable);
    console.log('Database tables successfully initialized!');
  } catch (error) {
    console.error('Error during database initialization:', error);
  }
}

module.exports = {
  query,
  initDb,
  isSqlite
};
