"use client";

import { useEffect, useState } from "react";
import { getTasks } from "@/lib/sheets";
import { TasksContent } from "@/components/tasks-content";
import type { Task } from "@/lib/sheets";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTasks()
      .then(setTasks)
      .catch((e) => setError(e.message || "タスクの取得に失敗しました"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-gray-400 text-sm">読み込み中...</div>;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          <p className="font-medium">読み込みエラー</p>
          <p className="mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-3 py-1.5 bg-red-100 hover:bg-red-200 rounded text-xs font-medium transition-colors"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  return <TasksContent tasks={tasks} />;
}
