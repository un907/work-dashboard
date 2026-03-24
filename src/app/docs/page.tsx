"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Markdown from "react-markdown";
import { useAuth } from "@/components/auth-provider";

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

function formatDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function DocsPage() {
  const { user } = useAuth();
  const [docs, setDocs] = useState<DocMeta[]>([]);
  const [selected, setSelected] = useState<DocContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);

  const [creatingDoc, setCreatingDoc] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocCategory, setNewDocCategory] = useState("メモ");

  const loadDocs = useCallback(async () => {
    try {
      const r = await fetch("/api/docs");
      const data = await r.json();
      setDocs(data);
      return data;
    } catch (e: any) {
      setError(e.message);
      return [];
    }
  }, []);

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
    } catch {
      setError("ドキュメントの読み込みに失敗しました");
    }
  };

  const startEditing = () => {
    if (!selected) return;
    setEditContent(selected.content);
    setEditing(true);
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

  const handleArchive = async (id: string) => {
    try {
      await fetch("/api/docs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, archive: true }),
      });
      await loadDocs();
      if (selected?.id === id) setSelected(null);
    } catch {
      alert("アーカイブに失敗しました");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("このドキュメントを完全に削除しますか?")) return;
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

  if (loading) return <div className="p-8 text-gray-400 text-sm">読み込み中...</div>;

  if (error) return (
    <div className="p-8">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
        <p className="font-medium">エラー</p>
        <p className="mt-1">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-3 px-3 py-1.5 bg-red-100 hover:bg-red-200 rounded text-xs font-medium">再読み込み</button>
      </div>
    </div>
  );

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ドキュメント</h1>
          <p className="text-sm text-gray-500 mt-1">Notion連携 - プロジェクト計画・設計ドキュメント</p>
        </div>
        {selected && !editing && (
          <Button onClick={startEditing} variant="outline" size="sm" className="text-xs">編集</Button>
        )}
        {editing && (
          <div className="flex gap-2">
            <Button onClick={saveDoc} size="sm" className="text-xs" disabled={saving}>{saving ? "保存中..." : "保存"}</Button>
            <Button onClick={() => setEditing(false)} variant="outline" size="sm" className="text-xs">キャンセル</Button>
          </div>
        )}
      </div>

      <div className="flex gap-6">
        {/* ドキュメント一覧 */}
        <div className="w-64 shrink-0">
          <p className="text-xs font-medium text-gray-400 mb-2 px-3">ドキュメント</p>
          <div className="space-y-1">
            {docs.map((doc) => (
              <div key={doc.id} className="relative group">
                <button
                  onClick={() => loadDoc(doc.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    selected?.id === doc.id ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <p className="truncate pr-12">{doc.title}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {doc.category && <span className={`text-[9px] px-1.5 py-0.5 rounded ${CATEGORY_COLORS[doc.category] || "bg-gray-100 text-gray-500"}`}>{doc.category}</span>}
                    <span className="text-[9px] text-gray-400">{formatDate(doc.lastEdited)}</span>
                  </div>
                </button>
                <div className="absolute top-2 right-2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleArchive(doc.id)} className="p-1 text-gray-300 hover:text-amber-500 text-[9px]" title="アーカイブ">保存</button>
                  <button onClick={() => handleDelete(doc.id)} className="p-1 text-gray-300 hover:text-red-500 text-[9px]" title="削除">削除</button>
                </div>
              </div>
            ))}

            {creatingDoc ? (
              <div className="px-2 py-2 space-y-1.5">
                <input
                  autoFocus
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") createNewDoc(); if (e.key === "Escape") setCreatingDoc(false); }}
                  placeholder="ドキュメント名..."
                  className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <select value={newDocCategory} onChange={(e) => setNewDocCategory(e.target.value)} className="w-full text-xs border border-gray-200 rounded px-2 py-1">
                  {["計画", "設計", "要件定義", "議事録", "メモ"].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="flex gap-1">
                  <button onClick={createNewDoc} disabled={saving} className="text-[10px] px-2 py-0.5 bg-blue-500 text-white rounded hover:bg-blue-600">{saving ? "..." : "作成"}</button>
                  <button onClick={() => setCreatingDoc(false)} className="text-[10px] px-2 py-0.5 bg-gray-200 text-gray-600 rounded">取消</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setCreatingDoc(true)} className="w-full text-left px-3 py-2 rounded-lg text-xs text-gray-400 hover:bg-gray-50 hover:text-blue-600">
                + 新規ドキュメント
              </button>
            )}
          </div>
        </div>

        {/* ドキュメント内容 */}
        <div className="flex-1 min-w-0">
          {selected ? (
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center gap-2 mb-6">
                  {selected.category && <Badge className={`text-xs ${CATEGORY_COLORS[selected.category] || ""}`}>{selected.category}</Badge>}
                  {selected.status && <Badge className={`text-xs ${STATUS_COLORS[selected.status] || ""}`}>{selected.status}</Badge>}
                </div>

                {editing ? (
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-[70vh] text-sm font-mono border border-gray-200 rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  />
                ) : (
                  <article className="prose prose-sm prose-gray max-w-none">
                    <Markdown
                      components={{
                        h1: ({ children }) => <h1 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-base font-semibold text-gray-800 mt-6 mb-2">{children}</h3>,
                        p: ({ children }) => <p className="text-sm text-gray-700 leading-relaxed mb-3">{children}</p>,
                        ul: ({ children }) => <ul className="text-sm text-gray-700 space-y-1 mb-3 list-disc pl-5">{children}</ul>,
                        ol: ({ children }) => <ol className="text-sm text-gray-700 space-y-1 mb-3 list-decimal pl-5">{children}</ol>,
                        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                        code: ({ children, className }) => {
                          if (className?.includes("language-")) {
                            return <code className="block bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs font-mono text-gray-800 overflow-x-auto whitespace-pre mb-3">{children}</code>;
                          }
                          return <code className="bg-gray-100 text-gray-800 text-xs px-1.5 py-0.5 rounded font-mono">{children}</code>;
                        },
                        pre: ({ children }) => <pre className="mb-3">{children}</pre>,
                        table: ({ children }) => <div className="overflow-x-auto mb-4"><table className="w-full text-sm border-collapse">{children}</table></div>,
                        thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
                        th: ({ children }) => <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600 border-b border-gray-200">{children}</th>,
                        td: ({ children }) => <td className="px-3 py-2 text-sm text-gray-700 border-b border-gray-100">{children}</td>,
                        hr: () => <hr className="my-6 border-gray-200" />,
                        blockquote: ({ children }) => <blockquote className="border-l-3 border-blue-300 pl-4 my-3 text-sm text-gray-600 italic">{children}</blockquote>,
                      }}
                    >
                      {selected.content}
                    </Markdown>
                  </article>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center text-gray-400 text-sm">
                ドキュメントを選択してください
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
