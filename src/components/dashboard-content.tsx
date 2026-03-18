"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ListTodo,
  CheckCircle2,
  Clock,
  PauseCircle,
  Activity,
  TrendingUp,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { Task, SessionLog, DailySnapshot } from "@/lib/sheets";

const STATUS_COLORS: Record<string, string> = {
  未着手: "#f59e0b",
  進行中: "#3b82f6",
  保留: "#ef4444",
  完了: "#22c55e",
};

const KPI_CONFIG = [
  { key: "total", label: "総タスク数", color: "border-blue-500", icon: ListTodo, textColor: "text-blue-600" },
  { key: "pending", label: "未着手", color: "border-yellow-500", icon: Clock, textColor: "text-yellow-600" },
  { key: "inProgress", label: "進行中", color: "border-blue-500", icon: Activity, textColor: "text-blue-600" },
  { key: "onHold", label: "保留", color: "border-red-500", icon: PauseCircle, textColor: "text-red-600" },
  { key: "completed", label: "完了", color: "border-green-500", icon: CheckCircle2, textColor: "text-green-600" },
  { key: "sessions", label: "セッション", color: "border-purple-500", icon: TrendingUp, textColor: "text-purple-600" },
];

interface Props {
  tasks: Task[];
  sessions: SessionLog[];
  snapshots: DailySnapshot[];
}

export function DashboardContent({ tasks, sessions, snapshots }: Props) {
  const counts = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "未着手").length,
    inProgress: tasks.filter((t) => t.status === "進行中").length,
    onHold: tasks.filter((t) => t.status === "保留").length,
    completed: tasks.filter((t) => t.status === "完了").length,
    sessions: sessions.length,
  };

  const pieData = [
    { name: "未着手", value: counts.pending },
    { name: "進行中", value: counts.inProgress },
    { name: "保留", value: counts.onHold },
    { name: "完了", value: counts.completed },
  ].filter((d) => d.value > 0);

  const lineData = snapshots.map((s) => ({
    date: s.date?.substring(5) || "",
    タスク数: Number(s.total_tasks) || 0,
    完了: Number(s.completed) || 0,
    セッション: Number(s.sessions_count) || 0,
  }));

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="text-sm text-gray-500 mt-1">
          KPI サマリー & リアルタイム分析
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {KPI_CONFIG.map((kpi) => (
          <Card
            key={kpi.key}
            className={`border-t-4 ${kpi.color} shadow-sm hover:shadow-md transition-shadow`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl font-bold text-gray-900">
                  {counts[kpi.key as keyof typeof counts]}
                </span>
                <kpi.icon className={`w-5 h-5 ${kpi.textColor}`} />
              </div>
              <p className="text-xs text-gray-500 font-medium">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Trend Chart */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-1">
              推移
            </h2>
            <p className="text-xs text-gray-500 mb-4">日次スナップショット</p>
            {lineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip />
                  <Line type="monotone" dataKey="タスク数" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="完了" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="セッション" stroke="#a855f7" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-gray-400 text-sm">
                データが蓄積されると推移グラフが表示されます
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-1">
              タスクステータス
            </h2>
            <p className="text-xs text-gray-500 mb-4">ステータス別内訳</p>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {pieData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={STATUS_COLORS[entry.name] || "#94a3b8"}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">
                タスクなし
              </div>
            )}
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[d.name] }}
                  />
                  <span className="text-xs text-gray-600">{d.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-1">
            直近のセッション
          </h2>
          <p className="text-xs text-gray-500 mb-4">Claude Code 作業履歴</p>
          <div className="divide-y divide-gray-100">
            {sessions.slice(0, 10).map((s) => (
              <div key={s.id} className="py-3 flex items-start gap-3">
                <Badge variant="secondary" className="text-xs shrink-0 bg-blue-50 text-blue-700">
                  {s.project}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">
                    {s.request}
                  </p>
                  {s.completed && (
                    <p className="text-xs text-green-600 mt-0.5 truncate">
                      ✓ {s.completed}
                    </p>
                  )}
                </div>
                <span className="text-xs text-gray-400 shrink-0">
                  {s.created_at?.substring(0, 16)}
                </span>
              </div>
            ))}
            {sessions.length === 0 && (
              <p className="text-sm text-gray-400 py-8 text-center">
                セッションデータなし
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
