const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://rikkeyapp.net";

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
