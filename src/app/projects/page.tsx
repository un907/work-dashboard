"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProjects, createProject, deleteProject } from "@/lib/sheets";
import type { Project } from "@/lib/sheets";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, ExternalLink, FolderKanban, GitBranch, FileText } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  active: { label: "Active", color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  planning: { label: "Planning", color: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  archived: { label: "Archived", color: "bg-gray-50 text-gray-500 border-gray-200", dot: "bg-gray-400" },
};

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newGitUrl, setNewGitUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setProjects(await getProjects());
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const p = await createProject({
        name: newName.trim(),
        description: newDesc.trim() || undefined,
        gitUrl: newGitUrl.trim() || undefined,
        status: "active",
      });
      setCreating(false);
      setNewName("");
      setNewDesc("");
      setNewGitUrl("");
      await load();
      router.push(`/projects/${p.id}`);
    } catch {
      alert("作成に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("このプロジェクトを削除しますか?")) return;
    try {
      await deleteProject(id);
      await load();
    } catch {
      alert("削除に失敗しました");
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-100 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-gray-50 rounded-xl border border-gray-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between animate-fade-in">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <FolderKanban className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">プロジェクト</h1>
          </div>
          <p className="text-sm text-gray-500 ml-[42px]">
            ドキュメント・フロー図・Git・タスクを統合管理
          </p>
        </div>
        <Button
          onClick={() => setCreating(true)}
          size="sm"
          className="text-xs gap-1.5 bg-gray-900 hover:bg-gray-800 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          新規プロジェクト
        </Button>
      </div>

      {/* Create form */}
      {creating && (
        <Card className="mb-6 animate-scale-in border-blue-200 shadow-lg shadow-blue-500/5">
          <CardContent className="p-5 space-y-3">
            <p className="text-sm font-semibold text-gray-800">新規プロジェクト</p>
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setCreating(false); }}
              placeholder="プロジェクト名"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            />
            <input
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="説明（任意）"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            />
            <input
              value={newGitUrl}
              onChange={(e) => setNewGitUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
              placeholder="GitHubリポジトリURL（任意）"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            />
            <div className="flex gap-2 pt-1">
              <Button onClick={handleCreate} size="sm" className="text-xs" disabled={saving || !newName.trim()}>
                {saving ? "作成中..." : "作成"}
              </Button>
              <Button onClick={() => setCreating(false)} variant="outline" size="sm" className="text-xs">
                キャンセル
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {projects.map((p) => {
          const st = STATUS_CONFIG[p.status] || STATUS_CONFIG.active;
          const gitOwnerRepo = p.gitUrl?.replace("https://github.com/", "");
          return (
            <div
              key={p.id}
              className="project-card stagger-item cursor-pointer rounded-xl border border-gray-200 bg-white hover:border-gray-300 group relative overflow-hidden"
              onClick={() => router.push(`/projects/${p.id}`)}
            >
              {/* Color accent bar */}
              <div
                className="h-1 w-full"
                style={{ background: `linear-gradient(90deg, ${p.color || "#6366f1"}, ${p.color || "#6366f1"}88)` }}
              />

              <div className="p-5">
                {/* Top row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {p.icon ? (
                      <span className="text-xl leading-none">{p.icon}</span>
                    ) : (
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${p.color || "#6366f1"}15` }}>
                        <FolderKanban className="w-4 h-4" style={{ color: p.color || "#6366f1" }} />
                      </div>
                    )}
                    <h3 className="font-semibold text-gray-900 text-[15px] leading-tight">{p.name}</h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-medium ${st.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                      {st.label}
                    </span>
                    <button
                      onClick={(e) => handleDelete(e, p.id)}
                      className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                {p.description && (
                  <p className="text-xs text-gray-500 mb-4 line-clamp-2 leading-relaxed">{p.description}</p>
                )}

                {/* Meta row */}
                <div className="flex items-center gap-3 text-[11px] text-gray-400">
                  {gitOwnerRepo && (
                    <span className="flex items-center gap-1 truncate">
                      <GitBranch className="w-3 h-3 shrink-0" />
                      <span className="truncate">{gitOwnerRepo}</span>
                    </span>
                  )}
                  {p.links && p.links.length > 0 && (
                    <span className="flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      {p.links.length}
                    </span>
                  )}
                  <span className="ml-auto shrink-0">
                    {new Date(p.updatedAt || p.createdAt).toLocaleDateString("ja-JP", { month: "short", day: "numeric" })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {projects.length === 0 && !creating && (
        <div className="text-center py-20 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <FolderKanban className="w-7 h-7 text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">プロジェクトがありません</p>
          <p className="text-xs text-gray-400 mb-5">最初のプロジェクトを作成して管理を始めましょう</p>
          <Button onClick={() => setCreating(true)} variant="outline" size="sm" className="text-xs">
            プロジェクトを作成
          </Button>
        </div>
      )}
    </div>
  );
}
