const express = require("express");
const cors = require("cors");
const { initDb } = require("./db");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: "*", methods: ["GET","POST","PUT","PATCH","DELETE"], allowedHeaders: ["Content-Type"] }));
app.use(express.json());

// Khởi động server sau khi DB sẵn sàng
initDb().then(() => {
  app.use("/api/students", require("./routes/students"));
  app.use("/api/records", require("./routes/records"));
  app.use("/api/auth", require("./routes/auth"));
  app.use("/api/forgot", require("./routes/forgot"));

  app.get("/api/health", (req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

  app.use((req, res) => res.status(404).json({ error: "Route không tồn tại" }));

  app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
    console.log(`📡 Kiểm tra: http://localhost:${PORT}/api/health`);
  });
}).catch(err => {
  console.error("❌ Lỗi khởi động DB:", err);
  process.exit(1);
});
