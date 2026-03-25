"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DocsPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/projects"); }, [router]);
  return (
    <div className="p-8 text-gray-400 text-sm">プロジェクトページにリダイレクト中...</div>
  );
}
