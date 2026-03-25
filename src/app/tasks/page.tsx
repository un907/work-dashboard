"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { listTasksV2, createTaskV2, updateTaskV2, deleteTaskV2, type TaskV2 } from "@/lib/api-v2";
import { getProjects, type Project } from "@/lib/sheets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, ChevronDown, ChevronRight, FolderKanban } from "lucide-react";
import { RefreshButton } from "@/components/ui/refresh-button";

const STATUS_BADGE: Record<string, string> = {
  "open": "bg-blue-50 text-blue-700",
  "done": "bg-green-50 text-green-700",
  "archived": "bg-gray-100 text-gray-500",
};
const STATUS_LABELS: Record<string, string> = { "open": "進行中", "done": "完了", "archived": "アーカイブ" };
const STATUS_ORDER = ["open", "done", "archived"];
const PRIORITY_COLORS: Record<string, string> = { "high": "text-red-500", "normal": "text-yellow-500", "low": "text-gray-400" };
const PRIORITY_LABELS: Record<string, string> = { "high": "高", "normal": "中", "low": "低" };
const PRIORITY_ORDER = ["high", "normal", "low"];
const DUE_LABELS: Record<string, string> = { "today": "今日", "this_week": "今週", "later": "後で", "someday": "いつか" };
const DUE_ORDER = ["today", "this_week", "later", "someday"];

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskV2[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "open" | "done">("all");
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newProjectId, setNewProjectId] = useState("");
  const [newSection, setNewSection] = useState("");
  const [newPriority, setNewPriority] = useState("normal");
  const [saving, setSaving] = useState(false);
  const [collapsedProjects, setCollapsedProjects] = useState<Set<string>>(new Set());
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [t, p] = await Promise.all([listTasksV2(), getProjects()]);
      setTasks(t);
      setProjects(p);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const projectMap = useMemo(() => {
    const m = new Map<string, string>();
    projects.forEach(p => m.set(p.id, p.name));
    return m;
  }, [projects]);

  // プロジェクト別グルーピング
  const grouped = useMemo(() => {
    const filtered = filter === "all" ? tasks.filter(t => t.status !== "archived")
      : tasks.filter(t => t.status === filter);
    const groups = new Map<string, TaskV2[]>();
    for (const t of filtered) {
      const key = t.project_id || "_none";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(t);
    }
    return groups;
  }, [tasks, filter]);

  const toggleProject = (id: string) => {
    setCollapsedProjects(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setSaving(true);
    try {
      await createTaskV2({
        title: newTitle.trim(),
        project_id: newProjectId || undefined,
        section: newSection.trim() || undefined,
        priority: newPriority,
      });
      setNewTitle(""); setAdding(false);
      await load();
    } catch { alert("作成失敗"); }
    finally { setSaving(false); }
  };

  const cycle = async (task: TaskV2, field: "status" | "priority" | "due_hint") => {
    const orders: Record<string, string[]> = { status: STATUS_ORDER, priority: PRIORITY_ORDER, due_hint: DUE_ORDER };
    const order = orders[field];
    const current = (task as any)[field] || order[0];
    const next = order[(order.indexOf(current) + 1) % order.length];
    try { await updateTaskV2(task.id, { [field]: next } as any); await load(); }
    catch { alert("更新失敗"); }
  };

  const handleDelete = async (task: TaskV2) => {
    if (!confirm(`「${task.title}」を削除しますか?`)) return;
    try { await deleteTaskV2(task.id); await load(); }
    catch { alert("削除失敗"); }
  };

  if (loading) return <div className="p-8 text-gray-400 text-sm">読み込み中...</div>;

  const openCount = tasks.filter(t => t.status === "open").length;
  const doneCount = tasks.filter(t => t.status === "done").length;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">タスク管理</h1>
            <RefreshButton onRefresh={load} />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            <span className="font-semibold text-gray-700">{openCount}</span> 進行中
            <span className="mx-2 text-gray-300">|</span>
            <span className="font-semibold text-green-600">{doneCount}</span> 完了
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {(["all", "open", "done"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  filter === f ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                }`}>
                {f === "all" ? "全て" : f === "open" ? "進行中" : "完了"}
              </button>
            ))}
          </div>
          {!adding && (
            <Button onClick={() => setAdding(true)} size="sm" className="text-xs gap-1">
              <Plus className="w-3.5 h-3.5" /> タスク追加
            </Button>
          )}
        </div>
      </div>

      {adding && (
        <Card className="mb-4 animate-scale-in">
          <CardContent className="p-3 space-y-2">
            <Input autoFocus value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setAdding(false); }}
              placeholder="タスク名..." className="text-sm" />
            <div className="flex gap-2">
              <select value={newProjectId} onChange={(e) => setNewProjectId(e.target.value)}
                className="flex-1 text-xs border rounded px-2 py-1.5">
                <option value="">プロジェクトなし</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <input value={newSection} onChange={(e) => setNewSection(e.target.value)}
                placeholder="セクション" className="w-28 text-xs border rounded px-2 py-1.5" />
              <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)}
                className="text-xs border rounded px-2 py-1.5">
                {PRIORITY_ORDER.map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button onClick={() => setAdding(false)} variant="outline" size="sm" className="text-xs">取消</Button>
              <Button onClick={handleCreate} disabled={saving || !newTitle.trim()} size="sm" className="text-xs">
                {saving ? "..." : "追加"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project groups */}
      <div className="space-y-5">
        {[...grouped.entries()].map(([projId, projTasks]) => {
          const projName = projId === "_none" ? "未分類" : (projectMap.get(projId) || projId);
          const collapsed = collapsedProjects.has(projId);
          const openInProj = projTasks.filter(t => t.status === "open").length;

          // セクション別にさらにグルーピング
          const sections = new Map<string, TaskV2[]>();
          for (const t of projTasks) {
            const sec = t.section || "";
            if (!sections.has(sec)) sections.set(sec, []);
            sections.get(sec)!.push(t);
          }

          return (
            <div key={projId}>
              <button onClick={() => toggleProject(projId)}
                className="flex items-center gap-2 mb-2 group">
                {collapsed ? <ChevronRight className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                <FolderKanban className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">{projName}</span>
                <span className="text-xs text-gray-400">({openInProj}/{projTasks.length})</span>
              </button>

              {!collapsed && (
                <div className="ml-6 space-y-3">
                  {[...sections.entries()].map(([section, secTasks]) => (
                    <div key={section}>
                      {section && (
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 ml-3">{section}</p>
                      )}
                      <div className="space-y-0.5">
                        {secTasks.map(task => (
                          <div key={task.id} className="group">
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                              <Badge className={`text-[10px] cursor-pointer select-none shrink-0 ${STATUS_BADGE[task.status] || ""}`}
                                onClick={() => cycle(task, "status")}>
                                {STATUS_LABELS[task.status] || task.status}
                              </Badge>
                              <button onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                                className={`text-sm text-left flex-1 min-w-0 truncate ${task.status === "done" ? "text-gray-400 line-through" : "text-gray-900"}`}>
                                {task.title}
                              </button>
                              <span className={`text-xs font-bold cursor-pointer select-none shrink-0 ${PRIORITY_COLORS[task.priority] || ""}`}
                                onClick={() => cycle(task, "priority")}>
                                {PRIORITY_LABELS[task.priority] || ""}
                              </span>
                              <span className="text-[10px] text-gray-400 cursor-pointer select-none hover:text-blue-600 shrink-0 w-10 text-right"
                                onClick={() => cycle(task, "due_hint")}>
                                {DUE_LABELS[task.due_hint || ""] || ""}
                              </span>
                              <button onClick={() => handleDelete(task)}
                                className="p-0.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            {expandedTask === task.id && task.body && (
                              <div className="ml-[72px] mr-8 mb-1 px-3 py-2 bg-gray-50 rounded-lg text-xs text-gray-600 leading-relaxed animate-fade-in-fast">
                                {task.body}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-16 text-gray-400 text-sm">タスクがありません</div>
      )}
    </div>
  );
}
