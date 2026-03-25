"use client";

import { useState } from "react";
import { updateProjectV2 } from "@/lib/api-v2";
import type { ProjectV2 } from "@/lib/api-v2";
import { ExternalLink, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATUS_OPTIONS = ["active", "planning", "archived"] as const;
const STATUS_LABEL: Record<string, string> = { active: "Active", planning: "Planning", archived: "Archived" };

interface Props {
  project: ProjectV2;
  onUpdate: (p: ProjectV2) => void;
}

export function OverviewTab({ project, onUpdate }: Props) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(project.name);
  const [desc, setDesc] = useState(project.description || "");
  const [gitUrl, setGitUrl] = useState(project.git_url || "");
  const [notionTag, setNotionTag] = useState(project.notion_tag || "");
  const [status, setStatus] = useState(project.status);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateProjectV2(project.id, {
        name, description: desc, git_url: gitUrl, notion_tag: notionTag, status,
      });
      onUpdate(updated);
      setEditing(false);
    } catch {
      alert("更新に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <div className="space-y-4 max-w-xl">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">プロジェクト名</label>
          <input value={name} onChange={(e) => setName(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">説明</label>
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">GitHub URL</label>
          <input value={gitUrl} onChange={(e) => setGitUrl(e.target.value)} placeholder="https://github.com/..."
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Notion タグ</label>
          <input value={notionTag} onChange={(e) => setNotionTag(e.target.value)} placeholder="カテゴリ名でフィルタ"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">ステータス</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as ProjectV2["status"])}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2">
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
        </div>
        <div className="flex gap-2 pt-2">
          <Button onClick={handleSave} size="sm" className="text-xs" disabled={saving}>
            {saving ? "保存中..." : "保存"}
          </Button>
          <Button onClick={() => setEditing(false)} variant="outline" size="sm" className="text-xs">キャンセル</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setEditing(true)} variant="outline" size="sm" className="text-xs gap-1.5">
          <Pencil className="w-3 h-3" /> 編集
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <InfoCard label="ステータス" value={STATUS_LABEL[project.status] || project.status} />
        <InfoCard label="作成日" value={new Date(project.created_at).toLocaleDateString("ja-JP")} />
        {project.notion_tag && <InfoCard label="Notion タグ" value={project.notion_tag} />}
        <InfoCard label="最終更新" value={new Date(project.updated_at || project.created_at).toLocaleDateString("ja-JP")} />
      </div>

      {project.git_url && (
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 mb-1">GitHub</p>
          <a href={project.git_url} target="_blank" rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline flex items-center gap-1.5">
            <ExternalLink className="w-3.5 h-3.5" />
            {project.git_url.replace("https://github.com/", "")}
          </a>
        </div>
      )}

    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <p className="text-xs font-medium text-gray-400 mb-1">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}
