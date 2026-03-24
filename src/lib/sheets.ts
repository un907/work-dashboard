const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://rikkeyapp.net";
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN || "";

export interface Task {
  id: string;
  title: string;
  text: string;
  status: string;
  priority: string;
  dueDate: string;
  source: string;
  assignee: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionLog {
  id: string;
  project: string;
  request: string;
  completed: string;
  next_steps: string;
  learned: string;
  notes: string;
  created_at: string;
}

export interface DailySnapshot {
  date: string;
  total_tasks: string;
  completed: string;
  in_progress: string;
  pending: string;
  on_hold: string;
  sessions_count: string;
  observations_count: string;
}

function authHeaders(): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (API_TOKEN) headers["Authorization"] = `Bearer ${API_TOKEN}`;
  return headers;
}

// === Read ===

export async function getTasks(): Promise<Task[]> {
  const res = await fetch(`${API_BASE}/api/tasks`, { cache: "no-store" });
  return res.json();
}

export async function getSessionLogs(): Promise<SessionLog[]> {
  const res = await fetch(`${API_BASE}/api/sessions`, { cache: "no-store" });
  return res.json();
}

export async function getSnapshots(): Promise<DailySnapshot[]> {
  const res = await fetch(`${API_BASE}/api/snapshots`, { cache: "no-store" });
  return res.json();
}

// === Write (Bearer token required) ===

export async function createTask(task: { title: string; text?: string; priority?: string; dueDate?: string }): Promise<Task> {
  const res = await fetch(`${API_BASE}/api/tasks`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ ...task, text: task.text || task.title, source: "dashboard" }),
  });
  if (!res.ok) throw new Error("タスク作成に失敗しました");
  return res.json();
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  const res = await fetch(`${API_BASE}/api/tasks`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ id, ...updates }),
  });
  if (!res.ok) throw new Error("タスク更新に失敗しました");
  return res.json();
}

export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/tasks`, {
    method: "DELETE",
    headers: authHeaders(),
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error("タスク削除に失敗しました");
}
