import {
  PriceHistory,
  StockQuote,
  GrowthAnalysis,
  analyzeGrowthPotential,
} from './investment-algorithm'

// ─── Watchlist ────────────────────────────────────────────────────────────────

export const WATCHLIST = [
  { symbol: 'NVDA',  name: 'NVIDIA Corporation',         sector: 'Technology',   basePrice: 875,  beta: 1.7 },
  { symbol: 'AMD',   name: 'Advanced Micro Devices',      sector: 'Technology',   basePrice: 168,  beta: 1.6 },
  { symbol: 'META',  name: 'Meta Platforms',              sector: 'Technology',   basePrice: 510,  beta: 1.3 },
  { symbol: 'PLTR',  name: 'Palantir Technologies',       sector: 'Technology',   basePrice: 22,   beta: 1.9 },
  { symbol: 'NET',   name: 'Cloudflare Inc',              sector: 'Technology',   basePrice: 90,   beta: 1.5 },
  { symbol: 'DDOG',  name: 'Datadog Inc',                 sector: 'Technology',   basePrice: 128,  beta: 1.4 },
  { symbol: 'CRWD',  name: 'CrowdStrike Holdings',        sector: 'Technology',   basePrice: 310,  beta: 1.4 },
  { symbol: 'SNOW',  name: 'Snowflake Inc',               sector: 'Technology',   basePrice: 195,  beta: 1.6 },
  { symbol: 'TSLA',  name: 'Tesla Inc',                   sector: 'Automotive',   basePrice: 248,  beta: 2.0 },
  { symbol: 'RIVN',  name: 'Rivian Automotive',           sector: 'Automotive',   basePrice: 14,   beta: 2.2 },
  { symbol: 'COIN',  name: 'Coinbase Global',             sector: 'Finance',      basePrice: 228,  beta: 2.5 },
  { symbol: 'SHOP',  name: 'Shopify Inc',                 sector: 'E-Commerce',   basePrice: 80,   beta: 1.5 },
  { symbol: 'MRNA',  name: 'Moderna Inc',                 sector: 'Healthcare',   basePrice: 98,   beta: 1.8 },
  { symbol: 'ENPH',  name: 'Enphase Energy',              sector: 'Clean Energy', basePrice: 130,  beta: 1.7 },
  { symbol: 'AI',    name: 'C3.ai Inc',                   sector: 'Technology',   basePrice: 28,   beta: 2.1 },
]

// ─── Seeded PRNG ──────────────────────────────────────────────────────────────

function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

// ─── Initial 90-day history simulation ────────────────────────────────────────

function generateHistory(basePrice: number, beta: number, symbol: string, days = 90): PriceHistory {
  const seed = symbol.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const rand = seededRand(seed + Math.floor(Date.now() / 86400000))
  const avgVol = basePrice < 50 ? 15_000_000 : basePrice < 200 ? 8_000_000 : 3_000_000

  const out: PriceHistory = { timestamps: [], open: [], high: [], low: [], close: [], volume: [] }
  let price = basePrice * (0.80 + rand() * 0.40)
  const now = Date.now()

  for (let i = days; i >= 0; i--) {
    const r = seededRand(seed + i)
    const drift = 0.0003 * beta
    const change = (r() - 0.49) * 0.018 * beta * 2 + drift
    const o = price
    price = price * (1 + change)
    out.timestamps.push(now - i * 86400000)
    out.open.push(parseFloat(o.toFixed(2)))
    out.high.push(parseFloat((price * (1 + r() * 0.012 * beta)).toFixed(2)))
    out.low.push(parseFloat((price * (1 - r() * 0.012 * beta)).toFixed(2)))
    out.close.push(parseFloat(price.toFixed(2)))
    out.volume.push(Math.round(avgVol * (0.5 + r() * 1.5)))
  }
  return out
}

// ─── In-memory rolling history (key insight: history grows with each tick) ────

const _histories = new Map<string, PriceHistory>()
const _prevPrices = new Map<string, number>()

export function initHistories(): void {
  for (const m of WATCHLIST) {
    if (!_histories.has(m.symbol)) {
      const h = generateHistory(m.basePrice, m.beta, m.symbol)
      _histories.set(m.symbol, h)
      _prevPrices.set(m.symbol, h.close[h.close.length - 2] ?? h.close[h.close.length - 1])
    }
  }
}

function appendBar(meta: typeof WATCHLIST[0]): void {
  const h = _histories.get(meta.symbol)!
  const last = h.close[h.close.length - 1]
  const r = seededRand(meta.symbol.charCodeAt(0) * 31 + Date.now())
  const noise = (r() - 0.495) * 0.008 * meta.beta
  const newClose = parseFloat((last * (1 + noise)).toFixed(2))
  const newHigh  = parseFloat((Math.max(last, newClose) * (1 + r() * 0.005)).toFixed(2))
  const newLow   = parseFloat((Math.min(last, newClose) * (1 - r() * 0.005)).toFixed(2))
  const avgVol   = h.volume.slice(-10).reduce((a, b) => a + b, 0) / 10
  const newVol   = Math.round(avgVol * (0.6 + r() * 0.8))

  _prevPrices.set(meta.symbol, last)

  // Rolling window: keep at most 90 bars
  if (h.close.length >= 90) {
    h.timestamps.shift(); h.open.shift(); h.high.shift()
    h.low.shift(); h.close.shift(); h.volume.shift()
  }
  h.timestamps.push(Date.now())
  h.open.push(parseFloat(last.toFixed(2)))
  h.high.push(newHigh)
  h.low.push(newLow)
  h.close.push(newClose)
  h.volume.push(newVol)
}

function buildQuote(meta: typeof WATCHLIST[0]): StockQuote {
  const h   = _histories.get(meta.symbol)!
  const price = h.close[h.close.length - 1]
  const prev  = _prevPrices.get(meta.symbol) ?? h.close[h.close.length - 2] ?? price
  const avgVol = h.volume.slice(-20).reduce((a, b) => a + b, 0) / 20

  return {
    symbol:        meta.symbol,
    name:          meta.name,
    price,
    change:        parseFloat((price - prev).toFixed(2)),
    changePercent: parseFloat(((price - prev) / prev * 100).toFixed(2)),
    dayHigh:       Math.max(...h.high.slice(-1)),
    dayLow:        Math.min(...h.low.slice(-1)),
    volume:        h.volume[h.volume.length - 1],
    avgVolume:     Math.round(avgVol),
    marketCap:     Math.round(price * (meta.basePrice < 50 ? 8e9 : meta.basePrice < 200 ? 40e9 : 200e9)),
    high52w:       Math.max(...h.high) * 1.05,
    low52w:        Math.min(...h.low)  * 0.95,
    sector:        meta.sector,
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getAllAnalyses(): GrowthAnalysis[] {
  initHistories()
  return rankAnalyses(
    WATCHLIST.map(m => ({
      ...analyzeGrowthPotential(buildQuote(m), _histories.get(m.symbol)!),
      rank: 0,
    })),
  )
}

/** Advance one price tick and return fresh ranked analyses */
export function tickAll(): GrowthAnalysis[] {
  for (const m of WATCHLIST) appendBar(m)
  return rankAnalyses(
    WATCHLIST.map(m => ({
      ...analyzeGrowthPotential(buildQuote(m), _histories.get(m.symbol)!),
      rank: 0,
    })),
  )
}

function rankAnalyses(list: GrowthAnalysis[]): GrowthAnalysis[] {
  list.sort((a, b) => b.scores.composite - a.scores.composite)
  list.forEach((a, i) => { a.rank = i + 1 })
  return list
}
