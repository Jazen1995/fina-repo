import { NextRequest, NextResponse } from "next/server";
import { getHistorical } from "@/lib/yahoo-finance";

export const revalidate = 3600; // 1 hour

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  const period = (searchParams.get("period") ?? "6mo") as "1mo" | "3mo" | "6mo" | "1y" | "2y";

  if (!symbol) {
    return NextResponse.json({ error: "symbol parameter required" }, { status: 400 });
  }

  const validPeriods = ["1mo", "3mo", "6mo", "1y", "2y"];
  if (!validPeriods.includes(period)) {
    return NextResponse.json({ error: "invalid period" }, { status: 400 });
  }

  const data = await getHistorical(symbol, period);

  return NextResponse.json(data, {
    headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=300" },
  });
}
