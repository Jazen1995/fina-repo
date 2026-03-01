import { getQuotes, getHistorical } from "@/lib/yahoo-finance";
import {
  COMMODITY_PRECIOUS, COMMODITY_ENERGY, COMMODITY_METALS,
  ALL_COMMODITIES, type SymbolConfig,
} from "@/lib/symbols";
import { AssetCard } from "@/components/AssetCard";
import { PriceChart } from "@/components/PriceChart";
import { StatsBar } from "@/components/StatsBar";
import { PageHeader } from "@/components/PageHeader";
import type { QuoteData } from "@/lib/yahoo-finance";

export const dynamic = "force-dynamic";

// ── helpers ────────────────────────────────────────────────────────────────

type HistMap = Record<string, { date: string; close: number }[]>;

function GroupSection({
  label,
  items,
  quoteMap,
  histMap,
}: {
  label: string;
  items: SymbolConfig[];
  quoteMap: Map<string, QuoteData>;
  histMap: HistMap;
}) {
  return (
    <div>
      <div className="section-label">{label}</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map((item) => {
          const q = quoteMap.get(item.symbol);
          const sparkline = histMap[item.symbol]?.slice(-30) ?? [];
          return (
            <AssetCard
              key={item.symbol}
              symbol={item.symbol}
              name={item.name}
              nameCn={item.nameCn}
              price={q?.price ?? null}
              change={q?.change ?? null}
              changePercent={q?.changePercent ?? null}
              currency={q?.currency ?? "USD"}
              unit={item.unit}
              sparkline={sparkline}
            />
          );
        })}
      </div>
    </div>
  );
}

// ── page ────────────────────────────────────────────────────────────────────

export default async function PreciousMetalsPage() {
  const symbols = ALL_COMMODITIES.map((c) => c.symbol);

  // Fetch quotes + 6mo history in parallel
  const [quotes, ...histories] = await Promise.all([
    getQuotes(symbols),
    ...symbols.map((s) => getHistorical(s, "6mo")),
  ]);

  const quoteMap = new Map(quotes.map((q) => [q.symbol, q]));
  const histMap: HistMap = Object.fromEntries(
    symbols.map((s, i) => [s, histories[i]])
  );

  const goldQ   = quoteMap.get("GC=F");
  const goldH   = histMap["GC=F"] ?? [];
  const crudeSym = "CL=F";
  const crudeQ  = quoteMap.get(crudeSym);
  const crudeH  = histMap[crudeSym] ?? [];

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="大宗商品"
        subtitle="贵金属 · 能源 · 基本金属  |  期货行情，非实时"
      />

      {/* ── Spotlight: 黄金 ─────────────────────────────────────────────── */}
      <AssetCard
        symbol="GC=F"
        name="Gold"
        nameCn="黄金"
        price={goldQ?.price ?? null}
        change={goldQ?.change ?? null}
        changePercent={goldQ?.changePercent ?? null}
        currency={goldQ?.currency ?? "USD"}
        unit="USD/oz"
        sparkline={goldH.slice(-60)}
        variant="hero"
      />

      {/* ── 贵金属 ────────────────────────────────────────────────────────── */}
      <GroupSection
        label="贵金属"
        items={COMMODITY_PRECIOUS.filter((c) => c.symbol !== "GC=F")}
        quoteMap={quoteMap}
        histMap={histMap}
      />

      {/* ── 能源 ──────────────────────────────────────────────────────────── */}
      <GroupSection
        label="能源"
        items={COMMODITY_ENERGY}
        quoteMap={quoteMap}
        histMap={histMap}
      />

      {/* ── 基本金属 ──────────────────────────────────────────────────────── */}
      <GroupSection
        label="基本金属"
        items={COMMODITY_METALS}
        quoteMap={quoteMap}
        histMap={histMap}
      />

      {/* ── 走势图 ────────────────────────────────────────────────────────── */}
      <div className="section-label">走势图</div>

      {/* Gold full-width */}
      <div className="mb-3">
        <PriceChart data={goldH} symbol="GC=F" nameCn="黄金" color="#C8941A" height={220} />
        <div className="mt-2">
          <StatsBar
            price={goldQ?.price ?? null}
            change={goldQ?.change ?? null}
            changePercent={goldQ?.changePercent ?? null}
            historicalData={goldH}
            fiftyTwoWeekHigh={goldQ?.fiftyTwoWeekHigh}
            fiftyTwoWeekLow={goldQ?.fiftyTwoWeekLow}
          />
        </div>
      </div>

      {/* WTI + Brent side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        {(["CL=F", "BZ=F"] as const).map((sym) => {
          const cfg = ALL_COMMODITIES.find((c) => c.symbol === sym)!;
          const q   = quoteMap.get(sym);
          const h   = histMap[sym] ?? [];
          return (
            <div key={sym}>
              <PriceChart data={h} symbol={sym} nameCn={cfg.nameCn} color={cfg.color} />
              <div className="mt-2">
                <StatsBar
                  price={q?.price ?? null}
                  change={q?.change ?? null}
                  changePercent={q?.changePercent ?? null}
                  historicalData={h}
                  fiftyTwoWeekHigh={q?.fiftyTwoWeekHigh}
                  fiftyTwoWeekLow={q?.fiftyTwoWeekLow}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Silver + Copper + NG side by side */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {(["SI=F", "HG=F", "NG=F"] as const).map((sym) => {
          const cfg = ALL_COMMODITIES.find((c) => c.symbol === sym)!;
          const h   = histMap[sym] ?? [];
          return (
            <PriceChart
              key={sym}
              data={h}
              symbol={sym}
              nameCn={cfg.nameCn}
              color={cfg.color}
              height={160}
            />
          );
        })}
      </div>
    </div>
  );
}
