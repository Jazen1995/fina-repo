# fina-repo — 个人全球市场看板

Bloomberg 深色风格的个人财务仪表盘，追踪贵金属、美股、美债、A股、港股和全球指数。

---

## 快速预览

**线上地址：** https://for-biling.vercel.app

**GitHub：** https://github.com/Jazen1995/fina-repo

---

## 技术栈

| 层次 | 选择 |
|------|------|
| 框架 | Next.js 14 (App Router，全 SSR) |
| 语言 | TypeScript |
| 样式 | TailwindCSS + CSS 自定义变量 |
| 图表 | Recharts (AreaChart / LineChart) |
| 数据源 | Yahoo Finance v8 Chart API（免费，无需注册） |
| 部署 | Vercel（GitHub 联动，push 自动部署） |
| 包管理 | **pnpm**（必须，见下方踩坑记录） |

---

## 本地开发

```bash
# 安装依赖（必须用 pnpm，见踩坑）
pnpm install

# 启动开发服务器
pnpm dev
# 访问 http://localhost:3000
```

---

## 数据源说明

所有数据来自 **Yahoo Finance v8 Chart API**，在服务端调用，规避浏览器 CORS。

```
GET https://query1.finance.yahoo.com/v8/finance/chart/{symbol}
    ?interval=1d&range={range}
```

- **无需 API Key / Cookie / Crumb**，直接请求即可
- 报价（实时）：`meta.regularMarketPrice`
- 昨收：`meta.chartPreviousClose`（用于计算涨跌额/涨跌幅）
- 历史 K 线：`timestamp[]` + `indicators.quote[0].close[]`
- 52 周高低：`meta.fiftyTwoWeekHigh` / `meta.fiftyTwoWeekLow`

**缓存策略：**
- 报价：5 分钟 (`unstable_cache`, revalidate: 300)
- 历史数据：1 小时 (`unstable_cache`, revalidate: 3600)
- 所有页面 `export const dynamic = "force-dynamic"`，防止构建期预渲染触发 API 调用

---

## 部署到 Vercel

### 首次部署

```bash
# 1. 安装 Vercel CLI
npm install -g vercel --cache /tmp/npm-cache-biling

# 2. 登录（浏览器授权）
vercel login

# 3. 部署 Preview
vercel --yes

# 4. 发布生产
vercel --prod --yes
```

### 日常更新

```bash
git add .
git commit -m "描述改动"
git push
# Vercel 监听 main 分支，push 后自动触发重新部署，无需手动操作
```

---

## 踩坑记录

### 坑 1：npm install 在 Vercel 上报 "Exit handler never called!"

**现象：** Vercel 构建时 `npm install` 跑约 71 秒后崩溃，报错：
```
npm error Exit handler never called!
npm error This is an error with npm itself.
```

**根因：** npm v10 处理体积较大的 `package-lock.json`（lockfileVersion 3）时触发 OOM crash，进程被 SIGKILL。

**解决方案：** 换用 `pnpm`。
- `package-lock.json`（220KB）→ `pnpm-lock.yaml`（41KB），体积缩小 5 倍
- Vercel 安装耗时从失败 71 秒 → 成功 8 秒

`vercel.json` 中指定安装命令：
```json
{
  "installCommand": "npm install -g pnpm && pnpm install"
}
```

**教训：** 本项目必须用 `pnpm` 管理依赖，不要切回 npm 或 yarn。

---

### 坑 2：yahoo-finance2 库的 TypeScript / 运行时问题

**现象：** 最初使用 `yahoo-finance2` npm 包，出现两个问题：
1. TypeScript 报错：`this` context 类型不兼容（`ModuleThis` 问题）
2. 构建期预渲染一次发 30+ 并发请求，触发 Yahoo Finance HTTP 429 限速封 IP

**解决方案：** 完全弃用 `yahoo-finance2`，改为直接调用 Yahoo Finance **v8 Chart API**（`fetch` 原生请求）。v8 接口不需要 crumb/cookie，无明显限速。

`package.json` 中已移除 `yahoo-finance2`，代码中无任何引用。

---

### 坑 3：Next.js 配置文件类型

**现象：** `next.config.ts` 无法被 Next.js 14 识别。

**解决：** 重命名为 `next.config.mjs`，使用 ES Module 格式，去掉 TypeScript 类型标注。

---

### 坑 4：build 期预渲染触发 API 调用

**现象：** 不加任何配置时，Next.js 构建会对每个页面执行一次 SSR 来"探测"，导致 Yahoo Finance API 在构建期被大量调用。

**解决：** 每个数据页面顶部加一行：
```ts
export const dynamic = "force-dynamic";
```
确保页面只在用户请求时渲染，构建期不调用任何外部 API。

---

## 项目结构

```
src/
├── app/
│   ├── layout.tsx               # 根布局：左侧固定导航栏 + 右侧滚动内容区
│   ├── page.tsx                 # 重定向到 /precious-metals
│   ├── precious-metals/page.tsx # 大宗商品（贵金属 / 能源 / 基本金属）
│   ├── us-stocks/page.tsx       # 美股（S&P500 + 七巨头）
│   ├── us-bonds/page.tsx        # 美债（TNX + TLT / IEF ETF）
│   ├── a-shares/page.tsx        # A股（上证指数 + 精选个股）
│   ├── hk-stocks/page.tsx       # 港股（恒生指数 + 精选个股）
│   ├── others/page.tsx          # 全球指数（日 / 印 / 韩 / 欧）
│   └── api/
│       ├── quotes/route.ts      # GET /api/quotes?symbols=GC=F,AAPL
│       └── historical/route.ts  # GET /api/historical?symbol=GC=F&period=6mo
├── components/
│   ├── Sidebar.tsx              # 左侧导航，含市场开盘状态指示灯
│   ├── AssetCard.tsx            # 资产卡片（hero / default 两种尺寸）
│   ├── PriceChart.tsx           # 6个月价格折线图（Recharts）
│   ├── StatsBar.tsx             # 统计面板（今天 / 本月至今 / 年初至今 / 52周高低）
│   └── PageHeader.tsx           # 页面标题组件
└── lib/
    ├── yahoo-finance.ts         # 数据获取层（直接调 v8 Chart API）
    ├── symbols.ts               # 全部标的配置（symbol / 名称 / 颜色）
    └── utils.ts                 # 格式化工具（价格 / 百分比 / 涨跌额）
```

---

## 添加新标的

在 `src/lib/symbols.ts` 对应分组里追加一条：

```ts
{ symbol: "BTC-USD", name: "Bitcoin", nameCn: "比特币", color: "#F7931A" }
```

然后在对应页面的 `getQuotes` 和 `getHistorical` 调用里会自动包含它（各分组页面遍历整个数组）。

---

## 验证数据接口

```bash
# 本地验证各标的数据是否正常（约 30 个测试用例）
node test-data.mjs 2>/dev/null
```
