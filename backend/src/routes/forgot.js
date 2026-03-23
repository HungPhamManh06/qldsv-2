const express = require("express");
const router = express.Router();
const { dbGet, dbAll, dbRun } = require("../db");
const { v4: uuidv4 } = require("uuid");

router.get("/", (req, res) => {
  res.json(dbAll("SELECT * FROM forgot_requests ORDER BY createdAt DESC"));
});

router.post("/", (req, res) => {
  const { account, fullName, studentCode } = req.body;
  if (!account || !fullName || !studentCode) return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
  const id = "frq-" + uuidv4();
  dbRun("INSERT INTO forgot_requests (id,account,fullName,studentCode,createdAt,status) VALUES (?,?,?,?,?,?)", [id, account, fullName, studentCode, new Date().toISOString(), "queued"]);
  res.status(201).json(dbGet("SELECT * FROM forgot_requests WHERE id = ?", [id]));
});

router.patch("/:id/status", (req, res) => {
  const { status } = req.body;
  if (!["queued","sent"].includes(status)) return res.status(400).json({ error: "Trạng thái không hợp lệ" });
  if (!dbGet("SELECT id FROM forgot_requests WHERE id = ?", [req.params.id])) return res.status(404).json({ error: "Không tìm thấy yêu cầu" });
  dbRun("UPDATE forgot_requests SET status=? WHERE id=?", [status, req.params.id]);
  res.json(dbGet("SELECT * FROM forgot_requests WHERE id = ?", [req.params.id]));
});

router.delete("/:id", (req, res) => {
  if (!dbGet("SELECT id FROM forgot_requests WHERE id = ?", [req.params.id])) return res.status(404).json({ error: "Không tìm thấy yêu cầu" });
  dbRun("DELETE FROM forgot_requests WHERE id=?", [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
