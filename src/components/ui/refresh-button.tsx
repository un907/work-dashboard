"use client";

import { useState, useCallback } from "react";
import { RefreshCw } from "lucide-react";

interface Props {
  onRefresh: () => Promise<any> | any;
  className?: string;
}

export function RefreshButton({ onRefresh, className = "" }: Props) {
  const [spinning, setSpinning] = useState(false);

  const handleClick = useCallback(async () => {
    setSpinning(true);
    try {
      await onRefresh();
    } finally {
      // 最低300msスピンさせる
      setTimeout(() => setSpinning(false), 300);
    }
  }, [onRefresh]);

  return (
    <button
      onClick={handleClick}
      disabled={spinning}
      className={`p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 ${className}`}
      title="更新"
    >
      <RefreshCw className={`w-3.5 h-3.5 ${spinning ? "animate-spin" : ""}`} />
    </button>
  );
}
