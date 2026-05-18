import {
  PriceHistory,
  StockQuote,
  GrowthAnalysis,
  analyzeGrowthPotential,
} from './investment-algorithm'

// ─── Watchlist ────────────────────────────────────────────────────────────────

export const WATCHLIST = [
  { symbol: 'NVDA',  name: 'NVIDIA Corporation',         sector: 'Technology',  basePrice: 875,  beta: 1.7 },
  { symbol: 'AMD',   name: 'Advanced Micro Devices',      sector: 'Technology',  basePrice: 168,  beta: 1.6 },
  { symbol: 'META',  name: 'Meta Platforms',              sector: 'Technology',  basePrice: 510,  beta: 1.3 },
  { symbol: 'PLTR',  name: 'Palantir Technologies',       sector: 'Technology',  basePrice: 22,   beta: 1.9 },
  { symbol: 'NET',   name: 'Cloudflare Inc',              sector: 'Technology',  basePrice: 90,   beta: 1.5 },
  { symbol: 'DDOG',  name: 'Datadog Inc',                 sector: 'Technology',  basePrice: 128,  beta: 1.4 },
  { symbol: 'CRWD',  name: 'CrowdStrike Holdings',        sector: 'Technology',  basePrice: 310,  beta: 1.4 },
  { symbol: 'SNOW',  name: 'Snowflake Inc',               sector: 'Technology',  basePrice: 195,  beta: 1.6 },
  { symbol: 'TSLA',  name: 'Tesla Inc',                   sector: 'Automotive',  basePrice: 248,  beta: 2.0 },
  { symbol: 'RIVN',  name: 'Rivian Automotive',           sector: 'Automotive',  basePrice: 14,   beta: 2.2 },
  { symbol: 'COIN',  name: 'Coinbase Global',             sector: 'Finance',     basePrice: 228,  beta: 2.5 },
  { symbol: 'SHOP',  name: 'Shopify Inc',                 sector: 'E-Commerce',  basePrice: 80,   beta: 1.5 },
  { symbol: 'MRNA',  name: 'Moderna Inc',                 sector: 'Healthcare',  basePrice: 98,   beta: 1.8 },
  { symbol: 'ENPH',  name: 'Enphase Energy',              sector: 'Clean Energy',basePrice: 130,  beta: 1.7 },
  { symbol: 'AI',    name: 'C3.ai Inc',                   sector: 'Technology',  basePrice: 28,   beta: 2.1 },
]

// ─── Seeded pseudo-random (deterministic per symbol+day) ─────────────────────

function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

// ─── Realistic price-history simulation ──────────────────────────────────────

export function generateHistory(
  basePrice: number,
  beta: number,
  symbol: string,
  days = 90,
): PriceHistory {
  const seed = symbol.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const rand = seededRand(seed + Math.floor(Date.now() / 86400000))

  const timestamps: number[] = []
  const open: number[] = []
  const high: number[] = []
  const low: number[] = []
  const close: number[] = []
  const volume: number[] = []

  const avgVol = basePrice < 50 ? 15_000_000 : basePrice < 200 ? 8_000_000 : 3_000_000
  let price = basePrice * (0.85 + rand() * 0.30)

  const now = Date.now()
  for (let i = days; i >= 0; i--) {
    const ts = now - i * 86400000
    const dayRand = seededRand(seed + i)
    const r = dayRand

    const drift      = 0.0003 * beta
    const dailyVol   = 0.018  * beta
    const change     = (r() - 0.49) * dailyVol * 2 + drift
    const o          = price
    price            = price * (1 + change)
    const intraVol   = 0.012 * beta
    const h          = price * (1 + r() * intraVol)
    const l          = price * (1 - r() * intraVol)
    const vol        = Math.round(avgVol * (0.5 + r() * 1.5))

    timestamps.push(ts)
    open.push(parseFloat(o.toFixed(2)))
    high.push(parseFloat(h.toFixed(2)))
    low.push(parseFloat(l.toFixed(2)))
    close.push(parseFloat(price.toFixed(2)))
    volume.push(vol)
  }

  return { timestamps, open, high, low, close, volume }
}

// ─── Yahoo Finance fetcher (server-side only) ─────────────────────────────────

