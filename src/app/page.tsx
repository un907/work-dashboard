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

  useEffect(() => {
    Promise.all([getTasks(), getSessionLogs(), getSnapshots()])
      .then(([t, s, snap]) => {
        setTasks(t);
        setSessions(s);
        setSnapshots(snap);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-gray-400 text-sm">読み込み中...</div>
    );
  }

  return (
    <DashboardContent tasks={tasks} sessions={sessions} snapshots={snapshots} />
  );
}
