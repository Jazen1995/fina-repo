"use client";

import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
} from "recharts";
import { formatDate, formatPrice } from "@/lib/utils";

interface HistoricalPoint {
  date: string;
  close: number;
}

interface PriceChartProps {
  data: HistoricalPoint[];
  symbol: string;
  nameCn: string;
  color?: string;
  height?: number;
}

function CustomTooltip({
  active, payload, label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg px-3 py-2 text-sm shadow-2xl"
      style={{
        background: "var(--card-2)",
        border: "1px solid var(--border-2)",
        color: "var(--text)",
      }}
    >
      <p className="text-[11px] mb-1" style={{ color: "var(--text-dim)" }}>{label}</p>
      <p className="font-mono font-semibold">{formatPrice(payload[0].value)}</p>
    </div>
  );
}

export function PriceChart({
  data, symbol, nameCn, color = "var(--gold)", height = 200,
}: PriceChartProps) {
  if (!data.length) {
    return (
      <div
        className="rounded-xl p-4 flex items-center justify-center"
        style={{ height, background: "var(--card)", border: "1px solid var(--border)" }}
      >
        <p className="text-sm" style={{ color: "var(--text-dim)" }}>暂无数据</p>
      </div>
    );
  }

  const gradId = `cg-${symbol.replace(/[^a-zA-Z0-9]/g, "")}`;
  const prices  = data.map((d) => d.close);
  const min     = Math.min(...prices);
  const max     = Math.max(...prices);
  const pad     = (max - min) * 0.08;

  // Trend: compare first vs last to pick color
  const trend     = data.at(-1)!.close >= data[0].close;
  const lineColor = color === "auto" ? (trend ? "var(--up)" : "var(--down)") : color;

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: "var(--card)", border: "1px solid var(--border)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-mono px-1.5 py-0.5 rounded"
            style={{ background: "var(--surface)", color: "var(--text-dim)", border: "1px solid var(--border)" }}
          >
            {symbol}
          </span>
          <span className="text-sm font-medium" style={{ color: "var(--text)" }}>{nameCn}</span>
        </div>
        <span className="text-xs" style={{ color: "var(--text-dim)" }}>6个月</span>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="10%" stopColor={lineColor} stopOpacity={0.2} />
              <stop offset="90%" stopColor={lineColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
            strokeOpacity={0.6}
          />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fill: "var(--text-dim)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={45}
          />
          <YAxis
            domain={[min - pad, max + pad]}
            tick={{ fill: "var(--text-dim)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatPrice(v, 0)}
            width={56}
            orientation="right"
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="close"
            stroke={lineColor}
            strokeWidth={2}
            fill={`url(#${gradId})`}
            dot={false}
            activeDot={{ r: 4, fill: lineColor, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
