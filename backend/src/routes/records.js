const express = require("express");
const router = express.Router();
const { dbGet, dbAll, dbRun } = require("../db");
const { v4: uuidv4 } = require("uuid");

router.get("/", (req, res) => {
  res.json(dbAll("SELECT * FROM grade_records ORDER BY createdAt ASC"));
});

router.post("/", (req, res) => {
  const { studentId, subject, semester, midterm, final, bonus } = req.body;
  if (!studentId || !subject || !semester || midterm == null || final == null) return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
  if (!dbGet("SELECT id FROM students WHERE id = ?", [studentId])) return res.status(404).json({ error: "Không tìm thấy sinh viên" });
  if (dbGet("SELECT id FROM grade_records WHERE studentId=? AND subject=? AND semester=?", [studentId, subject, semester])) return res.status(409).json({ error: "Sinh viên đã có điểm môn này trong học kỳ này" });
  const id = "gr-" + uuidv4();
  dbRun("INSERT INTO grade_records (id,studentId,subject,semester,midterm,final,bonus) VALUES (?,?,?,?,?,?,?)", [id, studentId, subject, semester, Number(midterm), Number(final), Number(bonus || 0)]);
  res.status(201).json(dbGet("SELECT * FROM grade_records WHERE id = ?", [id]));
});

router.put("/:id", (req, res) => {
  const { subject, semester, midterm, final, bonus } = req.body;
  const { id } = req.params;
  if (!dbGet("SELECT id FROM grade_records WHERE id = ?", [id])) return res.status(404).json({ error: "Không tìm thấy bản ghi điểm" });
  dbRun("UPDATE grade_records SET subject=?,semester=?,midterm=?,final=?,bonus=? WHERE id=?", [subject, semester, Number(midterm), Number(final), Number(bonus || 0), id]);
  res.json(dbGet("SELECT * FROM grade_records WHERE id = ?", [id]));
});

router.delete("/:id", (req, res) => {
  if (!dbGet("SELECT id FROM grade_records WHERE id = ?", [req.params.id])) return res.status(404).json({ error: "Không tìm thấy bản ghi điểm" });
  dbRun("DELETE FROM grade_records WHERE id = ?", [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
