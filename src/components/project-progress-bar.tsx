"use client";

import type { TaskV2 } from "@/lib/api-v2";

interface ProjectGroup {
  name: string;
  color: string;
  open: number;
  done: number;
  total: number;
}

interface Props {
  tasks: TaskV2[];
  projectMap: Map<string, { name: string; color: string }>;
}

export function ProjectProgressBar({ tasks, projectMap }: Props) {
  // プロジェクト別に集計
  const groups: ProjectGroup[] = [];
  const byProject = new Map<string, { open: number; done: number }>();

  for (const t of tasks) {
    if (t.status === "archived") continue;
    const pid = t.project_id || "_none";
    if (!byProject.has(pid)) byProject.set(pid, { open: 0, done: 0 });
    const g = byProject.get(pid)!;
    if (t.status === "done") g.done++;
    else g.open++;
  }

  for (const [pid, counts] of byProject) {
    const proj = pid === "_none"
      ? { name: "未分類", color: "#9ca3af" }
      : projectMap.get(pid) || { name: pid.substring(0, 8), color: "#6366f1" };
    groups.push({ ...proj, ...counts, total: counts.open + counts.done });
  }

  // total降順でソート
  groups.sort((a, b) => b.total - a.total);

  if (groups.length === 0) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
      {groups.map((g) => {
        const pct = g.total > 0 ? Math.round((g.done / g.total) * 100) : 0;
        return (
          <div key={g.name} className="bg-white border border-gray-100 rounded-xl p-3.5 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: g.color }} />
                <span className="text-xs font-semibold text-gray-700 truncate">{g.name}</span>
              </div>
              <span className="text-[10px] text-gray-400 shrink-0 ml-2">
                {g.done}/{g.total}
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${pct}%`,
                  background: pct === 100
                    ? "linear-gradient(90deg, #10b981, #059669)"
                    : `linear-gradient(90deg, ${g.color}, ${g.color}cc)`,
                }}
              />
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className={`text-[10px] font-semibold ${pct === 100 ? "text-green-600" : "text-gray-500"}`}>
                {pct}%
              </span>
              <span className="text-[10px] text-gray-400">
                {g.open > 0 ? `${g.open} remaining` : "complete"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
