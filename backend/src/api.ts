// ============================================================
// api.ts – Tất cả các hàm giao tiếp với backend Express
// Đặt file này vào: src/api.ts
// ============================================================

// Lấy URL backend từ biến môi trường Vite
// Khi chạy local: http://localhost:3001
// Khi deploy:     URL Railway của bạn
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

// ─── Types (copy từ App.tsx để dùng chung) ──────────────────
export type Student = {
  id: string;
  code: string;
  fullName: string;
  className: string;
};

export type GradeRecord = {
  id: string;
  studentId: string;
  subject: string;
  semester: string;
  midterm: number;
  final: number;
  bonus: number;
};

export type UserRole = "admin" | "sinh_vien";

export type UserAccount = {
  id: string;
  username: string;
  password: string;
  fullName: string;
  role: UserRole;
  studentCode?: string;
};

export type AuthUser = Omit<UserAccount, "password">;

export type ForgotPasswordRequest = {
  id: string;
  account: string;
  fullName: string;
  studentCode: string;
  createdAt: string;
  status: "queued" | "sent";
};

// ─── Hàm fetch chung ────────────────────────────────────────
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data as { error?: string }).error ?? "Loi server");
  return data as T;
}

// ─── STUDENTS ───────────────────────────────────────────────
export const getStudents = () =>
  apiFetch<Student[]>("/api/students");

export const createStudent = (body: Omit<Student, "id">) =>
  apiFetch<Student>("/api/students", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const updateStudent = (id: string, body: Partial<Omit<Student, "id">>) =>
  apiFetch<Student>(`/api/students/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

export const deleteStudent = (id: string) =>
  apiFetch<{ success: boolean }>(`/api/students/${id}`, { method: "DELETE" });

// ─── GRADE RECORDS ──────────────────────────────────────────
export const getRecords = () =>
  apiFetch<GradeRecord[]>("/api/records");

export const createRecord = (body: Omit<GradeRecord, "id">) =>
  apiFetch<GradeRecord>("/api/records", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const updateRecord = (id: string, body: Partial<Omit<GradeRecord, "id">>) =>
  apiFetch<GradeRecord>(`/api/records/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

export const deleteRecord = (id: string) =>
  apiFetch<{ success: boolean }>(`/api/records/${id}`, { method: "DELETE" });

// ─── AUTH ────────────────────────────────────────────────────
export const login = (username: string, password: string) =>
  apiFetch<AuthUser>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

export const register = (body: {
  fullName: string;
  studentCode: string;
  className: string;
  password: string;
}) =>
  apiFetch<{ success: boolean; message: string }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const getUsers = () =>
  apiFetch<Omit<UserAccount, "password">[]>("/api/auth/users");

// ─── FORGOT PASSWORD ─────────────────────────────────────────
export const getForgotRequests = () =>
  apiFetch<ForgotPasswordRequest[]>("/api/forgot");

export const createForgotRequest = (body: {
  account: string;
  fullName: string;
  studentCode: string;
}) =>
  apiFetch<ForgotPasswordRequest>("/api/forgot", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const updateForgotStatus = (id: string, status: "queued" | "sent") =>
  apiFetch<ForgotPasswordRequest>(`/api/forgot/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

export const deleteForgotRequest = (id: string) =>
  apiFetch<{ success: boolean }>(`/api/forgot/${id}`, { method: "DELETE" });
