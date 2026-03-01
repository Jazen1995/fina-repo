/**
 * Data layer smoke tests — run: node test-data.mjs
 *
 * Tests the Yahoo Finance v8 chart API directly,
 * then validates data shape used by our components.
 */

const BASE = "https://query1.finance.yahoo.com/v8/finance/chart";
const UA   = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36";

const PASS = "\x1b[32m✓\x1b[0m";
const FAIL = "\x1b[31m✗\x1b[0m";
const HEAD = "\x1b[1;36m";
const RESET = "\x1b[0m";
const DIM  = "\x1b[2m";

let passed = 0;
let failed = 0;

function assert(condition, label, detail = "") {
  if (condition) {
    console.log(`  ${PASS} ${label}`);
    passed++;
  } else {
    console.log(`  ${FAIL} ${label}${detail ? `  ${DIM}(${detail})${RESET}` : ""}`);
    failed++;
  }
}
function section(title) { console.log(`\n${HEAD}▶ ${title}${RESET}`); }

// ── helpers ────────────────────────────────────────────────────────────────

async function fetchChart(symbol, range = "2d") {
  const url = `${BASE}/${encodeURIComponent(symbol)}?interval=1d&range=${range}`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${symbol}`);
  const json = await res.json();
  const result = json?.chart?.result?.[0];
  if (!result) throw new Error(`no chart result for ${symbol}`);
  return result;
}

function extractQuote(result, symbol) {
  const meta = result.meta ?? {};
  const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? null;
  const price     = meta.regularMarketPrice ?? null;
  const change    = price != null && prevClose != null ? price - prevClose : null;
  const pct       = change != null && prevClose ? (change / prevClose) * 100 : null;
  return {
    symbol,
    price,
    change,
    changePercent: pct,
    currency:       meta.currency ?? "USD",
    fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh ?? null,
    fiftyTwoWeekLow:  meta.fiftyTwoWeekLow  ?? null,
  };
}

function extractHistorical(result) {
  const timestamps = result.timestamp ?? [];
  const closes     = result.indicators?.quote?.[0]?.close ?? [];
  return timestamps
    .map((ts, i) => ({
      date:  new Date(ts * 1000).toISOString().split("T")[0],
      close: closes[i] ?? null,
    }))
    .filter(d => d.close != null && d.close > 0);
}

// ── 1. Quote: US stock ─────────────────────────────────────────────────────
section("Quote — US stock (AAPL)");
let aaplQuote = null;
try {
  const r = await fetchChart("AAPL", "2d");
  aaplQuote = extractQuote(r, "AAPL");
  assert(typeof aaplQuote.price === "number",         "price is number",           `got ${aaplQuote.price}`);
  assert(typeof aaplQuote.change === "number",        "change is number");
  assert(typeof aaplQuote.changePercent === "number", "changePercent is number");
  assert(aaplQuote.currency === "USD",                "currency=USD",              `got ${aaplQuote.currency}`);
  assert(typeof aaplQuote.fiftyTwoWeekHigh === "number", "52wHigh present");
  assert(typeof aaplQuote.fiftyTwoWeekLow  === "number", "52wLow present");
  console.log(`  ${DIM}price=$${aaplQuote.price}  change=${aaplQuote.changePercent?.toFixed(2)}%${RESET}`);
} catch (e) {
  assert(false, "AAPL quote succeeded", e.message);
}

// ── 2. Quote: gold futures ─────────────────────────────────────────────────
section("Quote — gold futures (GC=F)");
try {
  const r = await fetchChart("GC=F", "2d");
  const q = extractQuote(r, "GC=F");
  assert(typeof q.price === "number", "price is number", `got ${q.price}`);
  assert(q.currency === "USD",        "currency=USD");
  console.log(`  ${DIM}gold=$${q.price}  change=${q.changePercent?.toFixed(2)}%${RESET}`);
} catch (e) {
  assert(false, "GC=F quote succeeded", e.message);
}

// ── 3. Quote: A-share index ────────────────────────────────────────────────
section("Quote — A-share index (000001.SS)");
try {
  const r = await fetchChart("000001.SS", "2d");
  const q = extractQuote(r, "000001.SS");
  assert(typeof q.price === "number", "price is number", `got ${q.price}`);
  console.log(`  ${DIM}SSE=${q.price}${RESET}`);
} catch (e) {
  assert(false, "000001.SS quote succeeded", e.message);
}

// ── 4. Quote: silver + copper ─────────────────────────────────────────────
section("Quote — silver (SI=F) + copper (HG=F)");
try {
  const [rSilver, rCopper] = await Promise.all([
    fetchChart("SI=F", "2d"),
    fetchChart("HG=F", "2d"),
  ]);
  const silver = extractQuote(rSilver, "SI=F");
  const copper = extractQuote(rCopper, "HG=F");
  assert(typeof silver.price === "number", "silver price is number", `got ${silver.price}`);
  assert(typeof copper.price === "number", "copper price is number", `got ${copper.price}`);
  console.log(`  ${DIM}silver=$${silver.price}  copper=$${copper.price}${RESET}`);
} catch (e) {
  assert(false, "SI=F + HG=F quotes succeeded", e.message);
}

// ── 5. Historical: gold 6mo ────────────────────────────────────────────────
section("Historical — GC=F 6 months");
let goldHist = null;
try {
  const r = await fetchChart("GC=F", "6mo");
  goldHist = extractHistorical(r);
  assert(Array.isArray(goldHist),      "returns array");
  assert(goldHist.length >= 100,       `≥100 trading days`, `got ${goldHist.length}`);
  assert(/^\d{4}-\d{2}-\d{2}$/.test(goldHist[0].date), "date is YYYY-MM-DD", `got ${goldHist[0].date}`);
  assert(typeof goldHist[0].close === "number",          "close is number");
  assert(goldHist[0].close > 0,                          "close > 0");
  console.log(`  ${DIM}${goldHist.length} days  ${goldHist[0].date} → ${goldHist.at(-1).date}  latest=$${goldHist.at(-1).close?.toFixed(2)}${RESET}`);
} catch (e) {
  assert(false, "GC=F historical succeeded", e.message);
}

// ── 6. Historical → sparkline shape ───────────────────────────────────────
section("Historical → sparkline (last 30 points)");
if (goldHist?.length) {
  const sparkline = goldHist.slice(-30);
  assert(sparkline.length === 30,                   "exactly 30 pts");
  assert(sparkline[0].close > 0,                    "close > 0");
  assert(sparkline.every(d => typeof d.date === "string"),  "all dates are strings");
  assert(sparkline.every(d => typeof d.close === "number"), "all closes are numbers");
  console.log(`  ${DIM}${sparkline[0].date}=$${sparkline[0].close?.toFixed(2)} … ${sparkline.at(-1).date}=$${sparkline.at(-1).close?.toFixed(2)}${RESET}`);
} else {
  assert(false, "historical data available for sparkline test");
}

// ── 7. Historical: S&P 500 ────────────────────────────────────────────────
section("Historical — ^GSPC (S&P 500) 6 months");
try {
  const r = await fetchChart("^GSPC", "6mo");
  const h = extractHistorical(r);
  assert(h.length >= 80,  `≥80 days`, `got ${h.length}`);
  assert(h[0].close > 1000, "S&P close > 1000 (sanity)");
  console.log(`  ${DIM}${h.length} days  latest=${h.at(-1).close?.toFixed(0)}${RESET}`);
} catch (e) {
  assert(false, "^GSPC historical succeeded", e.message);
}

// ── 8. Historical: HK + A-share ───────────────────────────────────────────
section("Historical — ^HSI (Hang Seng) + 000001.SS (SSE)");
try {
  const [rHK, rCN] = await Promise.all([
    fetchChart("^HSI", "6mo"),
    fetchChart("000001.SS", "6mo"),
  ]);
  const hk = extractHistorical(rHK);
  const cn = extractHistorical(rCN);
  assert(hk.length >= 80, `HSI ≥80 days`, `got ${hk.length}`);
  assert(cn.length >= 80, `SSE ≥80 days`, `got ${cn.length}`);
  console.log(`  ${DIM}HSI: ${hk.length} days  SSE: ${cn.length} days${RESET}`);
} catch (e) {
  assert(false, "HSI + SSE historical succeeded", e.message);
}

// ── 9. Parallel fetch — 5 symbols ─────────────────────────────────────────
section("Parallel fetch — 5 symbols (simulates page load)");
try {
  const syms = ["NVDA", "TSLA", "^TNX", "^N225", "9988.HK"];
  const results = await Promise.all(syms.map(s => fetchChart(s, "2d").then(r => extractQuote(r, s))));
  for (const q of results) {
    assert(typeof q.price === "number", `${q.symbol} has price`, `got ${q.price}`);
  }
  console.log(`  ${DIM}${results.map(q => `${q.symbol}=${q.price}`).join("  ")}${RESET}`);
} catch (e) {
  assert(false, "parallel fetch succeeded", e.message);
}

// ── 10. Error handling ────────────────────────────────────────────────────
section("Error handling — invalid symbol");
try {
  await fetchChart("TOTALLY_INVALID_XYZ_9999", "2d");
  // If we get here, the API returned something — check if it's a valid error
  assert(false, "should have thrown for completely invalid symbol");
} catch {
  assert(true, "throws for invalid symbol (caught by wrapper)");
}

// ── Summary ────────────────────────────────────────────────────────────────
console.log(`\n${"─".repeat(50)}`);
const color = failed > 0 ? "\x1b[31m" : "\x1b[32m";
console.log(`${color}Tests: ${passed + failed} total  ✓ ${passed} passed  ✗ ${failed} failed${RESET}`);
if (failed > 0) {
  console.log(`\nCheck errors above. If price=null, verify the symbol name is correct.`);
  process.exit(1);
} else {
  console.log(`\n${PASS} All tests passed! Data layer is working correctly.\n`);
}
