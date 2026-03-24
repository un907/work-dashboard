"use client";

import { useState } from "react";
import { updateProject } from "@/lib/sheets";
import type { Project } from "@/lib/sheets";
import { ExternalLink, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATUS_OPTIONS = ["active", "planning", "archived"] as const;
const STATUS_LABEL: Record<string, string> = { active: "Active", planning: "Planning", archived: "Archived" };

interface Props {
  project: Project;
  onUpdate: (p: Project) => void;
}

export function OverviewTab({ project, onUpdate }: Props) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(project.name);
  const [desc, setDesc] = useState(project.description || "");
  const [gitUrl, setGitUrl] = useState(project.gitUrl || "");
  const [notionTag, setNotionTag] = useState(project.notionTag || "");
  const [status, setStatus] = useState(project.status);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateProject(project.id, {
        name, description: desc, gitUrl, notionTag, status,
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
          <select value={status} onChange={(e) => setStatus(e.target.value as Project["status"])}
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
        <InfoCard label="作成日" value={new Date(project.createdAt).toLocaleDateString("ja-JP")} />
        {project.notionTag && <InfoCard label="Notion タグ" value={project.notionTag} />}
        <InfoCard label="最終更新" value={new Date(project.updatedAt || project.createdAt).toLocaleDateString("ja-JP")} />
      </div>

      {project.gitUrl && (
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 mb-1">GitHub</p>
          <a href={project.gitUrl} target="_blank" rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline flex items-center gap-1.5">
            <ExternalLink className="w-3.5 h-3.5" />
            {project.gitUrl.replace("https://github.com/", "")}
          </a>
        </div>
      )}

      {project.links && project.links.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-400 mb-2">リンク</p>
          <div className="space-y-1.5">
            {project.links.map((link) => (
              <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                <span>{link.icon}</span>
                <span>{link.title}</span>
                <ExternalLink className="w-3 h-3 ml-auto text-gray-400" />
              </a>
            ))}
          </div>
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
