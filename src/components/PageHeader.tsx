"use client";

import { RefreshCw } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
      setLastRefresh(new Date());
    });
  };

  return (
    <div className="flex items-center justify-between mb-6 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
      <div>
        <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--gold)" }}>{title}</h1>
        {subtitle && (
          <p className="text-xs mt-0.5" style={{ color: "var(--text-dim)" }}>{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {lastRefresh && (
          <span className="text-xs" style={{ color: "var(--text-dim)" }}>
            {lastRefresh.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} 更新
          </span>
        )}
        <button
          onClick={handleRefresh}
          disabled={isPending}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-opacity disabled:opacity-40"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--text-dim)",
          }}
        >
          <RefreshCw size={12} className={isPending ? "animate-spin" : ""} />
          刷新
        </button>
      </div>
    </div>
  );
}
