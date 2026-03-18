"use client";

import { useEffect, useState } from "react";
import { getSessionLogs } from "@/lib/sheets";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { SessionLog } from "@/lib/sheets";

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSessionLogs()
      .then(setSessions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-gray-400 text-sm">読み込み中...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">セッション</h1>
        <p className="text-sm text-gray-500 mt-1">
          Claude Code 作業履歴（claude-mem同期）
        </p>
      </div>

      <div className="space-y-3">
        {sessions.map((s) => (
          <Card key={s.id} className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-blue-50 text-blue-700 text-xs">
                      {s.project}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {s.created_at?.substring(0, 16)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {s.request}
                  </p>
                  {s.completed && (
                    <p className="text-sm text-green-600">
                      ✓ {s.completed}
                    </p>
                  )}
                  {s.next_steps && (
                    <p className="text-sm text-gray-500 mt-1">
                      → {s.next_steps}
                    </p>
                  )}
                  {s.learned && (
                    <p className="text-xs text-amber-600 mt-1">
                      💡 {s.learned}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {sessions.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center text-gray-400 text-sm">
              セッションデータなし
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
