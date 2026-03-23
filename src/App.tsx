import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";

type Student = {
  id: string;
  code: string;
  fullName: string;
  className: string;
};

type GradeRecord = {
  id: string;
  studentId: string;
  subject: string;
  semester: string;
  midterm: number;
  final: number;
  bonus: number;
};

type UserRole = "admin" | "sinh_vien";

type UserAccount = {
  id: string;
  username: string;
  password: string;
  fullName: string;
  role: UserRole;
  studentCode?: string;
};

type AuthUser = Omit<UserAccount, "password">;

type ForgotPasswordRequest = {
  id: string;
  account: string;
  fullName: string;
  studentCode: string;
  createdAt: string;
  status: "queued" | "sent";
};

type Toast = {
  type: "success" | "error";
  message: string;
};

const SUBJECTS = ["Toan cao cap", "Lap trinh web", "Co so du lieu", "Mang may tinh", "Tri tue nhan tao"];
const SEMESTERS = ["HK1 2025-2026", "HK2 2025-2026", "HK1 2026-2027"];

const STORAGE_KEYS = {
  students: "grade-manager-students",
  records: "grade-manager-records",
  users: "grade-manager-users",
  forgotRequests: "grade-manager-forgot-requests",
  session: "grade-manager-session",
};

const seedStudents: Student[] = [
  { id: "st-1", code: "SV001", fullName: "Nguyen Minh Quan", className: "CNTT-K16A" },
  { id: "st-2", code: "SV002", fullName: "Tran Thu Ha", className: "CNTT-K16A" },
  { id: "st-3", code: "SV003", fullName: "Le Hoang Nam", className: "KTPM-K16B" },
];

const seedRecords: GradeRecord[] = [
  {
    id: "gr-1",
    studentId: "st-1",
    subject: "Lap trinh web",
    semester: "HK1 2025-2026",
    midterm: 8,
    final: 8.5,
    bonus: 0.3,
  },
  {
    id: "gr-2",
    studentId: "st-2",
    subject: "Co so du lieu",
    semester: "HK1 2025-2026",
    midterm: 7,
    final: 8,
    bonus: 0.2,
  },
  {
    id: "gr-3",
    studentId: "st-3",
    subject: "Toan cao cap",
    semester: "HK1 2025-2026",
    midterm: 6.5,
    final: 7.2,
    bonus: 0,
  },
];

const seedUsers: UserAccount[] = [
  { id: "usr-admin", username: "admin", password: "admin123", fullName: "Quan tri vien", role: "admin" },
  {
    id: "usr-sv-1",
    username: "sv001",
    password: "sv123",
    fullName: "Nguyen Minh Quan",
    role: "sinh_vien",
    studentCode: "SV001",
  },
];

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

