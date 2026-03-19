"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, ListTodo, Bot, FileText, LogOut } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

const NAV = [
  { href: "/", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/tasks", label: "タスク管理", icon: ListTodo },
  { href: "/sessions", label: "セッション", icon: Bot },
  { href: "/docs", label: "ドキュメント", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen shrink-0 sticky top-0">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900 text-sm">Work Dashboard</h1>
            <p className="text-xs text-gray-500">タスク・プロジェクト管理</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <p className="text-xs font-medium text-gray-400 mb-3 px-3">メニュー</p>
        <ul className="space-y-1">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${active ? "text-blue-700" : "text-gray-400"}`} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        {user && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">
                {user.user_metadata?.full_name || user.email?.split("@")[0]}
              </p>
              <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
            </div>
            <button
              onClick={signOut}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="ログアウト"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
