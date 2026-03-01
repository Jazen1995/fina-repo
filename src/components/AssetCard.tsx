"use client";

import { cn, formatPrice, formatPercent, formatChange } from "@/lib/utils";
import { ResponsiveContainer, AreaChart, Area } from "recharts";

export interface AssetCardProps {
  symbol: string;
  name: string;
  nameCn: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  currency?: string;
  unit?: string;
  sparkline?: { date: string; close: number }[];
  /** "hero" = spotlight card (wide, price larger); "default" = normal */
  variant?: "hero" | "default";
}

function Sparkline({
  data,
  color,
  id,
}: {
  data: { date: string; close: number }[];
  color: string;
  id: string;
}) {
  if (data.length < 3) return null;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="close"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#${id})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function AssetCard({
  symbol,
  name: _name,
  nameCn,
  price,
  change,
  changePercent,
  unit,
  currency = "USD",
  sparkline = [],
  variant = "default",
}: AssetCardProps) {
  const up = (changePercent ?? 0) >= 0;
  const color = up ? "var(--up)" : "var(--down)";
  const dimBg = up ? "var(--up-dim)" : "var(--down-dim)";
  const dimBorder = up ? "var(--up-border)" : "var(--down-border)";
  const displayUnit = unit ?? currency;
  const gradId = `sp-${symbol.replace(/[^a-zA-Z0-9]/g, "")}`;

  if (variant === "hero") {
    return (
      <div
        className="rounded-xl p-5 flex gap-6"
        style={{ background: "var(--card)", border: "1px solid var(--border-2)" }}
      >
        {/* Left: data */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <p className="text-xs font-mono mb-0.5" style={{ color: "var(--text-dim)" }}>{symbol}</p>
              <p className="text-lg font-semibold" style={{ color: "var(--text)" }}>{nameCn}</p>
            </div>
            <span
              className="text-[11px] px-1.5 py-0.5 rounded font-mono mt-0.5 flex-shrink-0"
              style={{ background: "var(--surface)", color: "var(--text-dim)", border: "1px solid var(--border)" }}
            >
              {displayUnit}
            </span>
          </div>

          <div>
            <p
              className="text-[2.6rem] font-bold font-mono leading-none tracking-tight mb-2"
              style={{ color: "var(--text)" }}
            >
              {price != null ? formatPrice(price) : "—"}
            </p>
            {/* Change badge */}
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-sm font-mono font-semibold"
                style={{ background: dimBg, color, border: `1px solid ${dimBorder}` }}
              >
                <span style={{ fontSize: 10 }}>{up ? "▲" : "▼"}</span>
                {formatChange(change)}
              </span>
              <span className="text-sm font-mono" style={{ color }}>{formatPercent(changePercent)}</span>
            </div>
          </div>
        </div>

        {/* Right: sparkline */}
        {sparkline.length > 3 && (
          <div className="w-40 flex-shrink-0 h-24 self-center">
            <Sparkline data={sparkline} color={color} id={gradId} />
          </div>
        )}
      </div>
    );
  }

  // ── default variant ────────────────────────────────────────────────────────
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-3 transition-colors"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-mono" style={{ color: "var(--text-dim)" }}>{symbol}</p>
          <p className="text-sm font-medium mt-0.5" style={{ color: "var(--text)" }}>{nameCn}</p>
        </div>
        <span
          className="text-[11px] px-1.5 py-0.5 rounded font-mono"
          style={{ background: "var(--surface)", color: "var(--text-dim)", border: "1px solid var(--border)" }}
        >
          {displayUnit}
        </span>
      </div>

      {/* Price */}
      <div>
        <p
          className="text-2xl font-bold font-mono leading-none tracking-tight"
          style={{ color: "var(--text)" }}
        >
          {price != null ? formatPrice(price) : "—"}
        </p>
        <div className="flex items-center gap-1.5 mt-2">
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-semibold"
            style={{ background: dimBg, color, border: `1px solid ${dimBorder}` }}
          >
            <span style={{ fontSize: 9 }}>{up ? "▲" : "▼"}</span>
            {formatChange(change)}
          </span>
          <span className="text-xs font-mono" style={{ color }}>{formatPercent(changePercent)}</span>
        </div>
      </div>

      {/* Sparkline */}
      {sparkline.length > 3 && (
        <div className="h-10 -mx-1">
          <Sparkline data={sparkline} color={color} id={gradId} />
        </div>
      )}
    </div>
  );
}
