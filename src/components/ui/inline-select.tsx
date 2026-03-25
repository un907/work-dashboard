"use client";

import { useState, useRef, useEffect } from "react";

interface Option {
  value: string;
  label: string;
  color?: string;
}

interface Props {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  className?: string;
}

export function InlineSelect({ value, options, onChange, className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const current = options.find(o => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`select-none cursor-pointer transition-colors ${className}`}
      >
        {current?.label || value}
      </button>
      {open && (
        <div className="absolute z-50 mt-1 py-1 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[100px] animate-fade-in-fast">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-3 py-1.5 text-xs transition-colors flex items-center gap-2 ${
                opt.value === value
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {opt.color && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${opt.color}`} />}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
