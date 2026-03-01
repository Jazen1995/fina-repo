import { getQuotes, getHistorical } from "@/lib/yahoo-finance";
import { US_BONDS } from "@/lib/symbols";
import { AssetCard } from "@/components/AssetCard";
import { PriceChart } from "@/components/PriceChart";
import { StatsBar } from "@/components/StatsBar";
import { PageHeader } from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export default async function UsBondsPage() {
  const tnxSym = "^TNX";
  const symbols = US_BONDS.map((b) => b.symbol);

  const [quotes, ...hists] = await Promise.all([
    getQuotes(symbols),
    ...symbols.map((s) => getHistorical(s, "6mo")),
  ]);

  const qMap = new Map(quotes.map((q) => [q.symbol, q]));
  const hMap = new Map(symbols.map((s, i) => [s, hists[i]]));

  const tnxQ = qMap.get(tnxSym);
  const tnxH = hMap.get(tnxSym) ?? [];

  return (
    <div className="max-w-6xl">
      <PageHeader title="美债" subtitle="10年期收益率 · TLT · IEF  |  反映美联储利率预期" />

      <AssetCard
        symbol={tnxSym}
        name="10Y Treasury Yield"
        nameCn="10年期美债收益率"
        price={tnxQ?.price ?? null}
        change={tnxQ?.change ?? null}
        changePercent={tnxQ?.changePercent ?? null}
        unit="%"
        sparkline={tnxH.slice(-60)}
        variant="hero"
      />

      <div className="section-label">美债 ETF</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {US_BONDS.filter((b) => b.symbol !== tnxSym).map((b) => {
          const q = qMap.get(b.symbol);
          return (
            <AssetCard
              key={b.symbol}
              symbol={b.symbol}
              name={b.name}
              nameCn={b.nameCn}
              price={q?.price ?? null}
              change={q?.change ?? null}
              changePercent={q?.changePercent ?? null}
              currency={q?.currency ?? "USD"}
              sparkline={hMap.get(b.symbol)?.slice(-30)}
            />
          );
        })}
      </div>

      <div className="section-label">走势图</div>
      <div className="mb-3">
        <PriceChart data={tnxH} symbol={tnxSym} nameCn="10年期美债收益率" color="#C8941A" height={220} />
        <div className="mt-2">
          <StatsBar price={tnxQ?.price ?? null} change={tnxQ?.change ?? null}
            changePercent={tnxQ?.changePercent ?? null} historicalData={tnxH}
            fiftyTwoWeekHigh={tnxQ?.fiftyTwoWeekHigh} fiftyTwoWeekLow={tnxQ?.fiftyTwoWeekLow} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {US_BONDS.filter((b) => b.symbol !== tnxSym).map((b) => {
          const h = hMap.get(b.symbol) ?? [];
          const q = qMap.get(b.symbol);
          return (
            <div key={b.symbol}>
              <PriceChart data={h} symbol={b.symbol} nameCn={b.nameCn} color={b.color} />
              <div className="mt-2">
                <StatsBar price={q?.price ?? null} change={q?.change ?? null}
                  changePercent={q?.changePercent ?? null} historicalData={h}
                  fiftyTwoWeekHigh={q?.fiftyTwoWeekHigh} fiftyTwoWeekLow={q?.fiftyTwoWeekLow} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
