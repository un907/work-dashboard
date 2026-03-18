"use client";

import { useEffect, useState } from "react";
import { getTasks } from "@/lib/sheets";
import { TasksContent } from "@/components/tasks-content";
import type { Task } from "@/lib/sheets";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTasks()
      .then(setTasks)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-gray-400 text-sm">読み込み中...</div>;
  }

  return <TasksContent tasks={tasks} />;
}
