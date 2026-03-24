"use client";

import { useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { createTask, updateTask, deleteTask, type Task } from "@/lib/sheets";

const STATUS_BADGE: Record<string, string> = {
  "未着手": "bg-gray-100 text-gray-700",
  "進行中": "bg-blue-100 text-blue-700",
  "完了": "bg-green-100 text-green-700",
  "保留": "bg-yellow-100 text-yellow-700",
};

const STATUS_ORDER = ["未着手", "進行中", "完了", "保留"];
const PRIORITY_ORDER = ["高", "中", "低"];

const DUE_LABELS: Record<string, string> = {
  today: "今日", tomorrow: "明日", this_week: "今週", later: "後で", someday: "いつか",
};
const DUE_ORDER = ["today", "tomorrow", "this_week", "later", "someday"];

interface Props {
  tasks: Task[];
  onRefresh?: () => void;
}

export function TasksContent({ tasks, onRefresh }: Props) {
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState("中");
  const [newDue, setNewDue] = useState("later");
  const [saving, setSaving] = useState(false);

  const handleCreate = useCallback(async () => {
    if (!newTitle.trim()) return;
    setSaving(true);
    try {
      await createTask({ title: newTitle.trim(), priority: newPriority, dueDate: newDue });
      setNewTitle("");
      setAdding(false);
      onRefresh?.();
    } catch (e) {
      alert("作成失敗");
    } finally {
      setSaving(false);
    }
  }, [newTitle, newPriority, newDue, onRefresh]);

  const cycleStatus = useCallback(async (task: Task) => {
    const idx = STATUS_ORDER.indexOf(task.status);
    const next = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
    try {
      await updateTask(task.id, { status: next });
      onRefresh?.();
    } catch (e) {
      alert("更新失敗");
    }
  }, [onRefresh]);

  const cyclePriority = useCallback(async (task: Task) => {
    const idx = PRIORITY_ORDER.indexOf(task.priority);
    const next = PRIORITY_ORDER[(idx + 1) % PRIORITY_ORDER.length];
    try {
      await updateTask(task.id, { priority: next });
      onRefresh?.();
    } catch (e) {
      alert("更新失敗");
    }
  }, [onRefresh]);

  const cycleDue = useCallback(async (task: Task) => {
    const idx = DUE_ORDER.indexOf(task.dueDate);
    const next = DUE_ORDER[(idx + 1) % DUE_ORDER.length];
    try {
      await updateTask(task.id, { dueDate: next });
      onRefresh?.();
    } catch (e) {
      alert("更新失敗");
    }
  }, [onRefresh]);

  const handleDelete = useCallback(async (task: Task) => {
    if (!confirm(`「${task.title}」を削除しますか?`)) return;
    try {
      await deleteTask(task.id);
      onRefresh?.();
    } catch (e) {
      alert("削除失敗");
    }
  }, [onRefresh]);

  const priColor: Record<string, string> = { "高": "text-red-500", "中": "text-yellow-500", "低": "text-gray-400" };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">タスク管理</h1>
          <p className="text-sm text-gray-500 mt-1">クリックでステータス・優先度・期限を切り替え</p>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg">{tasks.length} 件</span>
          {!adding && (
            <Button onClick={() => setAdding(true)} size="sm" className="text-xs gap-1">
              <Plus className="w-3.5 h-3.5" /> タスク追加
            </Button>
          )}
        </div>
      </div>

      {/* 追加フォーム */}
      {adding && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">タイトル</label>
                <Input
                  autoFocus
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setAdding(false); }}
                  placeholder="タスク名を入力..."
                  className="text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">優先度</label>
                <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)} className="text-sm border rounded px-2 py-1.5">
                  {PRIORITY_ORDER.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">期限</label>
                <select value={newDue} onChange={(e) => setNewDue(e.target.value)} className="text-sm border rounded px-2 py-1.5">
                  {DUE_ORDER.map((d) => <option key={d} value={d}>{DUE_LABELS[d]}</option>)}
                </select>
              </div>
              <Button onClick={handleCreate} disabled={saving || !newTitle.trim()} size="sm" className="text-xs">
                {saving ? "保存中..." : "追加"}
              </Button>
              <Button onClick={() => setAdding(false)} variant="outline" size="sm" className="text-xs">キャンセル</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">タイトル</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">ステータス</th>
                  <th className="text-center text-xs font-semibold text-gray-500 px-4 py-3">優先度</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">期限</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">ソース</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">更新日時</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                      {task.text !== task.title && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{task.text}</p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <Badge
                        className={`text-xs font-medium cursor-pointer select-none ${STATUS_BADGE[task.status] || STATUS_BADGE["未着手"]}`}
                        onClick={() => cycleStatus(task)}
                        title="クリックで切り替え"
                      >
                        {task.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`text-sm font-bold cursor-pointer select-none ${priColor[task.priority] || "text-gray-400"}`}
                        onClick={() => cyclePriority(task)}
                        title="クリックで切り替え"
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className="text-sm text-gray-600 cursor-pointer select-none hover:text-blue-600"
                        onClick={() => cycleDue(task)}
                        title="クリックで切り替え"
                      >
                        {DUE_LABELS[task.dueDate] || task.dueDate || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant="outline" className="text-xs">{task.source}</Badge>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs text-gray-400">{task.updatedAt?.substring(0, 16)}</span>
                    </td>
                    <td className="px-2 py-4">
                      <button
                        onClick={() => handleDelete(task)}
                        className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        title="削除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {tasks.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">タスクなし</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
