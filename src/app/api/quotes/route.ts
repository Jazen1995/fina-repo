import { NextRequest, NextResponse } from "next/server";
import { getQuotes } from "@/lib/yahoo-finance";
import { SYMBOL_MAP } from "@/lib/symbols";

export const revalidate = 300; // 5 minutes

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbolsParam = searchParams.get("symbols");

  if (!symbolsParam) {
    return NextResponse.json({ error: "symbols parameter required" }, { status: 400 });
  }

  const symbols = symbolsParam.split(",").map((s) => s.trim()).filter(Boolean);

  if (symbols.length === 0) {
    return NextResponse.json({ error: "no valid symbols" }, { status: 400 });
  }

  const quotes = await getQuotes(symbols);

  const response = quotes.map((q) => {
    const config = SYMBOL_MAP.get(q.symbol);
    return {
      symbol: q.symbol,
      name: config?.name ?? q.symbol,
      nameCn: config?.nameCn ?? q.symbol,
      price: q.price,
      change: q.change,
      changePercent: q.changePercent,
      currency: q.currency,
      marketState: q.marketState,
      fiftyTwoWeekHigh: q.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: q.fiftyTwoWeekLow,
      unit: config?.unit,
    };
  });

  return NextResponse.json(response, {
    headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" },
  });
}
