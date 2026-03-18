"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Task } from "@/lib/sheets";

const STATUS_BADGE: Record<string, string> = {
  未着手: "bg-gray-100 text-gray-700",
  進行中: "bg-blue-100 text-blue-700",
  完了: "bg-green-100 text-green-700",
  保留: "bg-yellow-100 text-yellow-700",
};

const PRIORITY_ICON: Record<string, { color: string; label: string }> = {
  高: { color: "text-red-500", label: "高" },
  中: { color: "text-yellow-500", label: "中" },
  低: { color: "text-gray-400", label: "低" },
};

const DUE_LABELS: Record<string, string> = {
  today: "今日",
  tomorrow: "明日",
  this_week: "今週",
  later: "後で",
  someday: "いつか",
};

interface Props {
  tasks: Task[];
}

export function TasksContent({ tasks }: Props) {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">タスク管理</h1>
          <p className="text-sm text-gray-500 mt-1">
            Google Sheets からリアルタイムで取得
          </p>
        </div>
        <div className="flex gap-2">
          <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg">
            {tasks.length} 件
          </span>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">
                    タイトル
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                    ステータス
                  </th>
                  <th className="text-center text-xs font-semibold text-gray-500 px-4 py-3">
                    優先度
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                    期限
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                    ソース
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                    更新日時
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tasks.map((task) => {
                  const pri = PRIORITY_ICON[task.priority] || PRIORITY_ICON["中"];
                  return (
                    <tr
                      key={task.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          {task.title}
                        </p>
                        {task.text !== task.title && (
                          <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">
                            {task.text}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <Badge
                          className={`text-xs font-medium ${
                            STATUS_BADGE[task.status] || STATUS_BADGE["未着手"]
                          }`}
                        >
                          {task.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`text-sm font-bold ${pri.color}`}>
                          {pri.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-600">
                          {DUE_LABELS[task.dueDate] || task.dueDate || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant="outline" className="text-xs">
                          {task.source}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs text-gray-400">
                          {task.updatedAt?.substring(0, 16)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {tasks.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-12 text-gray-400 text-sm"
                    >
                      タスクなし
                    </td>
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
