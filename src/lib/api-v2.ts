const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://rikkeyapp.net";
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN || "";

function headers(withAuth = false): HeadersInit {
  const h: HeadersInit = { "Content-Type": "application/json" };
  if (withAuth && API_TOKEN) h["Authorization"] = `Bearer ${API_TOKEN}`;
  return h;
}

// === Types ===

export interface DocV2 {
  id: string;
  title: string;
  project_id: string | null;
  category: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  content?: string;
  snippet?: string;
  backlinks?: Backlink[];
}

export interface TaskV2 {
  id: string;
  title: string;
  body: string | null;
  project_id: string | null;
  section: string | null;
  status: string;
  priority: string;
  due_hint: string | null;
  source: string;
  assignee: string;
  created_at: string;
  updated_at: string;
  backlinks?: Backlink[];
}

export interface Backlink {
  source_type: string;
  source_id: string;
  source_title: string;
  context: string;
}

export interface Link {
  id: number;
  source_type: string;
  source_id: string;
  target_type: string;
  target_id: string;
  source_title?: string;
  target_title?: string;
  context: string;
}

// === Documents ===

export async function listDocsV2(projectId?: string): Promise<DocV2[]> {
  const params = new URLSearchParams();
  if (projectId) params.set("project_id", projectId);
  const res = await fetch(`${API_BASE}/api/v2/documents?${params}`, { cache: "no-store" });
  return res.json();
}

