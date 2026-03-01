import { getQuotes, getHistorical } from "@/lib/yahoo-finance";
import { HK_STOCKS } from "@/lib/symbols";
import { AssetCard } from "@/components/AssetCard";
import { PriceChart } from "@/components/PriceChart";
import { StatsBar } from "@/components/StatsBar";
import { PageHeader } from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export default async function HkStocksPage() {
  const hsiSym = "^HSI";
  const symbols = HK_STOCKS.map((s) => s.symbol);

  const [quotes, ...hists] = await Promise.all([
    getQuotes(symbols),
    ...symbols.map((s) => getHistorical(s, "6mo")),
  ]);

  const qMap = new Map(quotes.map((q) => [q.symbol, q]));
  const hMap = new Map(symbols.map((s, i) => [s, hists[i]]));

  const hsiQ = qMap.get(hsiSym);
  const hsiH = hMap.get(hsiSym) ?? [];

  return (
    <div className="max-w-6xl">
      <PageHeader title="港股" subtitle="恒生指数 · 精选港股  |  香港时间 09:30–16:00" />

      <AssetCard
        symbol={hsiSym}
        name="Hang Seng Index"
        nameCn="恒生指数"
        price={hsiQ?.price ?? null}
        change={hsiQ?.change ?? null}
        changePercent={hsiQ?.changePercent ?? null}
        currency="HKD"
        sparkline={hsiH.slice(-60)}
        variant="hero"
      />

      <div className="section-label">精选个股</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {HK_STOCKS.filter((s) => s.symbol !== hsiSym).map((s) => {
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
              currency={q?.currency ?? "HKD"}
              sparkline={hMap.get(s.symbol)?.slice(-30)}
            />
          );
        })}
      </div>

      <div className="section-label">走势图</div>
      <div className="mb-3">
        <PriceChart data={hsiH} symbol={hsiSym} nameCn="恒生指数" color="#E03131" height={220} />
        <div className="mt-2">
          <StatsBar price={hsiQ?.price ?? null} change={hsiQ?.change ?? null}
            changePercent={hsiQ?.changePercent ?? null} historicalData={hsiH}
            fiftyTwoWeekHigh={hsiQ?.fiftyTwoWeekHigh} fiftyTwoWeekLow={hsiQ?.fiftyTwoWeekLow} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {HK_STOCKS.filter((s) => s.symbol !== hsiSym).map((s) => (
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
