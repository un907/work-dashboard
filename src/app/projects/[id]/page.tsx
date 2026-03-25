"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProject } from "@/lib/sheets";
import type { Project } from "@/lib/sheets";
import { ArrowLeft, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OverviewTab } from "@/components/project-tabs/overview-tab";
import { DocumentsTab } from "@/components/project-tabs/documents-tab";
import { DiagramsTab } from "@/components/project-tabs/diagrams-tab";
import { GitTab } from "@/components/project-tabs/git-tab";
import { TasksTab } from "@/components/project-tabs/tasks-tab";

const TABS = ["概要", "ドキュメント", "フロー図", "Git", "タスク"] as const;
type Tab = typeof TABS[number];

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("概要");
  const [contentKey, setContentKey] = useState(0);

  // Tab indicator
  const tabsRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useEffect(() => {
    getProject(id)
      .then(setProject)
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  }, [id]);

  const updateIndicator = useCallback(() => {
    if (!tabsRef.current) return;
    const activeEl = tabsRef.current.querySelector("[data-active='true']") as HTMLElement;
    if (activeEl) {
      const containerRect = tabsRef.current.getBoundingClientRect();
      const elRect = activeEl.getBoundingClientRect();
      setIndicator({
        left: elRect.left - containerRect.left,
        width: elRect.width,
      });
    }
  }, []);

  useEffect(() => {
    updateIndicator();
  }, [activeTab, loading, updateIndicator]);

  // Update indicator on window resize
  useEffect(() => {
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [updateIndicator]);

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    setContentKey((k) => k + 1);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-6 w-32 bg-gray-100 rounded" />
          <div className="h-10 w-64 bg-gray-100 rounded-lg" />
          <div className="flex gap-4">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-8 w-20 bg-gray-50 rounded" />)}
          </div>
          <div className="h-64 bg-gray-50 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 animate-fade-in">
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <FolderKanban className="w-7 h-7 text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-4">プロジェクトが見つかりません</p>
          <Button onClick={() => router.push("/projects")} variant="outline" size="sm" className="text-xs">
            一覧に戻る
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/projects")}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-4 transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          プロジェクト一覧
        </button>

        <div className="flex items-center gap-3">
          {project.icon ? (
            <span className="text-3xl leading-none">{project.icon}</span>
          ) : (
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${project.color || "#6366f1"}, ${project.color || "#6366f1"}cc)` }}>
              <FolderKanban className="w-5 h-5 text-white" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{project.name}</h1>
            {project.description && (
              <p className="text-sm text-gray-500 mt-0.5">{project.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs with sliding indicator */}
      <div className="relative mb-6">
        <div ref={tabsRef} className="flex gap-0 border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab}
              data-active={activeTab === tab}
              onClick={() => switchTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
                activeTab === tab
                  ? "text-gray-900"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab}
            </button>
          ))}
          {/* Sliding indicator */}
          <div
            className="tab-indicator absolute bottom-0 h-[2px] rounded-full"
            style={{
              left: indicator.left,
              width: indicator.width,
              background: `linear-gradient(90deg, ${project.color || "#3b82f6"}, ${project.color || "#3b82f6"}bb)`,
            }}
          />
        </div>
      </div>

      {/* Tab Content with fade transition */}
      <div key={contentKey} className="min-h-[400px] animate-fade-in-fast">
        {activeTab === "概要" && <OverviewTab project={project} onUpdate={setProject} />}
        {activeTab === "ドキュメント" && <DocumentsTab projectId={project.id} projectName={project.name} />}
        {activeTab === "フロー図" && <DiagramsTab projectId={project.id} />}
        {activeTab === "Git" && <GitTab gitUrl={project.gitUrl} />}
        {activeTab === "タスク" && <TasksTab projectId={project.id} projectName={project.name} />}
      </div>
    </div>
  );
}
