"use client";

import { useEffect, useState } from "react";
import { getTasks, getSessionLogs, getSnapshots } from "@/lib/sheets";
import { DashboardContent } from "@/components/dashboard-content";
import type { Task, SessionLog, DailySnapshot } from "@/lib/sheets";

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessions, setSessions] = useState<SessionLog[]>([]);
  const [snapshots, setSnapshots] = useState<DailySnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getTasks(), getSessionLogs(), getSnapshots()])
      .then(([t, s, snap]) => {
        setTasks(t);
        setSessions(s);
        setSnapshots(snap);
      })
      .catch((e) => setError(e.message || "データの取得に失敗しました"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-gray-400 text-sm">読み込み中...</div>
    );
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

  return (
    <DashboardContent tasks={tasks} sessions={sessions} snapshots={snapshots} />
  );
}
