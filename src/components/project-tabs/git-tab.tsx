"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, GitCommit, GitPullRequest, CircleDot } from "lucide-react";
import { RefreshButton } from "@/components/ui/refresh-button";

interface Props {
  gitUrl?: string;
}

interface Commit {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
}

interface PR {
  number: number;
  title: string;
  state: string;
  author: string;
  createdAt: string;
  url: string;
}

interface Issue {
  number: number;
  title: string;
  state: string;
  labels: string[];
  createdAt: string;
  url: string;
}

function parseGitUrl(url: string): { owner: string; repo: string } | null {
  const m = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!m) return null;
  return { owner: m[1], repo: m[2].replace(/\.git$/, "") };
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}分前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}日前`;
  return new Date(dateStr).toLocaleDateString("ja-JP");
}

type Tab = "commits" | "prs" | "issues";

export function GitTab({ gitUrl }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("commits");
  const [commits, setCommits] = useState<Commit[]>([]);
  const [prs, setPrs] = useState<PR[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const parsed = useMemo(() => gitUrl ? parseGitUrl(gitUrl) : null, [gitUrl]);

  const loadData = useCallback(async () => {
    if (!parsed) { setLoading(false); return; }
    const { owner, repo } = parsed;
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=20`)
          .then(r => r.ok ? r.json() : [])
          .then((data: any[]) => setCommits(data.map(c => ({
            sha: c.sha,
            message: c.commit.message.split("\n")[0],
            author: c.commit.author?.name || c.author?.login || "unknown",
            date: c.commit.author?.date || "",
            url: c.html_url,
          })))),
        fetch(`https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=10`)
          .then(r => r.ok ? r.json() : [])
          .then((data: any[]) => setPrs(data.map(p => ({
            number: p.number,
            title: p.title,
            state: p.state,
            author: p.user?.login || "unknown",
            createdAt: p.created_at,
            url: p.html_url,
          })))),
        fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=10`)
          .then(r => r.ok ? r.json() : [])
          .then((data: any[]) => setIssues(data.filter((i: any) => !i.pull_request).map((i: any) => ({
            number: i.number,
            title: i.title,
            state: i.state,
            labels: i.labels?.map((l: any) => l.name) || [],
            createdAt: i.created_at,
            url: i.html_url,
          })))),
      ]);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [parsed]);

  useEffect(() => { loadData(); }, [loadData]);

  if (!gitUrl || !parsed) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-gray-400 mb-2">GitHub URLが設定されていません</p>
        <p className="text-xs text-gray-400">概要タブでGitHub URLを設定してください</p>
      </div>
    );
  }

  if (loading) return <div className="text-gray-400 text-sm py-8">GitHub データを取得中...</div>;
  if (error) return <div className="text-red-500 text-sm py-8">エラー: {error}</div>;

  const tabs: { key: Tab; label: string; count: number; icon: React.ReactNode }[] = [
    { key: "commits", label: "コミット", count: commits.length, icon: <GitCommit className="w-3.5 h-3.5" /> },
    { key: "prs", label: "PR", count: prs.length, icon: <GitPullRequest className="w-3.5 h-3.5" /> },
    { key: "issues", label: "Issue", count: issues.length, icon: <CircleDot className="w-3.5 h-3.5" /> },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === t.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}>
              {t.icon} {t.label}
              <span className="text-[10px] text-gray-400 ml-0.5">{t.count}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <RefreshButton onRefresh={loadData} />
          <a href={gitUrl} target="_blank" rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-blue-600 flex items-center gap-1">
            <ExternalLink className="w-3 h-3" /> GitHub
          </a>
        </div>
      </div>

      {activeTab === "commits" && (
        <div className="space-y-0.5">
          {commits.map((c) => (
            <a key={c.sha} href={c.url} target="_blank" rel="noopener noreferrer"
              className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
              <code className="text-[10px] text-blue-600 font-mono mt-0.5 shrink-0">{c.sha.substring(0, 7)}</code>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate">{c.message}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{c.author} - {timeAgo(c.date)}</p>
              </div>
            </a>
          ))}
          {commits.length === 0 && <p className="text-sm text-gray-400 py-8 text-center">コミットがありません</p>}
        </div>
      )}

      {activeTab === "prs" && (
        <div className="space-y-0.5">
          {prs.map((p) => (
            <a key={p.number} href={p.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
              <GitPullRequest className={`w-4 h-4 shrink-0 ${p.state === "open" ? "text-green-500" : p.state === "closed" ? "text-purple-500" : "text-red-500"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate">
                  <span className="text-gray-400 mr-1">#{p.number}</span>{p.title}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">{p.author} - {timeAgo(p.createdAt)}</p>
              </div>
              <Badge variant="outline" className={`text-[10px] shrink-0 ${p.state === "open" ? "text-green-600 border-green-200" : "text-gray-500"}`}>
                {p.state}
              </Badge>
            </a>
          ))}
          {prs.length === 0 && <p className="text-sm text-gray-400 py-8 text-center">PRがありません</p>}
        </div>
      )}

      {activeTab === "issues" && (
        <div className="space-y-0.5">
          {issues.map((i) => (
            <a key={i.number} href={i.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
              <CircleDot className={`w-4 h-4 shrink-0 ${i.state === "open" ? "text-green-500" : "text-gray-400"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate">
                  <span className="text-gray-400 mr-1">#{i.number}</span>{i.title}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  {i.labels.map((l) => (
                    <span key={l} className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">{l}</span>
                  ))}
                  <span className="text-[10px] text-gray-400">{timeAgo(i.createdAt)}</span>
                </div>
              </div>
            </a>
          ))}
          {issues.length === 0 && <p className="text-sm text-gray-400 py-8 text-center">Issueがありません</p>}
        </div>
      )}
    </div>
  );
}
