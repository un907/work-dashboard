"use client";

import { useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { createTask, updateTask, deleteTask } from "@/lib/sheets";
import type { Task } from "@/lib/sheets";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://rikkeyapp.net";

const STATUS_BADGE: Record<string, string> = {
  "未着手": "bg-gray-100 text-gray-700",
  "進行中": "bg-blue-100 text-blue-700",
  "完了": "bg-green-100 text-green-700",
  "保留": "bg-yellow-100 text-yellow-700",
};
const STATUS_ORDER = ["未着手", "進行中", "完了", "保留"];
const PRIORITY_ORDER = ["高", "中", "低"];
const DUE_LABELS: Record<string, string> = { today: "今日", tomorrow: "明日", this_week: "今週", later: "後で", someday: "いつか" };
const DUE_ORDER = ["today", "tomorrow", "this_week", "later", "someday"];
const priColor: Record<string, string> = { "高": "text-red-500", "中": "text-yellow-500", "低": "text-gray-400" };

interface Props {
  projectId: string;
  projectName: string;
}

export function TasksTab({ projectId, projectName }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState("中");
  const [newDue, setNewDue] = useState("later");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await fetch(`${API_BASE}/api/tasks?project=${projectId}`, { cache: "no-store" });
      const data = await r.json();
      setTasks(data);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setSaving(true);
    try {
      await createTask({ title: newTitle.trim(), priority: newPriority, dueDate: newDue, project: projectId });
      setNewTitle("");
      setAdding(false);
      await load();
    } catch {
      alert("作成失敗");
    } finally {
      setSaving(false);
    }
  };

  const cycle = async (task: Task, field: "status" | "priority" | "dueDate") => {
    const orders: Record<string, string[]> = { status: STATUS_ORDER, priority: PRIORITY_ORDER, dueDate: DUE_ORDER };
    const order = orders[field];
    const current = task[field] || order[0];
    const next = order[(order.indexOf(current) + 1) % order.length];
    try {
      await updateTask(task.id, { [field]: next });
      await load();
    } catch { alert("更新失敗"); }
  };

  const handleDelete = async (task: Task) => {
    if (!confirm(`「${task.title}」を削除しますか?`)) return;
    try {
      await deleteTask(task.id);
      await load();
    } catch { alert("削除失敗"); }
  };

  if (loading) return <div className="text-gray-400 text-sm py-8">読み込み中...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg">{tasks.length} 件</span>
        </div>
        {!adding && (
          <Button onClick={() => setAdding(true)} size="sm" className="text-xs gap-1">
            <Plus className="w-3.5 h-3.5" /> タスク追加
          </Button>
        )}
      </div>

      {adding && (
        <Card className="mb-4">
          <CardContent className="p-3">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Input autoFocus value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setAdding(false); }}
                  placeholder="タスク名..." className="text-sm" />
              </div>
              <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)} className="text-xs border rounded px-2 py-1.5">
                {PRIORITY_ORDER.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <select value={newDue} onChange={(e) => setNewDue(e.target.value)} className="text-xs border rounded px-2 py-1.5">
                {DUE_ORDER.map((d) => <option key={d} value={d}>{DUE_LABELS[d]}</option>)}
              </select>
              <Button onClick={handleCreate} disabled={saving || !newTitle.trim()} size="sm" className="text-xs">
                {saving ? "..." : "追加"}
              </Button>
              <Button onClick={() => setAdding(false)} variant="outline" size="sm" className="text-xs">取消</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-2.5">タイトル</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-3 py-2.5">ステータス</th>
                <th className="text-center text-xs font-semibold text-gray-500 px-3 py-2.5">優先度</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-3 py-2.5">期限</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tasks.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-900">{t.title}</p>
                  </td>
                  <td className="px-3 py-3">
                    <Badge className={`text-xs cursor-pointer select-none ${STATUS_BADGE[t.status] || ""}`}
                      onClick={() => cycle(t, "status")}>{t.status}</Badge>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`text-xs font-bold cursor-pointer select-none ${priColor[t.priority] || ""}`}
                      onClick={() => cycle(t, "priority")}>{t.priority}</span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-xs text-gray-600 cursor-pointer select-none hover:text-blue-600"
                      onClick={() => cycle(t, "dueDate")}>{DUE_LABELS[t.dueDate] || t.dueDate || "-"}</span>
                  </td>
                  <td className="px-2 py-3">
                    <button onClick={() => handleDelete(t)}
                      className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400 text-sm">
                  このプロジェクトにタスクはありません
                </td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
