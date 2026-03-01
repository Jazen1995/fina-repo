import { formatPrice, formatPercent, formatChange } from "@/lib/utils";

interface StatsBarProps {
  price:             number | null;
  change?:           number | null;   // today's absolute change
  changePercent?:    number | null;   // today's % change
  historicalData:    { date: string; close: number }[];
  fiftyTwoWeekHigh?: number | null;
  fiftyTwoWeekLow?:  number | null;
}

function pctColor(v: number | null) {
  if (v == null) return "var(--text)";
  return v >= 0 ? "var(--up)" : "var(--down)";
}

function StatCell({
  label, value, color, badge,
}: {
  label: string;
  value: string;
  color?: string;
  badge?: string;   // small extra label beside value
}) {
  return (
    <div className="flex flex-col gap-1 min-w-[72px]">
      <span
        className="text-[10px] uppercase tracking-widest whitespace-nowrap"
        style={{ color: "var(--text-dim)" }}
      >
        {label}
      </span>
      <span className="text-sm font-mono font-semibold leading-none" style={{ color: color ?? "var(--text)" }}>
        {value}
        {badge && (
          <span className="ml-1 text-[10px] font-normal" style={{ color: "var(--text-dim)" }}>
            {badge}
          </span>
        )}
      </span>
    </div>
  );
}

/** Calculate % change from `historicalData[refDate..] → price` */
function calcPct(
  price: number,
  data: { date: string; close: number }[],
  refDateStr: string   // YYYY-MM-DD, find first point ≥ this date
): number | null {
  const entry = data.find((d) => d.date >= refDateStr);
  if (!entry) return null;
  // Edge case: entry is already "today" (same as current price)
  if (entry.close === price) return 0;
  return ((price - entry.close) / entry.close) * 100;
}

export function StatsBar({
  price, change, changePercent,
  historicalData, fiftyTwoWeekHigh, fiftyTwoWeekLow,
}: StatsBarProps) {
  // ── Reference dates ───────────────────────────────────────────────────────
  const now         = new Date();
  const yyyy        = now.getFullYear();
  const mm          = String(now.getMonth() + 1).padStart(2, "0");
  const ytdRef      = `${yyyy}-01-01`;                       // Jan 1 current year
  const mtdRef      = `${yyyy}-${mm}-01`;                    // 1st of current month

  // ── Derived metrics ───────────────────────────────────────────────────────
  const ytdPct  = price != null ? calcPct(price, historicalData, ytdRef)  : null;
  const mtdPct  = price != null ? calcPct(price, historicalData, mtdRef)  : null;

  // ── 52W range bar ─────────────────────────────────────────────────────────
  const rangePct =
    fiftyTwoWeekHigh != null && fiftyTwoWeekLow != null && price != null &&
    fiftyTwoWeekHigh !== fiftyTwoWeekLow
      ? Math.max(0, Math.min(100,
          ((price - fiftyTwoWeekLow) / (fiftyTwoWeekHigh - fiftyTwoWeekLow)) * 100
        ))
      : null;

  return (
    <div
      className="rounded-xl px-5 py-4"
      style={{ background: "var(--card)", border: "1px solid var(--border)" }}
    >
      {/* ── Row 1: Time-period performance ─────────────────────────────── */}
      <div className="flex flex-wrap gap-x-7 gap-y-3 pb-3.5" style={{ borderBottom: "1px solid var(--border)" }}>
        {/* Today */}
        <div className="flex flex-col gap-1 min-w-[72px]">
          <span className="text-[10px] uppercase tracking-widest" style={{ color: "var(--text-dim)" }}>
            今天
          </span>
          {changePercent != null ? (
            <div className="flex items-baseline gap-1.5">
              <span
                className="text-sm font-mono font-semibold leading-none"
                style={{ color: pctColor(changePercent) }}
              >
                {formatPercent(changePercent)}
              </span>
              {change != null && (
                <span className="text-xs font-mono" style={{ color: "var(--text-dim)" }}>
                  {formatChange(change)}
                </span>
              )}
            </div>
          ) : (
            <span className="text-sm font-mono font-semibold" style={{ color: "var(--text)" }}>—</span>
          )}
        </div>

        {/* MTD */}
        <StatCell
          label="本月至今"
          value={mtdPct != null ? formatPercent(mtdPct) : "—"}
          color={pctColor(mtdPct)}
          badge={mtdPct != null ? mtdRef.slice(0, 7) : undefined}
        />

        {/* YTD */}
        <StatCell
          label="年初至今"
          value={ytdPct != null ? formatPercent(ytdPct) : "—"}
          color={pctColor(ytdPct)}
          badge={ytdPct != null ? `${yyyy}` : undefined}
        />
      </div>

      {/* ── Row 2: 52W range ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-x-7 gap-y-3 pt-3.5">
        <StatCell
          label="52周高"
          value={fiftyTwoWeekHigh != null ? formatPrice(fiftyTwoWeekHigh) : "—"}
          color="var(--up)"
        />
        <StatCell
          label="52周低"
          value={fiftyTwoWeekLow != null ? formatPrice(fiftyTwoWeekLow) : "—"}
          color="var(--down)"
        />

        {/* Range bar */}
        {rangePct != null && (
          <div className="flex flex-1 items-center gap-2.5 min-w-[120px]">
            <span className="text-xs font-mono" style={{ color: "var(--down)" }}>
              {formatPrice(fiftyTwoWeekLow, 0)}
            </span>
            <div className="relative flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border-2)" }}>
              <div
                className="absolute left-0 top-0 h-full rounded-full"
                style={{
                  width: `${rangePct}%`,
                  background: "linear-gradient(to right, var(--down), var(--up))",
                }}
              />
              {/* Cursor dot */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-2"
                style={{
                  left: `calc(${rangePct}% - 4px)`,
                  background: "var(--card)",
                  borderColor: rangePct > 50 ? "var(--up)" : "var(--down)",
                }}
              />
            </div>
            <span className="text-xs font-mono" style={{ color: "var(--up)" }}>
              {formatPrice(fiftyTwoWeekHigh, 0)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
