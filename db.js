const initSqlJs = require('sql.js')
const fs = require('fs')
const path = require('path')
const bcrypt = require('bcryptjs')

const DB_PATH = path.join(__dirname, 'bibi.db')
let _db = null

function save() {
  if (_db) fs.writeFileSync(DB_PATH, Buffer.from(_db.export()))
}

function wrapStmt(sql) {
  return {
    get(...args) {
      const stmt = _db.prepare(sql)
      try {
        stmt.bind(args)
        if (stmt.step()) return stmt.getAsObject()
        return undefined
      } finally {
        stmt.free()
      }
    },
    all(...args) {
      const rows = []
      const stmt = _db.prepare(sql)
      try {
        stmt.bind(args)
        while (stmt.step()) rows.push(stmt.getAsObject())
        return rows
      } finally {
        stmt.free()
      }
    },
    run(...args) {
      _db.run(sql, args)
      const ri = _db.exec('SELECT last_insert_rowid()')[0]?.values[0][0]
      save()
      return { lastInsertRowid: ri }
    }
  }
}

const db = {
  prepare: (sql) => wrapStmt(sql),
  exec: (sql) => { _db.run(sql); }
}

async function initDb() {
  const SQL = await initSqlJs()

  if (fs.existsSync(DB_PATH)) {
    _db = new SQL.Database(fs.readFileSync(DB_PATH))
  } else {
    _db = new SQL.Database()
  }

  _db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    is_staff INTEGER DEFAULT 0,
    is_goedgekeurd INTEGER DEFAULT 0,
    totp_secret TEXT,
    is_totp_enabled INTEGER DEFAULT 0,
    totp_method TEXT DEFAULT 'totp',
    email TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`)

  try { _db.run(`ALTER TABLE users ADD COLUMN totp_method TEXT DEFAULT 'totp'`) } catch {}
  try { _db.run(`ALTER TABLE users ADD COLUMN email TEXT`) } catch {}
  try { _db.run(`ALTER TABLE users ADD COLUMN is_goedgekeurd INTEGER DEFAULT 0`) } catch {}
  _db.run(`UPDATE users SET is_goedgekeurd = 1 WHERE is_staff = 1`)

  _db.run(`CREATE TABLE IF NOT EXISTS notulen (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titel TEXT NOT NULL,
    inhoud TEXT DEFAULT '',
    datum TEXT DEFAULT (datetime('now')),
    gewijzigd_op TEXT,
    auteur_id INTEGER,
    FOREIGN KEY (auteur_id) REFERENCES users(id) ON DELETE SET NULL
  )`)

  _db.run(`CREATE TABLE IF NOT EXISTS signalen (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titel TEXT NOT NULL,
    bericht TEXT DEFAULT '',
    prioriteit INTEGER DEFAULT 1,
    datum TEXT DEFAULT (datetime('now')),
    is_actief INTEGER DEFAULT 1,
    auteur_id INTEGER,
    FOREIGN KEY (auteur_id) REFERENCES users(id) ON DELETE SET NULL
  )`)

  _db.run(`CREATE TABLE IF NOT EXISTS mappen (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    naam TEXT NOT NULL,
    beschrijving TEXT DEFAULT '',
    aangemaakt_op TEXT DEFAULT (datetime('now')),
    aangemaakt_door INTEGER,
    FOREIGN KEY (aangemaakt_door) REFERENCES users(id) ON DELETE SET NULL
  )`)

  _db.run(`CREATE TABLE IF NOT EXISTS map_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    map_id INTEGER NOT NULL,
    titel TEXT NOT NULL,
    inhoud TEXT DEFAULT '',
    aangemaakt_op TEXT DEFAULT (datetime('now')),
    gewijzigd_op TEXT,
    auteur_id INTEGER,
    FOREIGN KEY (map_id) REFERENCES mappen(id) ON DELETE CASCADE,
    FOREIGN KEY (auteur_id) REFERENCES users(id) ON DELETE SET NULL
  )`)

  save()

  const admin = db.prepare('SELECT id FROM users WHERE username = ?').get('admin')
  if (!admin) {
    const hash = bcrypt.hashSync('admin123', 10)
    db.prepare('INSERT INTO users (username, password, is_staff, is_goedgekeurd) VALUES (?, ?, 1, 1)').run('admin', hash)
    console.log('Admin aangemaakt: admin / admin123')
  }
}

module.exports = { db, initDb }
