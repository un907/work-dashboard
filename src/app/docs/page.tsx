"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Markdown from "react-markdown";

interface DocMeta {
  slug: string;
  title: string;
  size: number;
}

interface DocContent {
  slug: string;
  title: string;
  content: string;
}

export default function DocsPage() {
  const [docs, setDocs] = useState<DocMeta[]>([]);
  const [selected, setSelected] = useState<DocContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/docs")
      .then((r) => r.json())
      .then((data) => {
        setDocs(data);
        // 最初のドキュメントを自動選択
        if (data.length > 0) {
          loadDoc(data[0].slug);
        }
      })
      .catch((e) => setError(e.message || "ドキュメントの取得に失敗しました"))
      .finally(() => setLoading(false));
  }, []);

  const loadDoc = async (slug: string) => {
    try {
      const r = await fetch(`/api/docs?file=${slug}.md`);
      const data = await r.json();
      setSelected(data);
    } catch {
      setError("ドキュメントの読み込みに失敗しました");
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-400 text-sm">読み込み中...</div>;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          <p className="font-medium">読み込みエラー</p>
          <p className="mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-3 py-1.5 bg-red-100 hover:bg-red-200 rounded text-xs font-medium transition-colors"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">ドキュメント</h1>
        <p className="text-sm text-gray-500 mt-1">
          プロジェクト計画・設計ドキュメント
        </p>
      </div>

      <div className="flex gap-6">
        {/* ドキュメント一覧 */}
        <div className="w-64 shrink-0">
          <div className="space-y-1.5">
            {docs.map((doc) => (
              <button
                key={doc.slug}
                onClick={() => loadDoc(doc.slug)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  selected?.slug === doc.slug
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <p className="truncate">{doc.title}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {Math.ceil(doc.size / 1000)}KB
                </p>
              </button>
            ))}
            {docs.length === 0 && (
              <p className="text-sm text-gray-400 px-3">
                ドキュメントなし
              </p>
            )}
          </div>
        </div>

        {/* ドキュメント内容 */}
        <div className="flex-1 min-w-0">
          {selected ? (
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center gap-2 mb-6">
                  <Badge className="bg-blue-50 text-blue-700 text-xs">
                    {selected.slug}
                  </Badge>
                </div>
                <article className="prose prose-sm prose-gray max-w-none">
                  <Markdown
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-base font-semibold text-gray-800 mt-6 mb-2">
                          {children}
                        </h3>
                      ),
                      p: ({ children }) => (
                        <p className="text-sm text-gray-700 leading-relaxed mb-3">
                          {children}
                        </p>
                      ),
                      ul: ({ children }) => (
                        <ul className="text-sm text-gray-700 space-y-1 mb-3 list-disc pl-5">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="text-sm text-gray-700 space-y-1 mb-3 list-decimal pl-5">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="leading-relaxed">{children}</li>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-gray-900">
                          {children}
                        </strong>
                      ),
                      code: ({ children, className }) => {
                        const isBlock = className?.includes("language-");
                        if (isBlock) {
                          return (
                            <code className="block bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs font-mono text-gray-800 overflow-x-auto whitespace-pre mb-3">
                              {children}
                            </code>
                          );
                        }
                        return (
                          <code className="bg-gray-100 text-gray-800 text-xs px-1.5 py-0.5 rounded font-mono">
                            {children}
                          </code>
                        );
                      },
                      pre: ({ children }) => (
                        <pre className="mb-3">{children}</pre>
                      ),
                      table: ({ children }) => (
                        <div className="overflow-x-auto mb-4">
                          <table className="w-full text-sm border-collapse">
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children }) => (
                        <thead className="bg-gray-50">{children}</thead>
                      ),
                      th: ({ children }) => (
                        <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600 border-b border-gray-200">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="px-3 py-2 text-sm text-gray-700 border-b border-gray-100">
                          {children}
                        </td>
                      ),
                      hr: () => (
                        <hr className="my-6 border-gray-200" />
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-3 border-blue-300 pl-4 my-3 text-sm text-gray-600 italic">
                          {children}
                        </blockquote>
                      ),
                    }}
                  >
                    {selected.content}
                  </Markdown>
                </article>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center text-gray-400 text-sm">
                左のリストからドキュメントを選択してください
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