export async function getDocV2(id: string): Promise<DocV2> {
  const res = await fetch(`${API_BASE}/api/v2/documents?id=${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("ドキュメント取得に失敗しました");
  return res.json();
}

export async function searchDocsV2(query: string): Promise<DocV2[]> {
  const res = await fetch(`${API_BASE}/api/v2/documents?q=${encodeURIComponent(query)}`, { cache: "no-store" });
  return res.json();
}

export async function createDocV2(doc: { title: string; project_id?: string; category?: string; content?: string }): Promise<DocV2> {
  const res = await fetch(`${API_BASE}/api/v2/documents`, {
    method: "POST", headers: headers(true), body: JSON.stringify(doc),
  });
  if (!res.ok) throw new Error("ドキュメント作成に失敗しました");
  return res.json();
}

export async function updateDocV2(id: string, updates: Partial<DocV2> & { content?: string }): Promise<DocV2> {
  const res = await fetch(`${API_BASE}/api/v2/documents`, {
    method: "PUT", headers: headers(true), body: JSON.stringify({ id, ...updates }),
  });
  if (!res.ok) throw new Error("ドキュメント更新に失敗しました");
  return res.json();
}

export async function deleteDocV2(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v2/documents`, {
    method: "DELETE", headers: headers(true), body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error("ドキュメント削除に失敗しました");
}

// === Tasks ===

export async function listTasksV2(opts?: { project_id?: string; status?: string; section?: string }): Promise<TaskV2[]> {
  const params = new URLSearchParams();
  if (opts?.project_id) params.set("project_id", opts.project_id);
  if (opts?.status) params.set("status", opts.status);
  if (opts?.section) params.set("section", opts.section);
  const res = await fetch(`${API_BASE}/api/v2/tasks?${params}`, { cache: "no-store" });
  return res.json();
}

export async function getTaskV2(id: string): Promise<TaskV2> {
  const res = await fetch(`${API_BASE}/api/v2/tasks?id=${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("タスク取得に失敗しました");
  return res.json();
}

export async function createTaskV2(task: {
  title: string; body?: string; project_id?: string; section?: string;
  priority?: string; due_hint?: string; source?: string;
}): Promise<TaskV2> {
  const res = await fetch(`${API_BASE}/api/v2/tasks`, {
    method: "POST", headers: headers(true), body: JSON.stringify(task),
  });
  if (!res.ok) throw new Error("タスク作成に失敗しました");
  return res.json();
}

export async function updateTaskV2(id: string, updates: Partial<TaskV2>): Promise<TaskV2> {
  const res = await fetch(`${API_BASE}/api/v2/tasks`, {
    method: "PUT", headers: headers(true), body: JSON.stringify({ id, ...updates }),
  });
  if (!res.ok) throw new Error("タスク更新に失敗しました");
  return res.json();
}

export async function deleteTaskV2(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v2/tasks`, {
    method: "DELETE", headers: headers(true), body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error("タスク削除に失敗しました");
}

// === Projects ===

export interface ProjectV2 {
  id: string;
  name: string;
  description: string | null;
  git_url: string | null;
  notion_tag: string | null;
  status: string;
  icon: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export async function listProjectsV2(): Promise<ProjectV2[]> {
  const res = await fetch(`${API_BASE}/api/v2/projects`, { cache: "no-store" });
  return res.json();
}

export async function getProjectV2(id: string): Promise<ProjectV2> {
  const res = await fetch(`${API_BASE}/api/v2/projects?id=${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("プロジェクト取得に失敗しました");
  return res.json();
}

export async function createProjectV2(project: { name: string; description?: string; git_url?: string; status?: string; icon?: string; color?: string }): Promise<ProjectV2> {
  const res = await fetch(`${API_BASE}/api/v2/projects`, {
    method: "POST", headers: headers(true), body: JSON.stringify(project),
  });
  if (!res.ok) throw new Error("プロジェクト作成に失敗しました");
  return res.json();
}

export async function updateProjectV2(id: string, updates: Partial<ProjectV2>): Promise<ProjectV2> {
  const res = await fetch(`${API_BASE}/api/v2/projects`, {
    method: "PUT", headers: headers(true), body: JSON.stringify({ id, ...updates }),
  });
  if (!res.ok) throw new Error("プロジェクト更新に失敗しました");
  return res.json();
}

export async function deleteProjectV2(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v2/projects`, {
    method: "DELETE", headers: headers(true), body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error("プロジェクト削除に失敗しました");
}

// === Diagrams ===

export interface DiagramV2 {
  id: string;
  project_id: string | null;
  title: string;
  mermaid_code: string;
  created_at: string;
  updated_at: string;
}

export async function listDiagramsV2(project_id?: string): Promise<DiagramV2[]> {
  const params = project_id ? `?project_id=${project_id}` : "";
  const res = await fetch(`${API_BASE}/api/v2/diagrams${params}`, { cache: "no-store" });
  return res.json();
}

export async function createDiagramV2(diagram: { project_id: string; title: string; mermaid_code?: string }): Promise<DiagramV2> {
  const res = await fetch(`${API_BASE}/api/v2/diagrams`, {
    method: "POST", headers: headers(true), body: JSON.stringify(diagram),
  });
  if (!res.ok) throw new Error("ダイアグラム作成に失敗しました");
  return res.json();
}

export async function updateDiagramV2(id: string, updates: Partial<DiagramV2>): Promise<DiagramV2> {
  const res = await fetch(`${API_BASE}/api/v2/diagrams`, {
    method: "PUT", headers: headers(true), body: JSON.stringify({ id, ...updates }),
  });
  if (!res.ok) throw new Error("ダイアグラム更新に失敗しました");
  return res.json();
}

export async function deleteDiagramV2(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v2/diagrams`, {
    method: "DELETE", headers: headers(true), body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error("ダイアグラム削除に失敗しました");
}

// === Links ===

export async function getBacklinks(targetType: string, targetId: string): Promise<Link[]> {
  const res = await fetch(`${API_BASE}/api/v2/links?target_type=${targetType}&target_id=${targetId}`, { cache: "no-store" });
  return res.json();
}

export async function getForwardLinks(sourceType: string, sourceId: string): Promise<Link[]> {
  const res = await fetch(`${API_BASE}/api/v2/links?source_type=${sourceType}&source_id=${sourceId}`, { cache: "no-store" });
  return res.json();
}
