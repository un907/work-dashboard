"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Markdown from "react-markdown";

interface DocMeta {
  id: string;
  title: string;
  category: string;
  status: string;
  lastEdited: string;
}

interface DocContent {
  id: string;
  title: string;
  category: string;
  status: string;
  content: string;
}

const STATUS_COLORS: Record<string, string> = {
  "下書き": "bg-gray-100 text-gray-600",
  "レビュー中": "bg-yellow-100 text-yellow-700",
  "確定": "bg-green-100 text-green-700",
};

const CATEGORY_COLORS: Record<string, string> = {
  "計画": "bg-blue-100 text-blue-700",
  "設計": "bg-purple-100 text-purple-700",
  "要件定義": "bg-green-100 text-green-700",
  "議事録": "bg-yellow-100 text-yellow-700",
  "メモ": "bg-gray-100 text-gray-600",
};

interface Props {
  notionTag?: string;
}

export function DocumentsTab({ notionTag }: Props) {
  const [docs, setDocs] = useState<DocMeta[]>([]);
  const [selected, setSelected] = useState<DocContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [creatingDoc, setCreatingDoc] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocCategory, setNewDocCategory] = useState(notionTag || "メモ");

  const loadDocs = useCallback(async () => {
    try {
      const r = await fetch("/api/docs");
      let data: DocMeta[] = await r.json();
      if (notionTag) {
        data = data.filter(d => d.category === notionTag);
      }
      setDocs(data);
      return data;
    } catch {
      return [];
    }
  }, [notionTag]);

  useEffect(() => {
    loadDocs().then((data) => {
      if (data.length > 0) loadDoc(data[0].id);
    }).finally(() => setLoading(false));
  }, [loadDocs]);

  const loadDoc = async (id: string) => {
    try {
      const r = await fetch(`/api/docs?id=${id}`);
      const data = await r.json();
      setSelected(data);
      setEditing(false);
    } catch {}
  };

  const saveDoc = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await fetch("/api/docs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id, content: editContent }),
      });
      setSelected({ ...selected, content: editContent });
      setEditing(false);
    } catch {
      alert("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const createNewDoc = async () => {
    if (!newDocTitle.trim()) return;
    setSaving(true);
    try {
      const r = await fetch("/api/docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newDocTitle.trim(), category: newDocCategory }),
      });
      const { id } = await r.json();
      setCreatingDoc(false);
      setNewDocTitle("");
      await loadDocs();
      loadDoc(id);
    } catch {
      alert("作成に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("このドキュメントを削除しますか?")) return;
    try {
      await fetch("/api/docs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, archive: false }),
      });
      await loadDocs();
      if (selected?.id === id) setSelected(null);
    } catch {
      alert("削除に失敗しました");
    }
  };

  if (loading) return <div className="text-gray-400 text-sm py-8">読み込み中...</div>;

  return (
    <div className="flex gap-5">
      {/* Sidebar */}
      <div className="w-56 shrink-0">
        <div className="flex items-center justify-between mb-2 px-2">
          <p className="text-xs font-medium text-gray-400">ドキュメント</p>
          <span className="text-[10px] text-gray-400">{docs.length}件</span>
        </div>
        <div className="space-y-0.5">
          {docs.map((doc) => (
            <div key={doc.id} className="relative group">
              <button
                onClick={() => loadDoc(doc.id)}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-sm transition-colors ${
                  selected?.id === doc.id ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <p className="truncate pr-8 text-xs">{doc.title}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  {doc.category && <span className={`text-[8px] px-1 py-0.5 rounded ${CATEGORY_COLORS[doc.category] || "bg-gray-100 text-gray-500"}`}>{doc.category}</span>}
                </div>
              </button>
              <button onClick={() => handleDelete(doc.id)}
                className="absolute top-2 right-1.5 p-0.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-[9px]">
                x
              </button>
            </div>
          ))}

          {creatingDoc ? (
            <div className="px-2 py-2 space-y-1.5">
              <input autoFocus value={newDocTitle} onChange={(e) => setNewDocTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") createNewDoc(); if (e.key === "Escape") setCreatingDoc(false); }}
                placeholder="ドキュメント名..."
                className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              <select value={newDocCategory} onChange={(e) => setNewDocCategory(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded px-2 py-1">
                {["計画", "設計", "要件定義", "議事録", "メモ"].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="flex gap-1">
                <button onClick={createNewDoc} disabled={saving} className="text-[10px] px-2 py-0.5 bg-blue-500 text-white rounded hover:bg-blue-600">{saving ? "..." : "作成"}</button>
                <button onClick={() => setCreatingDoc(false)} className="text-[10px] px-2 py-0.5 bg-gray-200 text-gray-600 rounded">取消</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setCreatingDoc(true)} className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-gray-400 hover:bg-gray-50 hover:text-blue-600">
              + 新規ドキュメント
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {selected ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {selected.category && <Badge className={`text-xs ${CATEGORY_COLORS[selected.category] || ""}`}>{selected.category}</Badge>}
                  {selected.status && <Badge className={`text-xs ${STATUS_COLORS[selected.status] || ""}`}>{selected.status}</Badge>}
                </div>
                {!editing ? (
                  <Button onClick={() => { setEditContent(selected.content); setEditing(true); }} variant="outline" size="sm" className="text-xs">編集</Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={saveDoc} size="sm" className="text-xs" disabled={saving}>{saving ? "保存中..." : "保存"}</Button>
                    <Button onClick={() => setEditing(false)} variant="outline" size="sm" className="text-xs">キャンセル</Button>
                  </div>
                )}
              </div>
              {editing ? (
                <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-[50vh] text-sm font-mono border border-gray-200 rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
              ) : (
                <article className="prose prose-sm prose-gray max-w-none">
                  <Markdown>{selected.content}</Markdown>
                </article>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-12 text-gray-400 text-sm">
            {docs.length === 0 ? "ドキュメントがありません。「+ 新規ドキュメント」で作成してください" : "ドキュメントを選択してください"}
          </div>
        )}
      </div>
    </div>
  );
}
