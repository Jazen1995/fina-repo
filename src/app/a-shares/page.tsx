import { getQuotes, getHistorical } from "@/lib/yahoo-finance";
import { A_SHARES } from "@/lib/symbols";
import { AssetCard } from "@/components/AssetCard";
import { PriceChart } from "@/components/PriceChart";
import { StatsBar } from "@/components/StatsBar";
import { PageHeader } from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export default async function ASharesPage() {
  const sseIdx = "000001.SS";
  const symbols = A_SHARES.map((s) => s.symbol);

  const [quotes, ...hists] = await Promise.all([
    getQuotes(symbols),
    ...symbols.map((s) => getHistorical(s, "6mo")),
  ]);

  const qMap = new Map(quotes.map((q) => [q.symbol, q]));
  const hMap = new Map(symbols.map((s, i) => [s, hists[i]]));

  const sseQ = qMap.get(sseIdx);
  const sseH = hMap.get(sseIdx) ?? [];

  return (
    <div className="max-w-6xl">
      <PageHeader title="A股" subtitle="上证指数 · 深证成指 · 精选个股  |  北京时间 09:30–15:00" />

      {/* Spotlight: 上证 */}
      <AssetCard
        symbol={sseIdx}
        name="Shanghai Composite"
        nameCn="上证指数"
        price={sseQ?.price ?? null}
        change={sseQ?.change ?? null}
        changePercent={sseQ?.changePercent ?? null}
        currency="CNY"
        sparkline={sseH.slice(-60)}
        variant="hero"
      />

      {/* 其他标的 */}
      <div className="section-label">精选标的</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {A_SHARES.filter((s) => s.symbol !== sseIdx).map((stock) => {
          const q = qMap.get(stock.symbol);
          return (
            <AssetCard
              key={stock.symbol}
              symbol={stock.symbol}
              name={stock.name}
              nameCn={stock.nameCn}
              price={q?.price ?? null}
              change={q?.change ?? null}
              changePercent={q?.changePercent ?? null}
              currency={q?.currency ?? "CNY"}
              sparkline={hMap.get(stock.symbol)?.slice(-30)}
            />
          );
        })}
      </div>

      {/* 走势图 */}
      <div className="section-label">走势图</div>
      <div className="mb-3">
        <PriceChart data={sseH} symbol={sseIdx} nameCn="上证指数" color="#E03131" height={220} />
        <div className="mt-2">
          <StatsBar price={sseQ?.price ?? null} change={sseQ?.change ?? null}
            changePercent={sseQ?.changePercent ?? null} historicalData={sseH}
            fiftyTwoWeekHigh={sseQ?.fiftyTwoWeekHigh} fiftyTwoWeekLow={sseQ?.fiftyTwoWeekLow} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {A_SHARES.filter((s) => s.symbol !== sseIdx).map((s) => (
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
