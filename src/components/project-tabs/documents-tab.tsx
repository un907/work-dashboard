"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FileText, Link2 } from "lucide-react";
import { RefreshButton } from "@/components/ui/refresh-button";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { listDocsV2, getDocV2, createDocV2, updateDocV2, deleteDocV2, searchDocsV2 } from "@/lib/api-v2";
import type { DocV2, Backlink } from "@/lib/api-v2";

const CATEGORY_COLORS: Record<string, string> = {
  "計画": "bg-blue-100 text-blue-700",
  "設計": "bg-purple-100 text-purple-700",
  "要件定義": "bg-green-100 text-green-700",
  "議事録": "bg-yellow-100 text-yellow-700",
  "メモ": "bg-gray-100 text-gray-600",
};

const STATUS_COLORS: Record<string, string> = {
  "draft": "bg-gray-100 text-gray-600",
  "published": "bg-green-100 text-green-700",
  "archived": "bg-red-100 text-red-600",
};
const STATUS_LABELS: Record<string, string> = {
  "draft": "下書き", "published": "確定", "archived": "アーカイブ",
};

interface Props {
  projectId: string;
  projectName: string;
}

export function DocumentsTab({ projectId, projectName }: Props) {
  const [docs, setDocs] = useState<DocV2[]>([]);
  const [selected, setSelected] = useState<DocV2 | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("メモ");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<DocV2[] | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await listDocsV2(projectId);
      setDocs(data);
      return data;
    } catch {
      return [];
    }
  }, [projectId]);

  useEffect(() => {
    load().then((data) => {
      if (data.length > 0) selectDoc(data[0].id);
    }).finally(() => setLoading(false));
  }, [load]);

  const selectDoc = async (id: string) => {
    try {
      const doc = await getDocV2(id);
      setSelected(doc);
      setEditing(false);
      setSearchResults(null);
    } catch {}
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await updateDocV2(selected.id, { content: editContent });
      setSelected({ ...selected, content: editContent });
      setEditing(false);
    } catch {
      alert("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setSaving(true);
    try {
      const doc = await createDocV2({ title: newTitle.trim(), project_id: projectId, category: newCategory });
      setCreating(false);
      setNewTitle("");
      await load();
      selectDoc(doc.id);
    } catch {
      alert("作成に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("このドキュメントを削除しますか?")) return;
    try {
      await deleteDocV2(id);
      await load();
      if (selected?.id === id) setSelected(null);
    } catch {
      alert("削除に失敗しました");
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) { setSearchResults(null); return; }
    const results = await searchDocsV2(searchQuery);
    setSearchResults(results);
  };

  if (loading) return <div className="text-gray-400 text-sm py-8">読み込み中...</div>;

  return (
    <div className="flex gap-5 h-[calc(100vh-280px)]">
      {/* Sidebar */}
      <div className="w-56 shrink-0 overflow-y-auto">
        {/* Search */}
        <div className="flex gap-1 mb-2 px-1">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); if (e.key === "Escape") { setSearchQuery(""); setSearchResults(null); } }}
            placeholder="検索..."
            className="text-xs h-7"
          />
          <button onClick={handleSearch} className="p-1 text-gray-400 hover:text-blue-600">
            <Search className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center justify-between mb-1 px-2">
          <p className="text-xs font-medium text-gray-400">
            {searchResults ? "検索結果" : "ドキュメント"}
          </p>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-gray-400">{(searchResults || docs).length}件</span>
            <RefreshButton onRefresh={load} />
          </div>
        </div>

        <div className="space-y-0.5">
          {(searchResults || docs).map((doc) => (
            <div key={doc.id} className="relative group">
              <button
                onClick={() => selectDoc(doc.id)}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-sm transition-colors ${
                  selected?.id === doc.id ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <p className="truncate pr-6 text-xs">{doc.title}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  {doc.category && (
                    <span className={`text-[8px] px-1 py-0.5 rounded ${CATEGORY_COLORS[doc.category] || "bg-gray-100 text-gray-500"}`}>
                      {doc.category}
                    </span>
                  )}
                  {doc.snippet && (
                    <span className="text-[8px] text-gray-400 truncate">{doc.snippet}</span>
                  )}
                </div>
              </button>
              <button onClick={() => handleDelete(doc.id)}
                className="absolute top-2 right-1.5 p-0.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-[9px]">
                x
              </button>
            </div>
          ))}

          {creating ? (
            <div className="px-2 py-2 space-y-1.5">
              <input autoFocus value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setCreating(false); }}
                placeholder="ドキュメント名..."
                className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded px-2 py-1">
                {["計画", "設計", "要件定義", "議事録", "メモ"].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="flex gap-1">
                <button onClick={handleCreate} disabled={saving} className="text-[10px] px-2 py-0.5 bg-blue-500 text-white rounded">{saving ? "..." : "作成"}</button>
                <button onClick={() => setCreating(false)} className="text-[10px] px-2 py-0.5 bg-gray-200 text-gray-600 rounded">取消</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setCreating(true)} className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-gray-400 hover:bg-gray-50 hover:text-blue-600">
              + 新規ドキュメント
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {selected ? (
          <Card className="flex flex-col flex-1 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2">
                {selected.category && <Badge className={`text-xs ${CATEGORY_COLORS[selected.category] || ""}`}>{selected.category}</Badge>}
                {selected.status && <Badge className={`text-xs ${STATUS_COLORS[selected.status] || ""}`}>{STATUS_LABELS[selected.status] || selected.status}</Badge>}
              </div>
              {!editing ? (
                <Button onClick={() => { setEditContent(selected.content || ""); setEditing(true); }} variant="outline" size="sm" className="text-xs">編集</Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleSave} size="sm" className="text-xs" disabled={saving}>{saving ? "保存中..." : "保存"}</Button>
                  <Button onClick={() => setEditing(false)} variant="outline" size="sm" className="text-xs">キャンセル</Button>
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                {editing ? (
                  <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-[50vh] text-sm font-mono border border-gray-200 rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
                ) : (
                  <>
                    <article className="prose prose-sm prose-gray max-w-none">
                      <Markdown
                        remarkPlugins={[remarkGfm]}
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
                              return <code className="block bg-gray-900 text-gray-100 rounded-lg p-4 text-xs font-mono overflow-x-auto whitespace-pre mb-3">{children}</code>;
                            }
                            return <code className="bg-gray-100 text-gray-800 text-xs px-1.5 py-0.5 rounded font-mono">{children}</code>;
                          },
                          pre: ({ children }) => <pre className="mb-3">{children}</pre>,
                          table: ({ children }) => <div className="overflow-x-auto mb-4 rounded-lg border border-gray-200"><table className="w-full text-sm border-collapse">{children}</table></div>,
                          thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
                          th: ({ children }) => <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600 border-b border-gray-200">{children}</th>,
                          td: ({ children }) => <td className="px-3 py-2 text-sm text-gray-700 border-b border-gray-100">{children}</td>,
                          hr: () => <hr className="my-6 border-gray-200" />,
                          blockquote: ({ children }) => <blockquote className="border-l-3 border-blue-300 bg-blue-50/50 pl-4 pr-3 py-2 my-3 text-sm text-gray-600 italic rounded-r-lg">{children}</blockquote>,
                          a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{children}</a>,
                          input: ({ checked, ...props }) => <input type="checkbox" checked={checked} readOnly className="mr-2 rounded border-gray-300" {...props} />,
                        }}
                      >
                        {renderWikiLinks(selected.content || "")}
                      </Markdown>
                    </article>

                    {/* Backlinks */}
                    {selected.backlinks && selected.backlinks.length > 0 && (
                      <div className="mt-8 pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-1.5 mb-3">
                          <Link2 className="w-3.5 h-3.5 text-gray-400" />
                          <p className="text-xs font-medium text-gray-400">バックリンク</p>
                        </div>
                        <div className="space-y-1.5">
                          {selected.backlinks.map((bl, i) => (
                            <div key={i} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-xs">
                              <Badge variant="outline" className="text-[9px] shrink-0">
                                {bl.source_type === "task" ? "タスク" : "ドキュメント"}
                              </Badge>
                              <span className="text-gray-700 font-medium">{bl.source_title}</span>
                              {bl.context && (
                                <span className="text-gray-400 truncate ml-auto">{bl.context.substring(0, 40)}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </Card>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-8 h-8 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">
              {docs.length === 0 ? "ドキュメントがありません" : "ドキュメントを選択してください"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/** Wiki-link記法 [[title]] を表示用に変換 */
function renderWikiLinks(content: string): string {
  return content.replace(/\[\[(?:(document|task|project|diagram):)?(.+?)\]\]/g, (_, type, title) => {
    const prefix = type ? `${type}: ` : "";
    return `**[${prefix}${title}](#)**`;
  });
}
