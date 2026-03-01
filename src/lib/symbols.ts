export interface SymbolConfig {
  symbol: string;
  name: string;
  nameCn: string;
  category: string;
  group?: string;     // sub-group within category
  unit?: string;
  color?: string;     // suggested chart color
}

// ── 大宗商品 ───────────────────────────────────────────────────────────────

export const COMMODITY_PRECIOUS: SymbolConfig[] = [
  { symbol: "GC=F", name: "Gold",     nameCn: "黄金", category: "precious-metals", group: "贵金属", unit: "USD/oz",  color: "#C8941A" },
  { symbol: "SI=F", name: "Silver",   nameCn: "白银", category: "precious-metals", group: "贵金属", unit: "USD/oz",  color: "#9BA8B4" },
  { symbol: "PL=F", name: "Platinum", nameCn: "铂金", category: "precious-metals", group: "贵金属", unit: "USD/oz",  color: "#7EC8E3" },
  { symbol: "PA=F", name: "Palladium",nameCn: "钯金", category: "precious-metals", group: "贵金属", unit: "USD/oz",  color: "#B0A0D0" },
];

export const COMMODITY_ENERGY: SymbolConfig[] = [
  { symbol: "CL=F", name: "WTI Crude Oil",  nameCn: "WTI 原油",    category: "precious-metals", group: "能源", unit: "USD/bbl", color: "#E87B1E" },
  { symbol: "BZ=F", name: "Brent Crude Oil",nameCn: "布伦特原油",   category: "precious-metals", group: "能源", unit: "USD/bbl", color: "#D4611A" },
  { symbol: "NG=F", name: "Natural Gas",     nameCn: "天然气",      category: "precious-metals", group: "能源", unit: "USD/MMBtu", color: "#5BA3C9" },
];

export const COMMODITY_METALS: SymbolConfig[] = [
  { symbol: "HG=F",  name: "Copper",   nameCn: "铜",  category: "precious-metals", group: "基本金属", unit: "USD/lb",  color: "#CD7F32" },
  { symbol: "ALI=F", name: "Aluminum", nameCn: "铝",  category: "precious-metals", group: "基本金属", unit: "USD/lb",  color: "#8EA8C0" },
];

/** All commodity symbols (for the precious-metals page) */
export const ALL_COMMODITIES = [
  ...COMMODITY_PRECIOUS,
  ...COMMODITY_ENERGY,
  ...COMMODITY_METALS,
];

// ── 美股 ───────────────────────────────────────────────────────────────────

export const US_INDICES: SymbolConfig[] = [
  { symbol: "^GSPC", name: "S&P 500",            nameCn: "标普500",  category: "us-stocks", color: "#C8941A" },
  { symbol: "^IXIC", name: "NASDAQ Composite",   nameCn: "纳斯达克", category: "us-stocks", color: "#7B68EE" },
  { symbol: "^DJI",  name: "Dow Jones",           nameCn: "道琼斯",  category: "us-stocks", color: "#4EC9C0" },
];

export const US_STOCKS: SymbolConfig[] = [
  { symbol: "NVDA",  name: "NVIDIA",    nameCn: "英伟达", category: "us-stocks", color: "#76B900" },
  { symbol: "AAPL",  name: "Apple",     nameCn: "苹果",   category: "us-stocks", color: "#A8C5DA" },
  { symbol: "MSFT",  name: "Microsoft", nameCn: "微软",   category: "us-stocks", color: "#00A4EF" },
  { symbol: "META",  name: "Meta",      nameCn: "Meta",   category: "us-stocks", color: "#0668E1" },
  { symbol: "GOOGL", name: "Alphabet",  nameCn: "谷歌",   category: "us-stocks", color: "#FBBC04" },
  { symbol: "AMZN",  name: "Amazon",    nameCn: "亚马逊", category: "us-stocks", color: "#FF9900" },
  { symbol: "TSLA",  name: "Tesla",     nameCn: "特斯拉", category: "us-stocks", color: "#CC0000" },
];

// ── 美债 ───────────────────────────────────────────────────────────────────

export const US_BONDS: SymbolConfig[] = [
  { symbol: "^TNX", name: "10Y Treasury Yield",     nameCn: "10年期收益率", category: "us-bonds", unit: "%",    color: "#C8941A" },
  { symbol: "TLT",  name: "20+ Year Treasury ETF",  nameCn: "20+年美债ETF", category: "us-bonds",               color: "#4EC9C0" },
  { symbol: "IEF",  name: "7-10 Year Treasury ETF", nameCn: "7-10年美债ETF",category: "us-bonds",               color: "#7B68EE" },
];

// ── A股 ────────────────────────────────────────────────────────────────────

export const A_SHARES: SymbolConfig[] = [
  { symbol: "000001.SS", name: "Shanghai Composite", nameCn: "上证指数",  category: "a-shares", color: "#E03131" },
  { symbol: "399001.SZ", name: "Shenzhen Component", nameCn: "深证成指",  category: "a-shares", color: "#C8941A" },
  { symbol: "601899.SS", name: "Zijin Mining",        nameCn: "紫金矿业", category: "a-shares", color: "#F0B429" },
  { symbol: "002460.SZ", name: "Ganfeng Lithium",     nameCn: "赣锋锂业", category: "a-shares", color: "#5BA3C9" },
];

// ── 港股 ───────────────────────────────────────────────────────────────────

export const HK_STOCKS: SymbolConfig[] = [
  { symbol: "^HSI",    name: "Hang Seng Index", nameCn: "恒生指数", category: "hk-stocks", color: "#E03131" },
  { symbol: "9988.HK", name: "Alibaba",         nameCn: "阿里巴巴", category: "hk-stocks", color: "#F59E0B" },
  { symbol: "0700.HK", name: "Tencent",         nameCn: "腾讯控股", category: "hk-stocks", color: "#4EC9C0" },
  { symbol: "3690.HK", name: "Meituan",         nameCn: "美团",     category: "hk-stocks", color: "#60B8FA" },
];

// ── 全球指数 ───────────────────────────────────────────────────────────────

export const GLOBAL_INDICES: SymbolConfig[] = [
  { symbol: "^N225",     name: "Nikkei 225",    nameCn: "日经225",    category: "others", color: "#E03131" },
  { symbol: "^BSESN",   name: "BSE Sensex",    nameCn: "印度BSE",    category: "others", color: "#F59E0B" },
  { symbol: "^KS11",    name: "KOSPI",          nameCn: "韩国KOSPI",  category: "others", color: "#4EC9C0" },
  { symbol: "^STOXX50E",name: "Euro Stoxx 50", nameCn: "欧洲Stoxx50",category: "others", color: "#7B68EE" },
  { symbol: "^FTSE",    name: "FTSE 100",       nameCn: "英国富时100",category: "others", color: "#5BA3C9" },
];

// ── Unified map ────────────────────────────────────────────────────────────

export const ALL_SYMBOLS = [
  ...ALL_COMMODITIES,
  ...US_INDICES,
  ...US_STOCKS,
  ...US_BONDS,
  ...A_SHARES,
  ...HK_STOCKS,
  ...GLOBAL_INDICES,
];

export const SYMBOL_MAP = new Map(ALL_SYMBOLS.map((s) => [s.symbol, s]));

// Kept for backward-compat (old imports)
export const PRECIOUS_METALS = COMMODITY_PRECIOUS;
export const GLOBAL_INDICES_HK = HK_STOCKS;
