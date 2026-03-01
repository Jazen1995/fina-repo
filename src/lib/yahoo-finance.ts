/**
 * Yahoo Finance v8 chart API — no crumb/cookie required, no rate-limit issues.
 * Endpoints used:
 *   GET https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?interval=1d&range={range}
 */

import { unstable_cache } from "next/cache";

const BASE = "https://query1.finance.yahoo.com/v8/finance/chart";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36";

export interface QuoteData {
  symbol: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  currency: string;
  marketState?: string | null;
  fiftyTwoWeekHigh?: number | null;
  fiftyTwoWeekLow?: number | null;
}

export interface HistoricalPoint {
  date: string;
  close: number;
}

// ── Raw fetchers ────────────────────────────────────────────────────────────

async function fetchQuote(symbol: string): Promise<QuoteData> {
  try {
    const url = `${BASE}/${encodeURIComponent(symbol)}?interval=1d&range=2d`;
    const res = await fetch(url, {
      headers: { "User-Agent": UA },
      next: { revalidate: 0 },   // cache handled by unstable_cache below
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const result = json?.chart?.result?.[0];
    if (!result) throw new Error("no result");

    const meta = result.meta ?? {};
    const prevClose: number | null = meta.chartPreviousClose ?? meta.previousClose ?? null;
    const price: number | null = meta.regularMarketPrice ?? null;
    const change = price != null && prevClose != null ? price - prevClose : null;
    const changePercent = change != null && prevClose ? (change / prevClose) * 100 : null;

    return {
      symbol,
      price,
      change,
      changePercent,
      currency: meta.currency ?? "USD",
      marketState: meta.marketState ?? null,
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh ?? null,
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow ?? null,
    };
  } catch {
    return { symbol, price: null, change: null, changePercent: null, currency: "USD" };
  }
}

const RANGE_MAP: Record<string, string> = {
  "1mo": "1mo",
  "3mo": "3mo",
  "6mo": "6mo",
  "1y":  "1y",
  "2y":  "2y",
};

async function fetchHistorical(symbol: string, period: string): Promise<HistoricalPoint[]> {
  try {
    const range = RANGE_MAP[period] ?? "6mo";
    const url = `${BASE}/${encodeURIComponent(symbol)}?interval=1d&range=${range}`;
    const res = await fetch(url, {
      headers: { "User-Agent": UA },
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const result = json?.chart?.result?.[0];
    if (!result) return [];

    const timestamps: number[] = result.timestamp ?? [];
    const closes: (number | null)[] = result.indicators?.quote?.[0]?.close ?? [];

    return timestamps
      .map((ts, i) => ({
        date: new Date(ts * 1000).toISOString().split("T")[0],
        close: closes[i] ?? null,
      }))
      .filter((d): d is HistoricalPoint => d.close != null && d.close > 0);
  } catch {
    return [];
  }
}

// ── Cached wrappers ─────────────────────────────────────────────────────────

const cachedQuote = unstable_cache(fetchQuote, ["yf-quote-v8"], { revalidate: 300 });
const cachedHistorical = unstable_cache(fetchHistorical, ["yf-hist-v8"], { revalidate: 3600 });

// ── Public API ───────────────────────────────────────────────────────────────

export async function getQuotes(symbols: string[]): Promise<QuoteData[]> {
  return Promise.all(symbols.map((s) => cachedQuote(s)));
}

export async function getHistorical(
  symbol: string,
  period: "1mo" | "3mo" | "6mo" | "1y" | "2y" = "6mo"
): Promise<HistoricalPoint[]> {
  return cachedHistorical(symbol, period);
}
