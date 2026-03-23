const initSqlJs = require("sql.js");
const path = require("path");
const fs = require("fs");

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "../data/grade_manager.db");

// Đảm bảo thư mục data tồn tại
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db;

// Lưu DB xuống file
function saveDb() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

async function initDb() {
  const SQL = await initSqlJs();

  // Load DB từ file nếu đã tồn tại, không thì tạo mới
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Tạo bảng
  db.run(`
    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      fullName TEXT NOT NULL,
      className TEXT NOT NULL,
      createdAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS grade_records (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      subject TEXT NOT NULL,
      semester TEXT NOT NULL,
      midterm REAL NOT NULL,
      final REAL NOT NULL,
      bonus REAL DEFAULT 0,
      createdAt TEXT DEFAULT (datetime('now')),
      UNIQUE(studentId, subject, semester)
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      fullName TEXT NOT NULL,
      role TEXT NOT NULL,
      studentCode TEXT,
      createdAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS forgot_requests (
      id TEXT PRIMARY KEY,
      account TEXT NOT NULL,
      fullName TEXT NOT NULL,
      studentCode TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      status TEXT DEFAULT 'queued'
    );
  `);

  // Seed dữ liệu nếu chưa có
  const userCount = dbGet("SELECT COUNT(*) as count FROM users");
  if (!userCount || userCount.count === 0) {
    db.run(`INSERT OR IGNORE INTO students VALUES ('st-1','SV001','Nguyen Minh Quan','CNTT-K16A',datetime('now'))`);
    db.run(`INSERT OR IGNORE INTO students VALUES ('st-2','SV002','Tran Thu Ha','CNTT-K16A',datetime('now'))`);
    db.run(`INSERT OR IGNORE INTO students VALUES ('st-3','SV003','Le Hoang Nam','KTPM-K16B',datetime('now'))`);
    db.run(`INSERT OR IGNORE INTO grade_records VALUES ('gr-1','st-1','Lap trinh web','HK1 2025-2026',8,8.5,0.3,datetime('now'))`);
    db.run(`INSERT OR IGNORE INTO grade_records VALUES ('gr-2','st-2','Co so du lieu','HK1 2025-2026',7,8,0.2,datetime('now'))`);
    db.run(`INSERT OR IGNORE INTO grade_records VALUES ('gr-3','st-3','Toan cao cap','HK1 2025-2026',6.5,7.2,0,datetime('now'))`);
    db.run(`INSERT OR IGNORE INTO users VALUES ('usr-admin','admin','admin123','Quan tri vien','admin',NULL,datetime('now'))`);
    db.run(`INSERT OR IGNORE INTO users VALUES ('usr-sv-1','sv001','sv123','Nguyen Minh Quan','sinh_vien','SV001',datetime('now'))`);
    saveDb();
    console.log("✅ Đã seed dữ liệu mặc định");
  }

  console.log("✅ Database sẵn sàng");
  return db;
}

// Helper: lấy 1 dòng
function dbGet(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return null;
  } catch { return null; }
}

// Helper: lấy nhiều dòng
function dbAll(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
  } catch { return []; }
}

// Helper: chạy lệnh INSERT/UPDATE/DELETE
function dbRun(sql, params = []) {
  db.run(sql, params);
  saveDb();
}

module.exports = { initDb, dbGet, dbAll, dbRun, saveDb };
