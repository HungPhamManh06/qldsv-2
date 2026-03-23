import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  type Student,
  type GradeRecord,
  type AuthUser,
  type ForgotPasswordRequest,
  getStudents,
  createStudent,
  deleteStudent as apiDeleteStudent,
  getRecords,
  createRecord,
  deleteRecord as apiDeleteRecord,
  login as apiLogin,
  register as apiRegister,
  getForgotRequests,
  createForgotRequest,
  updateForgotStatus,
} from "./api";

// ─── Constants ──────────────────────────────────────────────
const SUBJECTS = ["Toan cao cap", "Lap trinh web", "Co so du lieu", "Mang may tinh", "Tri tue nhan tao"];
const SEMESTERS = ["HK1 2025-2026", "HK2 2025-2026", "HK1 2026-2027"];
const SESSION_KEY = "grade-manager-session";

// ─── Helpers ─────────────────────────────────────────────────
function scoreToRank(score: number) {
  if (score >= 8.5) return "Xuat sac";
  if (score >= 8) return "Gioi";
  if (score >= 6.5) return "Kha";
  if (score >= 5) return "Trung binh";
  return "Yeu";
}

function getTotalScore(record: GradeRecord) {
  const total = record.midterm * 0.4 + record.final * 0.6 + record.bonus;
  return Math.min(10, Number(total.toFixed(2)));
}

function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try { return JSON.parse(value) as T; } catch { return fallback; }
}

type Toast = { type: "success" | "error"; message: string };

