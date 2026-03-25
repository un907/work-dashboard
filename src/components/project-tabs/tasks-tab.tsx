"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { RefreshButton } from "@/components/ui/refresh-button";
import { listTasksV2, createTaskV2, updateTaskV2, deleteTaskV2 } from "@/lib/api-v2";
import type { TaskV2 } from "@/lib/api-v2";

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

interface Props {
  projectId: string;
  projectName: string;
}

export function TasksTab({ projectId, projectName }: Props) {
  const [tasks, setTasks] = useState<TaskV2[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSection, setNewSection] = useState("");
  const [newPriority, setNewPriority] = useState("normal");
  const [newDue, setNewDue] = useState("later");
  const [saving, setSaving] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await listTasksV2({ project_id: projectId });
      setTasks(data);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  // セクション別グルーピング
  const grouped = useMemo(() => {
    const sections = new Map<string, TaskV2[]>();
    for (const t of tasks) {
      const sec = t.section || "未分類";
      if (!sections.has(sec)) sections.set(sec, []);
      sections.get(sec)!.push(t);
    }
    return sections;
  }, [tasks]);

  const existingSections = useMemo(() => {
    return [...new Set(tasks.map(t => t.section).filter(Boolean))] as string[];
  }, [tasks]);

  const toggleSection = (sec: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(sec)) next.delete(sec);
      else next.add(sec);
      return next;
    });
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setSaving(true);
    try {
      await createTaskV2({
        title: newTitle.trim(),
        project_id: projectId,
        section: newSection.trim() || undefined,
        priority: newPriority,
        due_hint: newDue,
      });
      setNewTitle("");
      setAdding(false);
      await load();
    } catch { alert("作成失敗"); }
    finally { setSaving(false); }
  };

  const cycle = async (task: TaskV2, field: "status" | "priority" | "due_hint") => {
    const orders: Record<string, string[]> = { status: STATUS_ORDER, priority: PRIORITY_ORDER, due_hint: DUE_ORDER };
    const order = orders[field];
    const current = (task as any)[field] || order[0];
    const next = order[(order.indexOf(current) + 1) % order.length];
    try {
      await updateTaskV2(task.id, { [field]: next } as any);
      await load();
    } catch { alert("更新失敗"); }
  };

  const handleDelete = async (task: TaskV2) => {
    if (!confirm(`「${task.title}」を削除しますか?`)) return;
    try { await deleteTaskV2(task.id); await load(); }
    catch { alert("削除失敗"); }
  };

  if (loading) return <div className="text-gray-400 text-sm py-8">読み込み中...</div>;

  const openCount = tasks.filter(t => t.status === "open").length;
  const doneCount = tasks.filter(t => t.status === "done").length;

  return (
    <div>
      {/* Progress bar */}
      {tasks.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-500">
              <span className="font-semibold text-gray-700">{openCount}</span> 進行中
              <span className="mx-2 text-gray-300">|</span>
              <span className="font-semibold text-green-600">{doneCount}</span> 完了
            </span>
            <span className="text-[10px] font-semibold text-gray-500">
              {tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0}%
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-blue-500 to-green-500"
              style={{ width: `${tasks.length > 0 ? (doneCount / tasks.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <RefreshButton onRefresh={load} />
        </div>
        {!adding && (
          <Button onClick={() => setAdding(true)} size="sm" className="text-xs gap-1">
            <Plus className="w-3.5 h-3.5" /> タスク追加
          </Button>
        )}
      </div>

      {/* Add form */}
      {adding && (
        <Card className="mb-4 animate-scale-in">
          <CardContent className="p-3 space-y-2">
            <Input autoFocus value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setAdding(false); }}
              placeholder="タスク名（大粒度で）..." className="text-sm" />
            <div className="flex gap-2">
              <div className="flex-1">
                <input value={newSection} onChange={(e) => setNewSection(e.target.value)}
                  placeholder="セクション（設計/実装/運用...）"
                  list="sections-list"
                  className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                <datalist id="sections-list">
                  {existingSections.map(s => <option key={s} value={s} />)}
                </datalist>
              </div>
              <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)} className="text-xs border rounded px-2 py-1.5">
                {PRIORITY_ORDER.map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
              </select>
              <select value={newDue} onChange={(e) => setNewDue(e.target.value)} className="text-xs border rounded px-2 py-1.5">
                {DUE_ORDER.map(d => <option key={d} value={d}>{DUE_LABELS[d]}</option>)}
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

      {/* Section groups */}
      <div className="space-y-4">
        {[...grouped.entries()].map(([section, sectionTasks]) => {
          const collapsed = collapsedSections.has(section);
          const sectionOpen = sectionTasks.filter(t => t.status === "open").length;
          return (
            <div key={section}>
              <button
                onClick={() => toggleSection(section)}
                className="flex items-center gap-2 mb-2 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
              >
                {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {section}
                <span className="font-normal text-gray-400">({sectionOpen}/{sectionTasks.length})</span>
              </button>

              {!collapsed && (
                <div className="space-y-1 ml-5">
                  {sectionTasks.map(task => (
                    <div key={task.id} className="group">
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                        {/* Status */}
                        <Badge
                          className={`text-[10px] cursor-pointer select-none shrink-0 ${STATUS_BADGE[task.status] || ""}`}
                          onClick={() => cycle(task, "status")}
                        >
                          {STATUS_LABELS[task.status] || task.status}
                        </Badge>

                        {/* Title + expand */}
                        <button
                          onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                          className={`text-sm text-left flex-1 min-w-0 truncate ${task.status === "done" ? "text-gray-400 line-through" : "text-gray-900"}`}
                        >
                          {task.title}
                        </button>

                        {/* Priority */}
                        <span
                          className={`text-xs font-bold cursor-pointer select-none shrink-0 ${PRIORITY_COLORS[task.priority] || ""}`}
                          onClick={() => cycle(task, "priority")}
                        >
                          {PRIORITY_LABELS[task.priority] || task.priority}
                        </span>

                        {/* Due hint */}
                        <span
                          className="text-[10px] text-gray-400 cursor-pointer select-none hover:text-blue-600 shrink-0 w-10 text-right"
                          onClick={() => cycle(task, "due_hint")}
                        >
                          {DUE_LABELS[task.due_hint || ""] || ""}
                        </span>

                        {/* Delete */}
                        <button onClick={() => handleDelete(task)}
                          className="p-0.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Expanded body */}
                      {expandedTask === task.id && task.body && (
                        <div className="ml-[72px] mr-8 mb-2 px-3 py-2 bg-gray-50 rounded-lg text-xs text-gray-600 leading-relaxed animate-fade-in-fast">
                          {task.body}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {tasks.length === 0 && !adding && (
        <div className="text-center py-12 text-gray-400 text-sm">
          このプロジェクトにタスクはありません
        </div>
      )}
    </div>
  );
}