function uid(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [students, setStudents] = useState<Student[]>(() =>
    safeJsonParse(localStorage.getItem(STORAGE_KEYS.students), seedStudents),
  );
  const [records, setRecords] = useState<GradeRecord[]>(() =>
    safeJsonParse(localStorage.getItem(STORAGE_KEYS.records), seedRecords),
  );
  const [users, setUsers] = useState<UserAccount[]>(() => safeJsonParse(localStorage.getItem(STORAGE_KEYS.users), seedUsers));
  const [forgotRequests, setForgotRequests] = useState<ForgotPasswordRequest[]>(() =>
    safeJsonParse(localStorage.getItem(STORAGE_KEYS.forgotRequests), []),
  );
  const [authUser, setAuthUser] = useState<AuthUser | null>(() =>
    safeJsonParse(localStorage.getItem(STORAGE_KEYS.session), null),
  );
  const [toast, setToast] = useState<Toast | null>(null);

  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot">("login");
  const [authError, setAuthError] = useState("");

  const [loginForm, setLoginForm] = useState({
    account: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    studentCode: "",
    className: "",
    password: "",
    confirmPassword: "",
  });

  const [forgotForm, setForgotForm] = useState({
    account: "",
    fullName: "",
    studentCode: "",
  });

  const [studentForm, setStudentForm] = useState({
    code: "",
    fullName: "",
    className: "",
  });

  const [recordForm, setRecordForm] = useState({
    studentId: "",
    subject: SUBJECTS[0],
    semester: SEMESTERS[0],
    midterm: "",
    final: "",
    bonus: "0",
  });

  const [filters, setFilters] = useState({
    search: "",
    className: "all",
    semester: "all",
  });

  const canEdit = authUser?.role === "admin";

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.students, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.records, JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.forgotRequests, JSON.stringify(forgotRequests));
  }, [forgotRequests]);

  useEffect(() => {
    if (!authUser) {
      localStorage.removeItem(STORAGE_KEYS.session);
      return;
    }
    localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(authUser));
  }, [authUser]);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      switch (e.key) {
        case STORAGE_KEYS.students:
          setStudents(safeJsonParse(localStorage.getItem(STORAGE_KEYS.students), []));
          break;
        case STORAGE_KEYS.records:
          setRecords(safeJsonParse(localStorage.getItem(STORAGE_KEYS.records), []));
          break;
        case STORAGE_KEYS.users:
          setUsers(safeJsonParse(localStorage.getItem(STORAGE_KEYS.users), []));
          break;
        case STORAGE_KEYS.forgotRequests:
          setForgotRequests(safeJsonParse(localStorage.getItem(STORAGE_KEYS.forgotRequests), []));
          break;
        case STORAGE_KEYS.session:
          setAuthUser(safeJsonParse(localStorage.getItem(STORAGE_KEYS.session), null));
          break;
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const uniqueClasses = useMemo(() => [...new Set(students.map((s) => s.className))], [students]);

  const filteredRecords = useMemo(() => {
    let result = records;

    if (authUser?.role === "sinh_vien" && authUser.studentCode) {
      const student = students.find((s) => s.code === authUser.studentCode);
      if (student) {
        result = result.filter((r) => r.studentId === student.id);
      }
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

    if (filters.semester !== "all") {
      result = result.filter((r) => r.semester === filters.semester);
    }

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
        (s) => s.code.toLowerCase().includes(lower) || s.fullName.toLowerCase().includes(lower),
      );
    }

    if (filters.className !== "all") {
      filteredStudents = filteredStudents.filter((s) => s.className === filters.className);
    }

    return filteredStudents.map((student) => {
      let studentRecords = records.filter((r) => r.studentId === student.id);

      if (filters.semester !== "all") {
        studentRecords = studentRecords.filter((r) => r.semester === filters.semester);
      }

      const subjectsCount = studentRecords.length;
      const average = subjectsCount > 0
        ? Number((studentRecords.reduce((sum, r) => sum + getTotalScore(r), 0) / subjectsCount).toFixed(2))
        : 0;

      return {
        ...student,
        subjectsCount,
        average,
        rank: subjectsCount > 0 ? scoreToRank(average) : "-",
      };
    });
  }, [students, records, filters, authUser]);

  const stats = useMemo(() => {
    const totalStudents = students.length;
    const studentsWithScores = studentSummaryRows.filter((s) => s.subjectsCount > 0);
    const passCount = studentsWithScores.filter((s) => s.average >= 5).length;
    const passRate = studentsWithScores.length > 0 ? Math.round((passCount / studentsWithScores.length) * 100) : 0;
    const topStudent = studentsWithScores.sort((a, b) => b.average - a.average)[0] || null;

    return { totalStudents, passRate, topStudent };
  }, [students, studentSummaryRows]);

  const handleLogin = (event: FormEvent) => {
    event.preventDefault();
    setAuthError("");

    const user = users.find(
      (u) => u.username.toLowerCase() === loginForm.account.toLowerCase() && u.password === loginForm.password,
    );

    if (!user) {
      setAuthError("Sai tai khoan hoac mat khau!");
      return;
    }

    const { password: _, ...authData } = user;
    setAuthUser(authData);
    setLoginForm({ account: "", password: "" });
    setToast({ type: "success", message: `Xin chao, ${user.fullName}!` });
  };

  const handleRegister = (event: FormEvent) => {
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

    if (users.some((u) => u.username.toLowerCase() === registerForm.studentCode.toLowerCase())) {
      setAuthError("Ma sinh vien da duoc dang ky!");
      return;
    }

    const newUser: UserAccount = {
      id: uid("usr"),
      username: registerForm.studentCode.toLowerCase(),
      password: registerForm.password,
      fullName: registerForm.fullName,
      role: "sinh_vien",
      studentCode: registerForm.studentCode.toUpperCase(),
    };

    const existingStudent = students.find(
      (s) => s.code.toLowerCase() === registerForm.studentCode.toLowerCase(),
    );

    if (!existingStudent) {
      const newStudent: Student = {
        id: uid("st"),
        code: registerForm.studentCode.toUpperCase(),
        fullName: registerForm.fullName,
        className: registerForm.className.toUpperCase(),
      };
      setStudents((prev) => [...prev, newStudent]);
    }

    setUsers((prev) => [...prev, newUser]);
    setAuthMode("login");
    setRegisterForm({ fullName: "", studentCode: "", className: "", password: "", confirmPassword: "" });
    setToast({ type: "success", message: "Dang ky thanh cong! Hay dang nhap." });
  };

  const handleForgot = (event: FormEvent) => {
    event.preventDefault();
    setAuthError("");

    if (!forgotForm.account || !forgotForm.fullName || !forgotForm.studentCode) {
      setAuthError("Vui long dien day du thong tin!");
      return;
    }

    const newRequest: ForgotPasswordRequest = {
      id: uid("forgot"),
      account: forgotForm.account,
      fullName: forgotForm.fullName,
      studentCode: forgotForm.studentCode.toUpperCase(),
      createdAt: new Date().toISOString(),
      status: "queued",
    };

    setForgotRequests((prev) => [...prev, newRequest]);
    setAuthMode("login");
    setForgotForm({ account: "", fullName: "", studentCode: "" });
    setToast({ type: "success", message: "Yeu cau da duoc gui. Vui long cho admin xu ly." });
  };

  const handleAddStudent = (event: FormEvent) => {
    event.preventDefault();

    if (!studentForm.code || !studentForm.fullName || !studentForm.className) {
      setToast({ type: "error", message: "Vui long dien day du thong tin sinh vien!" });
      return;
    }

    if (students.some((s) => s.code.toLowerCase() === studentForm.code.toLowerCase())) {
      setToast({ type: "error", message: "Ma sinh vien da ton tai!" });
      return;
    }

    const newStudent: Student = {
      id: uid("st"),
      code: studentForm.code.toUpperCase(),
      fullName: studentForm.fullName,
      className: studentForm.className.toUpperCase(),
    };

    setStudents((prev) => [...prev, newStudent]);
    setStudentForm({ code: "", fullName: "", className: "" });
    setToast({ type: "success", message: "Them sinh vien thanh cong!" });
  };

  const handleAddRecord = (event: FormEvent) => {
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

    const duplicate = records.find(
      (r) =>
        r.studentId === recordForm.studentId &&
        r.subject === recordForm.subject &&
        r.semester === recordForm.semester,
    );

    if (duplicate) {
      setToast({ type: "error", message: "Sinh vien da co diem mon nay trong hoc ky nay!" });
      return;
    }

    const newRecord: GradeRecord = {
      id: uid("gr"),
      studentId: recordForm.studentId,
      subject: recordForm.subject,
      semester: recordForm.semester,
      midterm,
      final: final_,
      bonus,
    };

    setRecords((prev) => [...prev, newRecord]);
    setRecordForm((prev) => ({ ...prev, midterm: "", final: "", bonus: "0" }));
    setToast({ type: "success", message: "Nhap diem thanh cong!" });
  };

  const handleDeleteStudent = (studentId: string) => {
    if (!confirm("Ban co chac muon xoa sinh vien nay?")) return;

    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    setRecords((prev) => prev.filter((r) => r.studentId !== studentId));
    setToast({ type: "success", message: "Da xoa sinh vien!" });
  };

  const handleDeleteRecord = (recordId: string) => {
    if (!confirm("Ban co chac muon xoa ban ghi diem nay?")) return;

    setRecords((prev) => prev.filter((r) => r.id !== recordId));
    setToast({ type: "success", message: "Da xoa ban ghi diem!" });
  };

  const handleProcessForgot = (requestId: string) => {
    setForgotRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: "sent" } : r)),
    );
    setToast({ type: "success", message: "Da danh dau gui server!" });
  };

  const handleLogout = () => {
    setAuthUser(null);
    setToast({ type: "success", message: "Dang xuat thanh cong!" });
  };

  const makeSnapshot = () => ({
    version: 1,
    timestamp: new Date().toISOString(),
    students,
    records,
    users,
    forgotRequests,
    session: authUser,
  });

  const handleBackupDownload = () => {
    const snapshot = makeSnapshot();
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

  const handleChooseBackupFile = () => {
    fileInputRef.current?.click();
  };

  const handleRestoreFromFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result || "{}"));
        if (!data || typeof data !== "object") throw new Error("Invalid JSON");
        if (!Array.isArray(data.students) || !Array.isArray(data.records) || !Array.isArray(data.users)) {
          throw new Error("File khong dung dinh dang");
        }
        setStudents(data.students);
        setRecords(data.records);
        setUsers(data.users);
        setForgotRequests(Array.isArray(data.forgotRequests) ? data.forgotRequests : []);
        setAuthUser(data.session ?? null);
        setToast({ type: "success", message: "Khoi phuc du lieu thanh cong" });
      } catch (err) {
        console.error(err);
        setToast({ type: "error", message: "Khoi phuc that bai" });
      } finally {
        e.target.value = "";
      }
    };
    reader.onerror = () => {
      setToast({ type: "error", message: "Khong the doc file" });
      e.target.value = "";
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    if (!confirm("Ban co chac muon xoa toan bo du lieu?")) return;
    localStorage.removeItem(STORAGE_KEYS.students);
    localStorage.removeItem(STORAGE_KEYS.records);
    localStorage.removeItem(STORAGE_KEYS.users);
    localStorage.removeItem(STORAGE_KEYS.forgotRequests);
    localStorage.removeItem(STORAGE_KEYS.session);
    setStudents(seedStudents);
    setRecords(seedRecords);
    setUsers(seedUsers);
    setForgotRequests([]);
    setAuthUser(null);
    setToast({ type: "success", message: "Da xoa tat ca du lieu" });
  };

  if (!authUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-2xl bg-slate-800/80 p-8 shadow-2xl backdrop-blur-sm"
        >
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-white">📚 QLDSV</h1>
            <p className="text-slate-400">He thong Quan ly Diem Sinh Vien</p>
          </div>

          <div className="mb-6 flex rounded-lg bg-slate-700/50 p-1">
            <button
              onClick={() => setAuthMode("login")}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
                authMode === "login" ? "bg-sky-500 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Dang nhap
            </button>
            <button
              onClick={() => setAuthMode("register")}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
                authMode === "register" ? "bg-sky-500 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Dang ky
            </button>
            <button
              onClick={() => setAuthMode("forgot")}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
                authMode === "forgot" ? "bg-sky-500 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Quen MK
            </button>
          </div>

          {authError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 rounded-lg bg-red-500/20 p-3 text-center text-red-400"
            >
              {authError}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {authMode === "login" && (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                <input
                  type="text"
                  value={loginForm.account}
                  onChange={(e) => setLoginForm((prev) => ({ ...prev, account: e.target.value }))}
                  placeholder="Tai khoan (VD: admin, sv001)"
                  className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                />
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Mat khau"
                  className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                />
                <button
                  type="submit"
                  className="w-full rounded-lg bg-sky-500 py-3 font-semibold text-white transition hover:bg-sky-600"
                >
                  Dang nhap
                </button>
                <p className="text-center text-sm text-slate-400">
                  Tai khoan demo: admin / admin123 hoac sv001 / sv123
                </p>
              </motion.form>
            )}

            {authMode === "register" && (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleRegister}
                className="space-y-4"
              >
                <input
                  type="text"
                  value={registerForm.fullName}
                  onChange={(e) => setRegisterForm((prev) => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Ho va ten"
                  className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                />
                <input
                  type="text"
                  value={registerForm.studentCode}
                  onChange={(e) => setRegisterForm((prev) => ({ ...prev, studentCode: e.target.value }))}
                  placeholder="Ma sinh vien (VD: SV010)"
                  className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                />
                <input
                  type="text"
                  value={registerForm.className}
                  onChange={(e) => setRegisterForm((prev) => ({ ...prev, className: e.target.value }))}
                  placeholder="Lop (VD: CNTT-K16A)"
                  className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                />
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Mat khau"
                  className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                />
                <input
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Xac nhan mat khau"
                  className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                />
                <button
                  type="submit"
                  className="w-full rounded-lg bg-emerald-500 py-3 font-semibold text-white transition hover:bg-emerald-600"
                >
                  Dang ky
                </button>
              </motion.form>
            )}

            {authMode === "forgot" && (
              <motion.form
                key="forgot"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleForgot}
                className="space-y-4"
              >
                <input
                  type="text"
                  value={forgotForm.account}
                  onChange={(e) => setForgotForm((prev) => ({ ...prev, account: e.target.value }))}
                  placeholder="Tai khoan"
                  className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                />
                <input
                  type="text"
                  value={forgotForm.fullName}
                  onChange={(e) => setForgotForm((prev) => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Ho va ten"
                  className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                />
                <input
                  type="text"
                  value={forgotForm.studentCode}
                  onChange={(e) => setForgotForm((prev) => ({ ...prev, studentCode: e.target.value }))}
                  placeholder="Ma sinh vien"
                  className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                />
                <button
                  type="submit"
                  className="w-full rounded-lg bg-amber-500 py-3 font-semibold text-white transition hover:bg-amber-600"
                >
                  Gui yeu cau
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className={`fixed bottom-6 right-6 rounded-lg px-6 py-3 font-medium text-white shadow-lg ${
                toast.type === "success" ? "bg-emerald-500" : "bg-red-500"
              }`}
            >
              {toast.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

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
                <button
                  onClick={handleBackupDownload}
                  className="rounded-lg bg-slate-700/50 px-3 py-2 text-slate-200 transition hover:bg-slate-700"
                >
                  Sao luu
                </button>
                <button
                  onClick={handleChooseBackupFile}
                  className="rounded-lg bg-slate-700/50 px-3 py-2 text-slate-200 transition hover:bg-slate-700"
                >
                  Khoi phuc
                </button>
                <button
                  onClick={handleClearAll}
                  className="rounded-lg bg-amber-500/20 px-3 py-2 text-amber-300 transition hover:bg-amber-500/30"
                >
                  Xoa du lieu
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json"
                  onChange={handleRestoreFromFile}
                  className="hidden"
                />
              </div>
            )}
            <div className="text-right">
              <p className="font-medium">{authUser.fullName}</p>
              <p className="text-sm text-slate-400">
                {authUser.role === "admin" ? "Quan tri vien" : `SV: ${authUser.studentCode}`}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-500/20 px-4 py-2 text-red-400 transition hover:bg-red-500/30"
            >
              Dang xuat
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-slate-800/50 p-6"
          >
            <p className="text-sm text-slate-400">Tong sinh vien</p>
            <p className="text-3xl font-bold text-sky-400">{stats.totalStudents}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl bg-slate-800/50 p-6"
          >
            <p className="text-sm text-slate-400">Ty le dat</p>
            <p className="text-3xl font-bold text-emerald-400">{stats.passRate}%</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl bg-slate-800/50 p-6"
          >
            <p className="text-sm text-slate-400">Sinh vien dan dau</p>
            <p className="text-lg font-bold text-amber-400">
              {stats.topStudent ? `${stats.topStudent.fullName} (${stats.topStudent.average})` : "Chua co du lieu"}
            </p>
          </motion.div>
        </div>

        {/* Admin Forms */}
        {canEdit && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Add Student */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-xl bg-slate-800/50 p-6"
            >
              <h2 className="mb-4 text-lg font-semibold">Them Sinh Vien</h2>
              <form onSubmit={handleAddStudent} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  <input
                    type="text"
                    value={studentForm.code}
                    onChange={(e) => setStudentForm((prev) => ({ ...prev, code: e.target.value }))}
                    placeholder="Ma sinh vien (VD: SV010)"
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none transition focus:border-sky-400"
                  />
                  <input
                    type="text"
                    value={studentForm.fullName}
                    onChange={(e) => setStudentForm((prev) => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Ho va ten"
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none transition focus:border-sky-400"
                  />
                  <input
                    type="text"
                    value={studentForm.className}
                    onChange={(e) => setStudentForm((prev) => ({ ...prev, className: e.target.value }))}
                    placeholder="Lop (VD: CNTT-K16A)"
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none transition focus:border-sky-400"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-500 px-6 py-2 font-medium transition hover:bg-emerald-600"
                >
                  Them
                </button>
              </form>
            </motion.div>

            {/* Add Grade */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-xl bg-slate-800/50 p-6"
            >
              <h2 className="mb-4 text-lg font-semibold">Nhap Diem Mon Hoc</h2>
              <form onSubmit={handleAddRecord} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  <select
                    value={recordForm.studentId}
                    onChange={(e) => setRecordForm((prev) => ({ ...prev, studentId: e.target.value }))}
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none transition focus:border-sky-400"
                  >
                    <option value="">-- Chon sinh vien --</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.fullName}
                      </option>
                    ))}
                  </select>
                  <select
                    value={recordForm.subject}
                    onChange={(e) => setRecordForm((prev) => ({ ...prev, subject: e.target.value }))}
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none transition focus:border-sky-400"
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <select
                    value={recordForm.semester}
                    onChange={(e) => setRecordForm((prev) => ({ ...prev, semester: e.target.value }))}
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none transition focus:border-sky-400"
                  >
                    {SEMESTERS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={recordForm.midterm}
                    onChange={(e) => setRecordForm((prev) => ({ ...prev, midterm: e.target.value }))}
                    placeholder="Giua ky"
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none transition focus:border-sky-400"
                  />
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={recordForm.final}
                    onChange={(e) => setRecordForm((prev) => ({ ...prev, final: e.target.value }))}
                    placeholder="Cuoi ky"
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none transition focus:border-sky-400"
                  />
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    value={recordForm.bonus}
                    onChange={(e) => setRecordForm((prev) => ({ ...prev, bonus: e.target.value }))}
                    placeholder="Diem cong"
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none transition focus:border-sky-400"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-lg bg-sky-500 px-6 py-2 font-medium transition hover:bg-sky-600"
                >
                  Luu diem
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Forgot Password Requests (Admin) */}
        {canEdit && forgotRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-slate-800/50 p-6"
          >
            <h2 className="mb-4 text-lg font-semibold">Yeu Cau Quen Mat Khau</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-700 text-slate-400">
                  <tr>
                    <th className="pb-3">Tai khoan</th>
                    <th className="pb-3">Ho ten</th>
                    <th className="pb-3">Ma SV</th>
                    <th className="pb-3">Trang thai</th>
                    <th className="pb-3">Thoi gian</th>
                    <th className="pb-3">Tac vu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {forgotRequests.map((request) => (
                    <tr key={request.id}>
                      <td className="py-3">{request.account}</td>
                      <td className="py-3">{request.fullName}</td>
                      <td className="py-3">{request.studentCode}</td>
                      <td className="py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            request.status === "sent"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-amber-500/20 text-amber-400"
                          }`}
                        >
                          {request.status === "sent" ? "Da gui server" : "Cho gui server"}
                        </span>
                      </td>
                      <td className="py-3">{new Date(request.createdAt).toLocaleString("vi-VN")}</td>
                      <td className="py-3">
                        <button
                          onClick={() => handleProcessForgot(request.id)}
                          disabled={request.status === "sent"}
                          className="rounded bg-sky-500/20 px-3 py-1 text-sky-400 transition hover:bg-sky-500/30 disabled:opacity-50"
                        >
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
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            placeholder="Tim theo ma SV / ten"
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 outline-none transition focus:border-sky-400"
          />
          <select
            value={filters.className}
            onChange={(e) => setFilters((prev) => ({ ...prev, className: e.target.value }))}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 outline-none transition focus:border-sky-400"
          >
            <option value="all">Tat ca lop</option>
            {uniqueClasses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={filters.semester}
            onChange={(e) => setFilters((prev) => ({ ...prev, semester: e.target.value }))}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 outline-none transition focus:border-sky-400"
          >
            <option value="all">Tat ca hoc ky</option>
            {SEMESTERS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Student Summary Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-slate-800/50 p-6"
        >
          <h2 className="mb-4 text-lg font-semibold">Danh Sach Sinh Vien</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-700 text-slate-400">
                <tr>
                  <th className="pb-3">Ma SV</th>
                  <th className="pb-3">Ho ten</th>
                  <th className="pb-3">Lop</th>
                  <th className="pb-3">So mon</th>
                  <th className="pb-3">Diem TB</th>
                  <th className="pb-3">Xep loai</th>
                  <th className="pb-3">Tac vu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {studentSummaryRows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Khong co sinh vien.
                    </td>
                  </tr>
                )}
                {studentSummaryRows.map((row) => (
                  <tr key={row.id}>
                    <td className="py-3 font-mono">{row.code}</td>
                    <td className="py-3">{row.fullName}</td>
                    <td className="py-3">{row.className}</td>
                    <td className="py-3">{row.subjectsCount}</td>
                    <td className="py-3 font-semibold text-sky-400">{row.average}</td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          row.rank === "Xuat sac"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : row.rank === "Gioi"
                            ? "bg-sky-500/20 text-sky-400"
                            : row.rank === "Kha"
                            ? "bg-amber-500/20 text-amber-400"
                            : row.rank === "Trung binh"
                            ? "bg-slate-500/20 text-slate-400"
                            : row.rank === "Yeu"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-slate-500/20 text-slate-500"
                        }`}
                      >
                        {row.rank}
                      </span>
                    </td>
                    <td className="py-3">
                      {canEdit ? (
                        <button
                          onClick={() => handleDeleteStudent(row.id)}
                          className="rounded bg-red-500/20 px-3 py-1 text-red-400 transition hover:bg-red-500/30"
                        >
                          Xoa
                        </button>
                      ) : (
                        <span className="text-slate-500">Chi xem</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Grade Records Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-slate-800/50 p-6"
        >
          <h2 className="mb-4 text-lg font-semibold">Danh Sach Diem Da Nhap</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-700 text-slate-400">
                <tr>
                  <th className="pb-3">Sinh vien</th>
                  <th className="pb-3">Mon hoc</th>
                  <th className="pb-3">Hoc ky</th>
                  <th className="pb-3">Giua ky</th>
                  <th className="pb-3">Cuoi ky</th>
                  <th className="pb-3">Tong ket</th>
                  <th className="pb-3">Tac vu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredRecords.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Chua co ban ghi diem.
                    </td>
                  </tr>
                )}
                {filteredRecords.map((record) => {
                  const student = students.find((item) => item.id === record.studentId);
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
                          <button
                            onClick={() => handleDeleteRecord(record.id)}
                            className="rounded bg-red-500/20 px-3 py-1 text-red-400 transition hover:bg-red-500/30"
                          >
                            Xoa
                          </button>
                        ) : (
                          <span className="text-slate-500">Chi xem</span>
                        )}
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
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-6 right-6 rounded-lg px-6 py-3 font-medium text-white shadow-lg ${
              toast.type === "success" ? "bg-emerald-500" : "bg-red-500"
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