// ─── App ─────────────────────────────────────────────────────
export default function App() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Dữ liệu từ server
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<GradeRecord[]>([]);
  const [forgotRequests, setForgotRequests] = useState<ForgotPasswordRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Session vẫn lưu localStorage (chỉ lưu thông tin đăng nhập, không phải dữ liệu)
  const [authUser, setAuthUser] = useState<AuthUser | null>(() =>
    safeJsonParse(localStorage.getItem(SESSION_KEY), null)
  );

  const [toast, setToast] = useState<Toast | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot">("login");
  const [authError, setAuthError] = useState("");
  const [apiError, setApiError] = useState("");

  const [loginForm, setLoginForm] = useState({ account: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    fullName: "", studentCode: "", className: "", password: "", confirmPassword: "",
  });
  const [forgotForm, setForgotForm] = useState({ account: "", fullName: "", studentCode: "" });
  const [studentForm, setStudentForm] = useState({ code: "", fullName: "", className: "" });
  const [recordForm, setRecordForm] = useState({
    studentId: "", subject: SUBJECTS[0], semester: SEMESTERS[0],
    midterm: "", final: "", bonus: "0",
  });
  const [filters, setFilters] = useState({ search: "", className: "all", semester: "all" });

  const canEdit = authUser?.role === "admin";

  // ── Lưu session vào localStorage khi thay đổi ─────────────
  useEffect(() => {
    if (authUser) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [authUser]);

  // ── Load dữ liệu từ server khi đăng nhập ─────────────────
  useEffect(() => {
    if (!authUser) { setLoading(false); return; }

    setLoading(true);
    setApiError("");

    Promise.all([
      getStudents(),
      getRecords(),
      authUser.role === "admin" ? getForgotRequests() : Promise.resolve([]),
    ])
      .then(([studentsData, recordsData, forgotData]) => {
        setStudents(studentsData);
        setRecords(recordsData);
        setForgotRequests(forgotData);
      })
      .catch((err: Error) => {
        setApiError("Khong the ket noi server: " + err.message);
      })
      .finally(() => setLoading(false));
  }, [authUser]);

  // ── Toast auto-dismiss ───────────────────────────────────
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  // ── Computed ─────────────────────────────────────────────
  const uniqueClasses = useMemo(() => [...new Set(students.map((s) => s.className))], [students]);

  const filteredRecords = useMemo(() => {
    let result = records;
    if (authUser?.role === "sinh_vien" && authUser.studentCode) {
      const student = students.find((s) => s.code === authUser.studentCode);
      if (student) result = result.filter((r) => r.studentId === student.id);
    }
    if (filters.search) {
      const lower = filters.search.toLowerCase();
      result = result.filter((r) => {
        const student = students.find((s) => s.id === r.studentId);
        if (!student) return false;
        return student.code.toLowerCase().includes(lower) || student.fullName.toLowerCase().includes(lower);
      });
    }
    if (filters.className !== "all") {
      result = result.filter((r) => {
        const student = students.find((s) => s.id === r.studentId);
        return student?.className === filters.className;
      });
    }
    if (filters.semester !== "all") result = result.filter((r) => r.semester === filters.semester);
    return result;
  }, [records, students, filters, authUser]);

  const studentSummaryRows = useMemo(() => {
    let filteredStudents = students;
    if (authUser?.role === "sinh_vien" && authUser.studentCode) {
      filteredStudents = students.filter((s) => s.code === authUser.studentCode);
    }
    if (filters.search) {
      const lower = filters.search.toLowerCase();
      filteredStudents = filteredStudents.filter(
        (s) => s.code.toLowerCase().includes(lower) || s.fullName.toLowerCase().includes(lower)
      );
    }
    if (filters.className !== "all") {
      filteredStudents = filteredStudents.filter((s) => s.className === filters.className);
    }
    return filteredStudents.map((student) => {
      let studentRecords = records.filter((r) => r.studentId === student.id);
      if (filters.semester !== "all") studentRecords = studentRecords.filter((r) => r.semester === filters.semester);
      const subjectsCount = studentRecords.length;
      const average = subjectsCount > 0
        ? Number((studentRecords.reduce((sum, r) => sum + getTotalScore(r), 0) / subjectsCount).toFixed(2))
        : 0;
      return { ...student, subjectsCount, average, rank: subjectsCount > 0 ? scoreToRank(average) : "-" };
    });
  }, [students, records, filters, authUser]);

  const stats = useMemo(() => {
    const totalStudents = students.length;
    const studentsWithScores = studentSummaryRows.filter((s) => s.subjectsCount > 0);
    const passCount = studentsWithScores.filter((s) => s.average >= 5).length;
    const passRate = studentsWithScores.length > 0 ? Math.round((passCount / studentsWithScores.length) * 100) : 0;
    const topStudent = [...studentsWithScores].sort((a, b) => b.average - a.average)[0] ?? null;
    return { totalStudents, passRate, topStudent };
  }, [students, studentSummaryRows]);

  // ── Handlers Auth ─────────────────────────────────────────
  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setAuthError("");
    try {
      const authData = await apiLogin(loginForm.account, loginForm.password);
      setAuthUser(authData);
      setLoginForm({ account: "", password: "" });
      setToast({ type: "success", message: `Xin chao, ${authData.fullName}!` });
    } catch (err) {
      setAuthError((err as Error).message);
    }
  };

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault();
    setAuthError("");
    if (!registerForm.fullName || !registerForm.studentCode || !registerForm.className || !registerForm.password) {
      setAuthError("Vui long dien day du thong tin!");
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      setAuthError("Mat khau xac nhan khong khop!");
      return;
    }
    try {
      await apiRegister({
        fullName: registerForm.fullName,
        studentCode: registerForm.studentCode,
        className: registerForm.className,
        password: registerForm.password,
      });
      setAuthMode("login");
      setRegisterForm({ fullName: "", studentCode: "", className: "", password: "", confirmPassword: "" });
      setToast({ type: "success", message: "Dang ky thanh cong! Hay dang nhap." });
    } catch (err) {
      setAuthError((err as Error).message);
    }
  };

  const handleForgot = async (event: FormEvent) => {
    event.preventDefault();
    setAuthError("");
    if (!forgotForm.account || !forgotForm.fullName || !forgotForm.studentCode) {
      setAuthError("Vui long dien day du thong tin!");
      return;
    }
    try {
      await createForgotRequest({
        account: forgotForm.account,
        fullName: forgotForm.fullName,
        studentCode: forgotForm.studentCode.toUpperCase(),
      });
      setAuthMode("login");
      setForgotForm({ account: "", fullName: "", studentCode: "" });
      setToast({ type: "success", message: "Yeu cau da duoc gui. Vui long cho admin xu ly." });
    } catch (err) {
      setAuthError((err as Error).message);
    }
  };

  // ── Handlers Students ─────────────────────────────────────
  const handleAddStudent = async (event: FormEvent) => {
    event.preventDefault();
    if (!studentForm.code || !studentForm.fullName || !studentForm.className) {
      setToast({ type: "error", message: "Vui long dien day du thong tin sinh vien!" });
      return;
    }
    try {
      const newStudent = await createStudent({
        code: studentForm.code.toUpperCase(),
        fullName: studentForm.fullName,
        className: studentForm.className.toUpperCase(),
      });
      setStudents((prev) => [...prev, newStudent]);
      setStudentForm({ code: "", fullName: "", className: "" });
      setToast({ type: "success", message: "Them sinh vien thanh cong!" });
    } catch (err) {
      setToast({ type: "error", message: (err as Error).message });
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm("Ban co chac muon xoa sinh vien nay?")) return;
    try {
      await apiDeleteStudent(studentId);
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
      setRecords((prev) => prev.filter((r) => r.studentId !== studentId));
      setToast({ type: "success", message: "Da xoa sinh vien!" });
    } catch (err) {
      setToast({ type: "error", message: (err as Error).message });
    }
  };

  // ── Handlers Records ──────────────────────────────────────
  const handleAddRecord = async (event: FormEvent) => {
    event.preventDefault();
    if (!recordForm.studentId) {
      setToast({ type: "error", message: "Vui long chon sinh vien!" });
      return;
    }
    const midterm = parseFloat(recordForm.midterm);
    const final_ = parseFloat(recordForm.final);
    const bonus = parseFloat(recordForm.bonus) || 0;
    if (isNaN(midterm) || isNaN(final_) || midterm < 0 || midterm > 10 || final_ < 0 || final_ > 10) {
      setToast({ type: "error", message: "Diem khong hop le (0-10)!" });
      return;
    }
    try {
      const newRecord = await createRecord({
        studentId: recordForm.studentId,
        subject: recordForm.subject,
        semester: recordForm.semester,
        midterm,
        final: final_,
        bonus,
      });
      setRecords((prev) => [...prev, newRecord]);
      setRecordForm((prev) => ({ ...prev, midterm: "", final: "", bonus: "0" }));
      setToast({ type: "success", message: "Nhap diem thanh cong!" });
    } catch (err) {
      setToast({ type: "error", message: (err as Error).message });
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm("Ban co chac muon xoa ban ghi diem nay?")) return;
    try {
      await apiDeleteRecord(recordId);
      setRecords((prev) => prev.filter((r) => r.id !== recordId));
      setToast({ type: "success", message: "Da xoa ban ghi diem!" });
    } catch (err) {
      setToast({ type: "error", message: (err as Error).message });
    }
  };

  // ── Handlers Forgot ───────────────────────────────────────
  const handleProcessForgot = async (requestId: string) => {
    try {
      const updated = await updateForgotStatus(requestId, "sent");
      setForgotRequests((prev) => prev.map((r) => (r.id === requestId ? updated : r)));
      setToast({ type: "success", message: "Da danh dau gui server!" });
    } catch (err) {
      setToast({ type: "error", message: (err as Error).message });
    }
  };

  // ── Handlers Backup/Restore ───────────────────────────────
  const handleBackupDownload = () => {
    const snapshot = { version: 1, timestamp: new Date().toISOString(), students, records };
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qldsv-backup-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setToast({ type: "success", message: "Da tai file sao luu" });
  };

  const handleRestoreFromFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result ?? "{}"));
        if (!Array.isArray(data.students) || !Array.isArray(data.records)) throw new Error("File khong dung dinh dang");
        setStudents(data.students as Student[]);
        setRecords(data.records as GradeRecord[]);
        setToast({ type: "success", message: "Khoi phuc du lieu thanh cong" });
      } catch (err) {
        setToast({ type: "error", message: "Khoi phuc that bai: " + (err as Error).message });
      } finally { e.target.value = ""; }
    };
    reader.onerror = () => { setToast({ type: "error", message: "Khong the doc file" }); e.target.value = ""; };
    reader.readAsText(file);
  };

  const handleLogout = () => {
    setAuthUser(null);
    setStudents([]);
    setRecords([]);
    setForgotRequests([]);
    setToast({ type: "success", message: "Dang xuat thanh cong!" });
  };

  // ─────────────────────────────────────────────────────────
  // Màn hình đăng nhập
  // ─────────────────────────────────────────────────────────
