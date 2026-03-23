const express = require("express");
const router = express.Router();
const { dbGet, dbAll, dbRun } = require("../db");
const { v4: uuidv4 } = require("uuid");

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Thiếu tài khoản hoặc mật khẩu" });
  const user = dbGet("SELECT * FROM users WHERE LOWER(username) = LOWER(?)", [username]);
  if (!user || user.password !== password) return res.status(401).json({ error: "Sai tài khoản hoặc mật khẩu!" });
  const { password: _, ...authData } = user;
  res.json(authData);
});

router.post("/register", (req, res) => {
  const { fullName, studentCode, className, password } = req.body;
  if (!fullName || !studentCode || !className || !password) return res.status(400).json({ error: "Vui lòng điền đầy đủ thông tin!" });
  if (dbGet("SELECT id FROM users WHERE LOWER(username) = LOWER(?)", [studentCode])) return res.status(409).json({ error: "Mã sinh viên đã được đăng ký!" });
  const userId = "usr-" + uuidv4();
  if (!dbGet("SELECT id FROM students WHERE LOWER(code) = LOWER(?)", [studentCode])) {
    dbRun("INSERT INTO students (id,code,fullName,className) VALUES (?,?,?,?)", ["st-" + uuidv4(), studentCode.toUpperCase(), fullName, className.toUpperCase()]);
  }
  dbRun("INSERT INTO users (id,username,password,fullName,role,studentCode) VALUES (?,?,?,?,?,?)", [userId, studentCode.toLowerCase(), password, fullName, "sinh_vien", studentCode.toUpperCase()]);
  res.status(201).json({ success: true, message: "Đăng ký thành công! Hãy đăng nhập." });
});

router.get("/users", (req, res) => {
  res.json(dbAll("SELECT id,username,fullName,role,studentCode,createdAt FROM users ORDER BY createdAt ASC"));
});

module.exports = router;
