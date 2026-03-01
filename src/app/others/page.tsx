import { getQuotes, getHistorical } from "@/lib/yahoo-finance";
import { GLOBAL_INDICES } from "@/lib/symbols";
import { AssetCard } from "@/components/AssetCard";
import { PriceChart } from "@/components/PriceChart";
import { StatsBar } from "@/components/StatsBar";
import { PageHeader } from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export default async function OthersPage() {
  const n225Sym = "^N225";
  const symbols = GLOBAL_INDICES.map((s) => s.symbol);

  const [quotes, ...hists] = await Promise.all([
    getQuotes(symbols),
    ...symbols.map((s) => getHistorical(s, "6mo")),
  ]);

  const qMap = new Map(quotes.map((q) => [q.symbol, q]));
  const hMap = new Map(symbols.map((s, i) => [s, hists[i]]));

  const n225Q = qMap.get(n225Sym);
  const n225H = hMap.get(n225Sym) ?? [];

  return (
    <div className="max-w-6xl">
      <PageHeader title="全球指数" subtitle="日本 · 印度 · 韩国 · 欧洲 · 英国" />

      <AssetCard
        symbol={n225Sym}
        name="Nikkei 225"
        nameCn="日经225"
        price={n225Q?.price ?? null}
        change={n225Q?.change ?? null}
        changePercent={n225Q?.changePercent ?? null}
        currency="JPY"
        sparkline={n225H.slice(-60)}
        variant="hero"
      />

      <div className="section-label">其他指数</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {GLOBAL_INDICES.filter((s) => s.symbol !== n225Sym).map((idx) => {
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
              currency={q?.currency ?? "USD"}
              sparkline={hMap.get(idx.symbol)?.slice(-30)}
            />
          );
        })}
      </div>

      <div className="section-label">走势图</div>
      <div className="mb-3">
        <PriceChart data={n225H} symbol={n225Sym} nameCn="日经225" color="#E03131" height={220} />
        <div className="mt-2">
          <StatsBar price={n225Q?.price ?? null} change={n225Q?.change ?? null}
            changePercent={n225Q?.changePercent ?? null} historicalData={n225H}
            fiftyTwoWeekHigh={n225Q?.fiftyTwoWeekHigh} fiftyTwoWeekLow={n225Q?.fiftyTwoWeekLow} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {GLOBAL_INDICES.filter((s) => s.symbol !== n225Sym).map((idx) => {
          const h = hMap.get(idx.symbol) ?? [];
          const q = qMap.get(idx.symbol);
          return (
            <div key={idx.symbol}>
              <PriceChart data={h} symbol={idx.symbol} nameCn={idx.nameCn} color={idx.color} height={160} />
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
