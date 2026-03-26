"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { listDiagramsV2, createDiagramV2, updateDiagramV2, deleteDiagramV2 } from "@/lib/api-v2";
import type { DiagramV2 } from "@/lib/api-v2";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Save, Maximize2, X } from "lucide-react";
import { RefreshButton } from "@/components/ui/refresh-button";

interface Props {
  projectId: string;
}

export function DiagramsTab({ projectId }: Props) {
  const [diagrams, setDiagrams] = useState<DiagramV2[]>([]);
  const [selected, setSelected] = useState<DiagramV2 | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [direction, setDirection] = useState<"TB" | "LR">("LR");
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);
  const expandedPreviewRef = useRef<HTMLDivElement>(null);
  const mermaidRef = useRef<any>(null);
  const [expanded, setExpanded] = useState(false);
  const [zoom, setZoom] = useState(100);
  const svgCache = useRef<string>("");

  const load = useCallback(async () => {
    try {
      const data = await listDiagramsV2(projectId);
      setDiagrams(data);
      return data;
    } catch {
      return [];
    }
  }, [projectId]);

  useEffect(() => {
    load().then((data) => {
      if (data.length > 0) selectDiagram(data[0]);
    }).finally(() => setLoading(false));
  }, [load]);

  // Mermaid lazy import
  useEffect(() => {
    import("mermaid").then((mod) => {
      mermaidRef.current = mod.default;
      mermaidRef.current.initialize({
        startOnLoad: false,
        theme: "neutral",
        securityLevel: "loose",
      });
    });
  }, []);

  const selectDiagram = (d: DiagramV2) => {
    setSelected(d);
    setCode(d.mermaid_code);
  };

  // Apply direction override to mermaid code
  const applyDirection = useCallback((src: string, dir: "TB" | "LR"): string => {
    // Replace first line's direction: graph/flowchart TD/TB/LR/RL
    return src.replace(/^(graph|flowchart)\s+(TD|TB|LR|RL|BT)/m, `$1 ${dir}`);
  }, []);

  // Render mermaid preview
  useEffect(() => {
    if (!code || !mermaidRef.current) return;
    const render = async () => {
      try {
        const renderCode = applyDirection(code, direction);
        const id = `mermaid-${Date.now()}`;
        const { svg } = await mermaidRef.current.render(id, renderCode);
        svgCache.current = svg;
        if (previewRef.current) previewRef.current.innerHTML = svg;
      } catch (e: any) {
        const err = `<p class="text-xs text-red-500 p-4">${e.message || "レンダリングエラー"}</p>`;
        svgCache.current = err;
        if (previewRef.current) previewRef.current.innerHTML = err;
      }
    };
    const timer = setTimeout(render, 500);
    return () => clearTimeout(timer);
  }, [code, direction, applyDirection]);

  // 拡大時にcachedSVGを注入
  useEffect(() => {
    if (expanded && expandedPreviewRef.current && svgCache.current) {
      expandedPreviewRef.current.innerHTML = svgCache.current;
    }
    if (expanded) setZoom(100);
  }, [expanded]);

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const updated = await updateDiagramV2(selected.id, { mermaid_code: code });
      setSelected(updated);
      await load();
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
      const d = await createDiagramV2({ project_id: projectId, title: newTitle.trim() });
      setCreating(false);
      setNewTitle("");
      await load();
      selectDiagram(d);
    } catch {
      alert("作成に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("このダイアグラムを削除しますか?")) return;
    try {
      await deleteDiagramV2(id);
      if (selected?.id === id) { setSelected(null); setCode(""); }
      await load();
    } catch {
      alert("削除に失敗しました");
    }
  };

  if (loading) return <div className="text-gray-400 text-sm py-8">読み込み中...</div>;

  return (
    <div className="flex gap-4 h-[calc(100vh-280px)]">
      {/* Sidebar */}
      <div className="w-44 shrink-0 overflow-y-auto">
        <div className="flex items-center justify-between mb-2 px-2">
          <p className="text-xs font-medium text-gray-400">ダイアグラム</p>
          <RefreshButton onRefresh={load} />
        </div>
        <div className="space-y-0.5">
          {diagrams.map((d) => (
            <div key={d.id} className="relative group">
              <button
                onClick={() => selectDiagram(d)}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors ${
                  selected?.id === d.id ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {d.title}
              </button>
              <button onClick={() => handleDelete(d.id)}
                className="absolute top-2 right-1.5 p-0.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}

          {creating ? (
            <div className="px-2 py-2 space-y-1">
              <input autoFocus value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setCreating(false); }}
                placeholder="ダイアグラム名..."
                className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              <div className="flex gap-1">
                <button onClick={handleCreate} disabled={saving} className="text-[10px] px-2 py-0.5 bg-blue-500 text-white rounded">{saving ? "..." : "作成"}</button>
                <button onClick={() => setCreating(false)} className="text-[10px] px-2 py-0.5 bg-gray-200 text-gray-600 rounded">取消</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setCreating(true)} className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-gray-400 hover:bg-gray-50 hover:text-blue-600 flex items-center gap-1">
              <Plus className="w-3 h-3" /> 新規
            </button>
          )}
        </div>
      </div>

      {/* Editor + Preview */}
      <div className="flex-1 min-w-0 flex flex-col">
        {selected ? (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <h3 className="text-sm font-semibold text-gray-700">{selected.title}</h3>
              <Button onClick={handleSave} size="sm" className="text-xs gap-1.5" disabled={saving || code === selected.mermaid_code}>
                <Save className="w-3 h-3" /> {saving ? "保存中..." : "保存"}
              </Button>
            </div>

            <div className="grid grid-cols-[2fr_3fr] gap-4 flex-1 min-h-0">
              {/* Editor */}
              <div className="flex flex-col min-h-0">
                <p className="text-xs text-gray-400 mb-1.5 shrink-0">Mermaid コード</p>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full flex-1 text-xs font-mono border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  spellCheck={false}
                />
              </div>

              {/* Preview */}
              <div className="flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-1.5 shrink-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-400">プレビュー</p>
                    <div className="flex bg-gray-100 rounded-md p-0.5">
                      <button onClick={() => setDirection("TB")}
                        className={`px-2 py-0.5 text-[10px] font-medium rounded transition-colors ${direction === "TB" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"}`}>
                        縦
                      </button>
                      <button onClick={() => setDirection("LR")}
                        className={`px-2 py-0.5 text-[10px] font-medium rounded transition-colors ${direction === "LR" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"}`}>
                        横
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => setExpanded(true)}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    title="拡大表示"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <Card className="flex-1 overflow-auto">
                  <CardContent className="p-4 flex items-start justify-center min-h-full">
                    <div ref={previewRef} className="w-full" />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Expanded overlay */}
            {expanded && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in-fast" onClick={() => setExpanded(false)}>
                <div
                  className="bg-white rounded-2xl shadow-2xl w-[85vw] h-[80vh] flex flex-col animate-scale-in overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
                    <h3 className="text-sm font-semibold text-gray-700">{selected.title}</h3>
                    <div className="flex items-center gap-2">
                      {/* Zoom controls */}
                      <div className="flex items-center gap-1 bg-gray-100 rounded-lg px-1 py-0.5">
                        <button onClick={() => setZoom(z => Math.max(25, z - 25))}
                          className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700 rounded text-sm font-bold">-</button>
                        <span className="text-[10px] text-gray-500 w-10 text-center font-medium">{zoom}%</span>
                        <button onClick={() => setZoom(z => Math.min(200, z + 25))}
                          className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700 rounded text-sm font-bold">+</button>
                      </div>
                      <button onClick={() => setZoom(100)} className="text-[10px] text-gray-400 hover:text-gray-600 px-1.5 py-1 rounded hover:bg-gray-100">Reset</button>
                      <button onClick={() => setExpanded(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-auto p-6 flex items-start justify-center">
                    <div ref={expandedPreviewRef} className="w-full transition-transform duration-200 origin-top" style={{ transform: `scale(${zoom / 100})` }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400 text-sm">
            {diagrams.length === 0 ? "ダイアグラムがありません。「+ 新規」で作成してください" : "ダイアグラムを選択してください"}
          </div>
        )}
      </div>
    </div>
  );
}
