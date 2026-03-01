import { getQuotes, getHistorical } from "@/lib/yahoo-finance";
import { US_INDICES, US_STOCKS } from "@/lib/symbols";
import { AssetCard } from "@/components/AssetCard";
import { PriceChart } from "@/components/PriceChart";
import { StatsBar } from "@/components/StatsBar";
import { PageHeader } from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export default async function UsStocksPage() {
  const spSym   = "^GSPC";
  const allSyms = [...US_INDICES.map((s) => s.symbol), ...US_STOCKS.map((s) => s.symbol)];

  const [quotes, ...hists] = await Promise.all([
    getQuotes(allSyms),
    ...allSyms.map((s) => getHistorical(s, "6mo")),
  ]);

  const qMap = new Map(quotes.map((q) => [q.symbol, q]));
  const hMap = new Map(allSyms.map((s, i) => [s, hists[i]]));

  const spQ = qMap.get(spSym);
  const spH = hMap.get(spSym) ?? [];

  return (
    <div className="max-w-6xl">
      <PageHeader title="美股" subtitle="三大指数 + 七巨头  |  美东时间 09:30–16:00 为实时" />

      {/* ── Spotlight: S&P 500 ────────────────────────────────────────── */}
      <AssetCard
        symbol={spSym}
        name="S&P 500"
        nameCn="标普500"
        price={spQ?.price ?? null}
        change={spQ?.change ?? null}
        changePercent={spQ?.changePercent ?? null}
        currency="USD"
        sparkline={spH.slice(-60)}
        variant="hero"
      />

      {/* ── 纳斯达克 + 道琼斯 ────────────────────────────────────────── */}
      <div className="section-label">其他指数</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
        {US_INDICES.filter((i) => i.symbol !== spSym).map((idx) => {
          const q = qMap.get(idx.symbol);
          return (
            <AssetCard
              key={idx.symbol}
              symbol={idx.symbol}
              name={idx.name}
              nameCn={idx.nameCn}
              price={q?.price ?? null}
              change={q?.change ?? null}
              changePercent={q?.changePercent ?? null}
              currency="USD"
              sparkline={hMap.get(idx.symbol)?.slice(-30)}
            />
          );
        })}
      </div>

      {/* ── 七巨头 ───────────────────────────────────────────────────── */}
      <div className="section-label">七巨头</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {US_STOCKS.map((s) => {
          const q = qMap.get(s.symbol);
          return (
            <AssetCard
              key={s.symbol}
              symbol={s.symbol}
              name={s.name}
              nameCn={s.nameCn}
              price={q?.price ?? null}
              change={q?.change ?? null}
              changePercent={q?.changePercent ?? null}
              currency="USD"
              sparkline={hMap.get(s.symbol)?.slice(-30)}
            />
          );
        })}
      </div>

      {/* ── 走势图 ────────────────────────────────────────────────────── */}
      <div className="section-label">走势图</div>

      {/* S&P 500 big chart */}
      <div className="mb-3">
        <PriceChart data={spH} symbol={spSym} nameCn="标普500" color="#C8941A" height={220} />
        <div className="mt-2">
          <StatsBar
            price={spQ?.price ?? null}
            change={spQ?.change ?? null}
            changePercent={spQ?.changePercent ?? null}
            historicalData={spH}
            fiftyTwoWeekHigh={spQ?.fiftyTwoWeekHigh}
            fiftyTwoWeekLow={spQ?.fiftyTwoWeekLow}
          />
        </div>
      </div>

      {/* NASDAQ + DJI side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        {US_INDICES.filter((i) => i.symbol !== spSym).map((idx) => {
          const h = hMap.get(idx.symbol) ?? [];
          const q = qMap.get(idx.symbol);
          return (
            <div key={idx.symbol}>
              <PriceChart data={h} symbol={idx.symbol} nameCn={idx.nameCn} color={idx.color} />
              <div className="mt-2">
                <StatsBar price={q?.price ?? null} change={q?.change ?? null}
                  changePercent={q?.changePercent ?? null} historicalData={h}
                  fiftyTwoWeekHigh={q?.fiftyTwoWeekHigh} fiftyTwoWeekLow={q?.fiftyTwoWeekLow} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Individual stocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {US_STOCKS.map((s) => (
          <PriceChart
            key={s.symbol}
            data={hMap.get(s.symbol) ?? []}
            symbol={s.symbol}
            nameCn={s.nameCn}
            color={s.color}
            height={150}
          />
        ))}
      </div>
    </div>
  );
}