if (!authUser) {
    return (
      <div
        className="relative flex min-h-screen items-center justify-center p-4"
        style={{
          backgroundImage: "url('/pc.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md rounded-2xl bg-slate-800/80 p-8 shadow-2xl backdrop-blur-sm"
        >
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-white">📚 QLDSV</h1>
            <p className="text-slate-400">He thong Quan ly Diem Sinh Vien</p>
          </div>

          <div className="mb-6 flex rounded-lg bg-slate-700/50 p-1">
            {(["login", "register", "forgot"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => { setAuthMode(mode); setAuthError(""); }}
                className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
                  authMode === mode ? "bg-sky-500 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                {mode === "login" ? "Dang nhap" : mode === "register" ? "Dang ky" : "Quen MK"}
              </button>
            ))}
          </div>

          {authError && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mb-4 rounded-lg bg-red-500/20 p-3 text-center text-red-400">
              {authError}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {authMode === "login" && (
              <motion.form key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }} onSubmit={handleLogin} className="space-y-4">
                <input type="text" value={loginForm.account}
                  onChange={(e) => setLoginForm((p) => ({ ...p, account: e.target.value }))}
                  placeholder="Tai khoan (VD: admin, sv001)"
                  className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-sky-400" />
                <input type="password" value={loginForm.password}
                  onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="Mat khau"
                  className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-sky-400" />
                <button type="submit"
                  className="w-full rounded-lg bg-sky-500 py-3 font-semibold text-white transition hover:bg-sky-600">
                  Dang nhap
                </button>
                <p className="text-center text-sm text-slate-400">
                  Tai khoan demo: admin / admin123 hoac sv001 / sv123
                </p>
              </motion.form>
            )}

            {authMode === "register" && (
              <motion.form key="register" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }} onSubmit={handleRegister} className="space-y-4">
                {[
                  { field: "fullName", placeholder: "Ho va ten", type: "text" },
                  { field: "studentCode", placeholder: "Ma sinh vien (VD: SV010)", type: "text" },
                  { field: "className", placeholder: "Lop (VD: CNTT-K16A)", type: "text" },
                  { field: "password", placeholder: "Mat khau", type: "password" },
                  { field: "confirmPassword", placeholder: "Xac nhan mat khau", type: "password" },
                ].map(({ field, placeholder, type }) => (
                  <input key={field} type={type}
                    value={registerForm[field as keyof typeof registerForm]}
                    onChange={(e) => setRegisterForm((p) => ({ ...p, [field]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-sky-400" />
                ))}
                <button type="submit"
                  className="w-full rounded-lg bg-emerald-500 py-3 font-semibold text-white transition hover:bg-emerald-600">
                  Dang ky
                </button>
              </motion.form>
            )}

            {authMode === "forgot" && (
              <motion.form key="forgot" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }} onSubmit={handleForgot} className="space-y-4">
                {[
                  { field: "account", placeholder: "Tai khoan" },
                  { field: "fullName", placeholder: "Ho va ten" },
                  { field: "studentCode", placeholder: "Ma sinh vien" },
                ].map(({ field, placeholder }) => (
                  <input key={field} type="text"
                    value={forgotForm[field as keyof typeof forgotForm]}
                    onChange={(e) => setForgotForm((p) => ({ ...p, [field]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-sky-400" />
                ))}
                <button type="submit"
                  className="w-full rounded-lg bg-amber-500 py-3 font-semibold text-white transition hover:bg-amber-600">
                  Gui yeu cau
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {toast && (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
              className={`fixed bottom-6 right-6 rounded-lg px-6 py-3 font-medium text-white shadow-lg ${
                toast.type === "success" ? "bg-emerald-500" : "bg-red-500"
              }`}>
              {toast.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────
  // Loading & Error
  // ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-sky-400 border-t-transparent" />
          <p className="text-slate-400">Dang tai du lieu...</p>
        </div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="rounded-xl bg-red-500/10 p-8 text-center">
          <p className="mb-2 text-2xl">⚠️</p>
          <p className="mb-4 text-red-400">{apiError}</p>
          <p className="mb-4 text-sm text-slate-400">
            Kiem tra backend co dang chay khong:<br />
            <code className="text-sky-400">{import.meta.env.VITE_API_URL ?? "http://localhost:3001"}/api/health</code>
          </p>
          <div className="flex justify-center gap-3">
            <button onClick={() => window.location.reload()}
              className="rounded-lg bg-sky-500 px-6 py-2 text-white transition hover:bg-sky-600">
              Thu lai
            </button>
            <button onClick={handleLogout}
              className="rounded-lg bg-slate-700 px-6 py-2 text-white transition hover:bg-slate-600">
              Dang xuat
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────
  // Main Dashboard
  // ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-700 bg-slate-900/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📚</span>
            <h1 className="text-xl font-bold">QLDSV</h1>
          </div>
          <div className="flex items-center gap-4">
            {canEdit && (
              <div className="flex items-center gap-2">
                <button onClick={handleBackupDownload}
                  className="rounded-lg bg-slate-700/50 px-3 py-2 text-slate-200 transition hover:bg-slate-700">
                  Sao luu
                </button>
                <button onClick={() => fileInputRef.current?.click()}
                  className="rounded-lg bg-slate-700/50 px-3 py-2 text-slate-200 transition hover:bg-slate-700">
                  Khoi phuc
                </button>
                <input ref={fileInputRef} type="file" accept="application/json"
                  onChange={handleRestoreFromFile} className="hidden" />
              </div>
            )}
            <div className="text-right">
              <p className="font-medium">{authUser.fullName}</p>
              <p className="text-sm text-slate-400">
                {authUser.role === "admin" ? "Quan tri vien" : `SV: ${authUser.studentCode}`}
              </p>
            </div>
            <button onClick={handleLogout}
              className="rounded-lg bg-red-500/20 px-4 py-2 text-red-400 transition hover:bg-red-500/30">
              Dang xuat
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Tong sinh vien", value: stats.totalStudents, color: "text-sky-400" },
            { label: "Ty le dat", value: `${stats.passRate}%`, color: "text-emerald-400" },
            {
              label: "Sinh vien dan dau",
              value: stats.topStudent ? `${stats.topStudent.fullName} (${stats.topStudent.average})` : "Chua co du lieu",
              color: "text-amber-400",
              small: true,
            },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }} className="rounded-xl bg-slate-800/50 p-6">
              <p className="text-sm text-slate-400">{stat.label}</p>
              <p className={`font-bold ${stat.color} ${stat.small ? "text-lg" : "text-3xl"}`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Admin Forms */}
        {canEdit && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Add Student */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="rounded-xl bg-slate-800/50 p-6">
              <h2 className="mb-4 text-lg font-semibold">Them Sinh Vien</h2>
              <form onSubmit={handleAddStudent} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { field: "code", placeholder: "Ma sinh vien" },
                    { field: "fullName", placeholder: "Ho va ten" },
                    { field: "className", placeholder: "Lop" },
                  ].map(({ field, placeholder }) => (
                    <input key={field} type="text"
                      value={studentForm[field as keyof typeof studentForm]}
                      onChange={(e) => setStudentForm((p) => ({ ...p, [field]: e.target.value }))}
                      placeholder={placeholder}
                      className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none transition focus:border-sky-400" />
                  ))}
                </div>
                <button type="submit"
                  className="rounded-lg bg-emerald-500 px-6 py-2 font-medium transition hover:bg-emerald-600">
                  Them
                </button>
              </form>
            </motion.div>

            {/* Add Grade */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="rounded-xl bg-slate-800/50 p-6">
              <h2 className="mb-4 text-lg font-semibold">Nhap Diem Mon Hoc</h2>
              <form onSubmit={handleAddRecord} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  <select value={recordForm.studentId}
                    onChange={(e) => setRecordForm((p) => ({ ...p, studentId: e.target.value }))}
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none transition focus:border-sky-400">
                    <option value="">-- Chon sinh vien --</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>{s.code} - {s.fullName}</option>
                    ))}
                  </select>
                  <select value={recordForm.subject}
                    onChange={(e) => setRecordForm((p) => ({ ...p, subject: e.target.value }))}
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none transition focus:border-sky-400">
                    {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select value={recordForm.semester}
                    onChange={(e) => setRecordForm((p) => ({ ...p, semester: e.target.value }))}
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none transition focus:border-sky-400">
                    {SEMESTERS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { field: "midterm", placeholder: "Giua ky" },
                    { field: "final", placeholder: "Cuoi ky" },
                    { field: "bonus", placeholder: "Diem cong" },
                  ].map(({ field, placeholder }) => (
                    <input key={field} type="number" step="0.1" min="0" max="10"
                      value={recordForm[field as keyof typeof recordForm]}
                      onChange={(e) => setRecordForm((p) => ({ ...p, [field]: e.target.value }))}
                      placeholder={placeholder}
                      className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none transition focus:border-sky-400" />
                  ))}
                </div>
                <button type="submit"
                  className="rounded-lg bg-sky-500 px-6 py-2 font-medium transition hover:bg-sky-600">
                  Luu diem
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Forgot Requests (Admin) */}
        {canEdit && forgotRequests.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-slate-800/50 p-6">
            <h2 className="mb-4 text-lg font-semibold">Yeu Cau Quen Mat Khau</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-700 text-slate-400">
                  <tr>
                    {["Tai khoan", "Ho ten", "Ma SV", "Trang thai", "Thoi gian", "Tac vu"].map((h) => (
                      <th key={h} className="pb-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {forgotRequests.map((req) => (
                    <tr key={req.id}>
                      <td className="py-3">{req.account}</td>
                      <td className="py-3">{req.fullName}</td>
                      <td className="py-3">{req.studentCode}</td>
                      <td className="py-3">
                        <span className={`rounded-full px-2 py-1 text-xs ${
                          req.status === "sent" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                        }`}>
                          {req.status === "sent" ? "Da gui server" : "Cho gui server"}
                        </span>
                      </td>
                      <td className="py-3">{new Date(req.createdAt).toLocaleString("vi-VN")}</td>
                      <td className="py-3">
                        <button onClick={() => handleProcessForgot(req.id)} disabled={req.status === "sent"}
                          className="rounded bg-sky-500/20 px-3 py-1 text-sky-400 transition hover:bg-sky-500/30 disabled:opacity-50">
                          Xu ly
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <input type="text" value={filters.search}
            onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
            placeholder="Tim theo ma SV / ten"
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 outline-none transition focus:border-sky-400" />
          <select value={filters.className}
            onChange={(e) => setFilters((p) => ({ ...p, className: e.target.value }))}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 outline-none transition focus:border-sky-400">
            <option value="all">Tat ca lop</option>
            {uniqueClasses.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filters.semester}
            onChange={(e) => setFilters((p) => ({ ...p, semester: e.target.value }))}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 outline-none transition focus:border-sky-400">
            <option value="all">Tat ca hoc ky</option>
            {SEMESTERS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Student Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-slate-800/50 p-6">
          <h2 className="mb-4 text-lg font-semibold">Danh Sach Sinh Vien</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-700 text-slate-400">
                <tr>
                  {["Ma SV", "Ho ten", "Lop", "So mon", "Diem TB", "Xep loai", "Tac vu"].map((h) => (
                    <th key={h} className="pb-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {studentSummaryRows.length === 0 && (
                  <tr><td colSpan={7} className="py-8 text-center text-slate-400">Khong co sinh vien.</td></tr>
                )}
                {studentSummaryRows.map((row) => (
                  <tr key={row.id}>
                    <td className="py-3 font-mono">{row.code}</td>
                    <td className="py-3">{row.fullName}</td>
                    <td className="py-3">{row.className}</td>
                    <td className="py-3">{row.subjectsCount}</td>
                    <td className="py-3 font-semibold text-sky-400">{row.average}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-2 py-1 text-xs ${
                        row.rank === "Xuat sac" ? "bg-emerald-500/20 text-emerald-400"
                          : row.rank === "Gioi" ? "bg-sky-500/20 text-sky-400"
                          : row.rank === "Kha" ? "bg-amber-500/20 text-amber-400"
                          : row.rank === "Trung binh" ? "bg-slate-500/20 text-slate-400"
                          : row.rank === "Yeu" ? "bg-red-500/20 text-red-400"
                          : "bg-slate-500/20 text-slate-500"
                      }`}>
                        {row.rank}
                      </span>
                    </td>
                    <td className="py-3">
                      {canEdit ? (
                        <button onClick={() => handleDeleteStudent(row.id)}
                          className="rounded bg-red-500/20 px-3 py-1 text-red-400 transition hover:bg-red-500/30">
                          Xoa
                        </button>
                      ) : <span className="text-slate-500">Chi xem</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Grade Records Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-slate-800/50 p-6">
          <h2 className="mb-4 text-lg font-semibold">Danh Sach Diem Da Nhap</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-700 text-slate-400">
                <tr>
                  {["Sinh vien", "Mon hoc", "Hoc ky", "Giua ky", "Cuoi ky", "Tong ket", "Tac vu"].map((h) => (
                    <th key={h} className="pb-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredRecords.length === 0 && (
                  <tr><td colSpan={7} className="py-8 text-center text-slate-400">Chua co ban ghi diem.</td></tr>
                )}
                {filteredRecords.map((record) => {
                  const student = students.find((s) => s.id === record.studentId);
                  return (
                    <tr key={record.id}>
                      <td className="py-3">{student ? `${student.code} - ${student.fullName}` : "Khong xac dinh"}</td>
                      <td className="py-3">{record.subject}</td>
                      <td className="py-3">{record.semester}</td>
                      <td className="py-3">{record.midterm}</td>
                      <td className="py-3">{record.final}</td>
                      <td className="py-3 font-semibold text-emerald-400">{getTotalScore(record)}</td>
                      <td className="py-3">
                        {canEdit ? (
                          <button onClick={() => handleDeleteRecord(record.id)}
                            className="rounded bg-red-500/20 px-3 py-1 text-red-400 transition hover:bg-red-500/30">
                            Xoa
                          </button>
                        ) : <span className="text-slate-500">Chi xem</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-6 right-6 rounded-lg px-6 py-3 font-medium text-white shadow-lg ${
              toast.type === "success" ? "bg-emerald-500" : "bg-red-500"
            }`}>
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
