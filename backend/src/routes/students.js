const express = require("express");
const router = express.Router();
const { dbGet, dbAll, dbRun } = require("../db");
const { v4: uuidv4 } = require("uuid");

router.get("/", (req, res) => {
  res.json(dbAll("SELECT * FROM students ORDER BY createdAt ASC"));
});

router.post("/", (req, res) => {
  const { code, fullName, className } = req.body;
  if (!code || !fullName || !className) return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
  if (dbGet("SELECT id FROM students WHERE code = ?", [code.toUpperCase()])) return res.status(409).json({ error: "Mã sinh viên đã tồn tại" });
  const id = "st-" + uuidv4();
  dbRun("INSERT INTO students (id,code,fullName,className) VALUES (?,?,?,?)", [id, code.toUpperCase(), fullName, className.toUpperCase()]);
  res.status(201).json(dbGet("SELECT * FROM students WHERE id = ?", [id]));
});

router.put("/:id", (req, res) => {
  const { code, fullName, className } = req.body;
  const { id } = req.params;
  if (!dbGet("SELECT id FROM students WHERE id = ?", [id])) return res.status(404).json({ error: "Không tìm thấy sinh viên" });
  dbRun("UPDATE students SET code=?,fullName=?,className=? WHERE id=?", [code.toUpperCase(), fullName, className.toUpperCase(), id]);
  res.json(dbGet("SELECT * FROM students WHERE id = ?", [id]));
});

router.delete("/:id", (req, res) => {
  if (!dbGet("SELECT id FROM students WHERE id = ?", [req.params.id])) return res.status(404).json({ error: "Không tìm thấy sinh viên" });
  dbRun("DELETE FROM students WHERE id = ?", [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