async function fetchYahooHistory(symbol: string): Promise<PriceHistory | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=3mo&interval=1d&includePrePost=false`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' },
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) return null
    const json = await res.json()
    const result = json?.chart?.result?.[0]
    if (!result) return null
    const q = result.indicators.quote[0]
    const ts: number[]    = result.timestamp     ?? []
    const o: number[]     = q.open               ?? []
    const h: number[]     = q.high               ?? []
    const l: number[]     = q.low                ?? []
    const c: number[]     = q.close              ?? []
    const v: number[]     = q.volume             ?? []
    // Filter nulls
    const valid = ts.map((_, i) => i).filter(i => c[i] != null)
    return {
      timestamps: valid.map(i => ts[i] * 1000),
      open:       valid.map(i => o[i]),
      high:       valid.map(i => h[i]),
      low:        valid.map(i => l[i]),
      close:      valid.map(i => c[i]),
      volume:     valid.map(i => v[i] ?? 0),
    }
  } catch {
    return null
  }
}

async function fetchYahooQuote(symbol: string, meta: typeof WATCHLIST[0]): Promise<StockQuote | null> {
  try {
    const url = `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${symbol}&lang=en-US&region=US`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' },
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) return null
    const json  = await res.json()
    const q     = json?.quoteResponse?.result?.[0]
    if (!q) return null
    return {
      symbol,
      name:          q.longName           ?? meta.name,
      price:         q.regularMarketPrice ?? meta.basePrice,
      change:        q.regularMarketChange ?? 0,
      changePercent: q.regularMarketChangePercent ?? 0,
      dayHigh:       q.regularMarketDayHigh ?? 0,
      dayLow:        q.regularMarketDayLow  ?? 0,
      volume:        q.regularMarketVolume  ?? 0,
      avgVolume:     q.averageDailyVolume3Month ?? q.regularMarketVolume ?? 1,
      marketCap:     q.marketCap ?? 0,
      high52w:       q.fiftyTwoWeekHigh ?? meta.basePrice * 1.4,
      low52w:        q.fiftyTwoWeekLow  ?? meta.basePrice * 0.6,
      sector:        meta.sector,
    }
  } catch {
    return null
  }
}

// ─── Simulated real-time quote (adds intraday noise to simulated history) ─────

export function buildSimQuote(
  meta: typeof WATCHLIST[0],
  history: PriceHistory,
  deltaSeconds = 0,
): StockQuote {
  const rand  = seededRand(meta.symbol.charCodeAt(0) * 7 + Math.floor((Date.now() + deltaSeconds * 1000) / 5000))
  const r     = rand
  const last  = history.close[history.close.length - 1]
  const prev  = history.close[history.close.length - 2] ?? last
  const noise = (r() - 0.495) * 0.006 * meta.beta
  const price = parseFloat((last * (1 + noise)).toFixed(2))
  const avgVol = history.volume.slice(-20).reduce((a, b) => a + b, 0) / 20

  return {
    symbol:        meta.symbol,
    name:          meta.name,
    price,
    change:        parseFloat((price - prev).toFixed(2)),
    changePercent: parseFloat(((price - prev) / prev * 100).toFixed(2)),
    dayHigh:       parseFloat((price * (1 + r() * 0.015)).toFixed(2)),
    dayLow:        parseFloat((price * (1 - r() * 0.015)).toFixed(2)),
    volume:        Math.round(avgVol * (0.6 + r() * 1.8)),
    avgVolume:     Math.round(avgVol),
    marketCap:     Math.round(price * (meta.basePrice < 50 ? 8e9 : meta.basePrice < 200 ? 40e9 : 200e9)),
    high52w:       parseFloat((meta.basePrice * (1.2 + r() * 0.4)).toFixed(2)),
    low52w:        parseFloat((meta.basePrice * (0.5 + r() * 0.25)).toFixed(2)),
    sector:        meta.sector,
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function fetchAllAnalyses(useRealData = true): Promise<GrowthAnalysis[]> {
  const results: GrowthAnalysis[] = []

  for (const meta of WATCHLIST) {
    let quote:   StockQuote   | null = null
    let history: PriceHistory | null = null

    if (useRealData) {
      ;[quote, history] = await Promise.all([
        fetchYahooQuote(meta.symbol, meta),
        fetchYahooHistory(meta.symbol),
      ])
    }

    // Fall back to simulation if API failed
    if (!history) history = generateHistory(meta.basePrice, meta.beta, meta.symbol)
    if (!quote)   quote   = buildSimQuote(meta, history)

    const analysis = analyzeGrowthPotential(quote, history)
    results.push({ ...analysis, rank: 0 })
  }

  // Sort by composite score descending and assign ranks
  results.sort((a, b) => b.scores.composite - a.scores.composite)
  results.forEach((r, i) => { r.rank = i + 1 })

  return results
}

/** Lightweight tick update — shifts last close by small noise and recomputes */
export function tickAnalysis(prev: GrowthAnalysis): GrowthAnalysis {
  const meta   = WATCHLIST.find(w => w.symbol === prev.quote.symbol)!
  const rand   = seededRand(meta.symbol.charCodeAt(0) + Date.now())
  const r      = rand
  const noise  = (r() - 0.495) * 0.004 * meta.beta
  const newPrice = parseFloat((prev.quote.price * (1 + noise)).toFixed(2))

  const updatedQuote: StockQuote = {
    ...prev.quote,
    price:         newPrice,
    change:        parseFloat((newPrice - prev.quote.price + prev.quote.change).toFixed(2)),
    changePercent: parseFloat(((newPrice - prev.quote.price + prev.quote.change) / prev.quote.price * 100).toFixed(2)),
    volume:        Math.round(prev.quote.volume * (0.9 + r() * 0.2)),
  }

  // Simulate a small history append for recalc
  const fakeHistory: PriceHistory = {
    timestamps: [...Array(60)].map((_, i) => Date.now() - (60 - i) * 86400000),
    open:  [...Array(60)].map(() => newPrice * (0.98 + r() * 0.04)),
    high:  [...Array(60)].map(() => newPrice * (1 + r() * 0.02)),
    low:   [...Array(60)].map(() => newPrice * (0.97 + r() * 0.02)),
    close: [...Array(59)].map(() => newPrice * (0.97 + r() * 0.06)).concat([newPrice]),
    volume:[...Array(60)].map(() => updatedQuote.volume),
  }

  return { ...analyzeGrowthPotential(updatedQuote, fakeHistory), rank: prev.rank }
}
