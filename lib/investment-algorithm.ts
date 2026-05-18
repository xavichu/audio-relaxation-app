// ─── Types ───────────────────────────────────────────────────────────────────

export type Signal = 'STRONG_BUY' | 'BUY' | 'WATCH' | 'AVOID'
export type Confidence = 'HIGH' | 'MEDIUM' | 'LOW'

export interface PriceHistory {
  timestamps: number[]
  open: number[]
  high: number[]
  low: number[]
  close: number[]
  volume: number[]
}

export interface StockQuote {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  dayHigh: number
  dayLow: number
  volume: number
  avgVolume: number
  marketCap: number
  high52w: number
  low52w: number
  sector: string
}

export interface TechnicalSnapshot {
  rsi14: number
  macd: number
  macdSignal: number
  macdHistogram: number
  sma20: number
  sma50: number
  ema12: number
  ema26: number
  bbUpper: number
  bbMiddle: number
  bbLower: number
  bbBandwidth: number
  volumeRatio: number
  atr14: number
  mom1d: number
  mom5d: number
  mom20d: number
}

export interface ScoreBreakdown {
  momentum: number   // 0-100
  trend: number      // 0-100
  volume: number     // 0-100
  breakout: number   // 0-100
  composite: number  // 0-100 weighted
}

export interface GrowthAnalysis {
  quote: StockQuote
  technicals: TechnicalSnapshot
  scores: ScoreBreakdown
  signal: Signal
  confidence: Confidence
  priceTarget: {
    low: number
    mid: number
    high: number
    upsidePct: number
  }
  catalysts: string[]
  risks: string[]
  rank: number
  updatedAt: string
}

// ─── Math helpers ─────────────────────────────────────────────────────────────

/** Wilder's RSI */
export function calcRSI(prices: number[], period = 14): number {
  if (prices.length < period + 1) return 50
  let avgGain = 0, avgLoss = 0
  for (let i = 1; i <= period; i++) {
    const d = prices[i] - prices[i - 1]
    if (d > 0) avgGain += d; else avgLoss -= d
  }
  avgGain /= period; avgLoss /= period
  for (let i = period + 1; i < prices.length; i++) {
    const d = prices[i] - prices[i - 1]
    avgGain = (avgGain * (period - 1) + (d > 0 ? d : 0)) / period
    avgLoss = (avgLoss * (period - 1) + (d < 0 ? -d : 0)) / period
  }
  if (avgLoss === 0) return 100
  return 100 - 100 / (1 + avgGain / avgLoss)
}

export function calcEMA(prices: number[], period: number): number {
  if (prices.length === 0) return 0
  if (prices.length < period) return prices[prices.length - 1]
  const k = 2 / (period + 1)
  let ema = prices.slice(0, period).reduce((s, v) => s + v, 0) / period
  for (let i = period; i < prices.length; i++) ema = prices[i] * k + ema * (1 - k)
  return ema
}

export function calcSMA(prices: number[], period: number): number {
  const slice = prices.slice(-Math.min(period, prices.length))
  return slice.reduce((s, v) => s + v, 0) / slice.length
}

export function calcMACD(prices: number[]): { line: number; signal: number; histogram: number } {
  if (prices.length < 35) return { line: 0, signal: 0, histogram: 0 }
  const macdSeries: number[] = []
  for (let i = 26; i <= prices.length; i++) {
    const s = prices.slice(0, i)
    macdSeries.push(calcEMA(s, 12) - calcEMA(s, 26))
  }
  const line = macdSeries[macdSeries.length - 1]
  const signal = calcEMA(macdSeries, 9)
  return { line, signal, histogram: line - signal }
}

export function calcBB(prices: number[], period = 20, mult = 2) {
  const middle = calcSMA(prices, period)
  const slice = prices.slice(-period)
  const variance = slice.reduce((s, p) => s + (p - middle) ** 2, 0) / period
  const sd = Math.sqrt(variance)
  return {
    upper: middle + mult * sd,
    middle,
    lower: middle - mult * sd,
    bandwidth: middle > 0 ? (mult * 2 * sd) / middle : 0,
  }
}

export function calcATR(highs: number[], lows: number[], closes: number[], period = 14): number {
  if (highs.length < 2) return 0
  const trs: number[] = []
  for (let i = 1; i < highs.length; i++) {
    trs.push(Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1]),
    ))
  }
  return calcSMA(trs, Math.min(period, trs.length))
}

// ─── Main scoring algorithm ───────────────────────────────────────────────────

export function analyzeGrowthPotential(
  quote: StockQuote,
  history: PriceHistory,
): Omit<GrowthAnalysis, 'rank'> {
  const c = history.close
  const vol = history.volume
  const n = c.length
  const price = c[n - 1] ?? quote.price

  const rsi14       = calcRSI(c)
  const { line: macd, signal: macdSignal, histogram: macdHistogram } = calcMACD(c)
  const sma20       = calcSMA(c, 20)
  const sma50       = calcSMA(c, Math.min(50, n))
  const ema12       = calcEMA(c, 12)
  const ema26       = calcEMA(c, 26)
  const bb          = calcBB(c)
  const atr14       = calcATR(history.high, history.low, c)
  const volumeRatio = quote.avgVolume > 0 ? quote.volume / quote.avgVolume : 1

  const mom1d  = quote.changePercent
  const mom5d  = n >= 6  ? ((price - c[n - 6])  / c[n - 6])  * 100 : 0
  const mom20d = n >= 21 ? ((price - c[n - 21]) / c[n - 21]) * 100 : 0

  const technicals: TechnicalSnapshot = {
    rsi14, macd, macdSignal, macdHistogram,
    sma20, sma50, ema12, ema26,
    bbUpper: bb.upper, bbMiddle: bb.middle, bbLower: bb.lower,
    bbBandwidth: bb.bandwidth,
    volumeRatio, atr14, mom1d, mom5d, mom20d,
  }

  // ── MOMENTUM (0-100) ─────────────────────────────────────────
  let momentum = 0
  if (mom1d > 3) momentum += 30; else if (mom1d > 1) momentum += 18; else if (mom1d > 0) momentum += 8
  if (mom5d > 8) momentum += 30; else if (mom5d > 4) momentum += 20; else if (mom5d > 1) momentum += 10
  if (mom20d > 15) momentum += 25; else if (mom20d > 8) momentum += 15; else if (mom20d > 3) momentum += 8
  const distFromHigh = quote.high52w > 0 ? ((quote.high52w - price) / quote.high52w) * 100 : 50
  if (distFromHigh < 3) momentum += 15; else if (distFromHigh < 10) momentum += 8
  momentum = Math.min(100, momentum)

  // ── TREND (0-100) ────────────────────────────────────────────
  let trend = 0
  if (price > sma20) trend += 25
  if (price > sma50) trend += 25
  if (sma20 > sma50) trend += 20
  if (macd > 0)      trend += 15
  if (macd > macdSignal) trend += 10
  if (ema12 > ema26) trend += 5
  trend = Math.min(100, trend)

  // ── VOLUME (0-100) ───────────────────────────────────────────
  let volume = 0
  if (volumeRatio > 3) volume += 40; else if (volumeRatio > 2) volume += 30
    else if (volumeRatio > 1.5) volume += 20; else if (volumeRatio > 1.2) volume += 10
  if (mom1d > 0 && volumeRatio > 1.5) volume += 35
  else if (mom1d > 0 && volumeRatio > 1.2) volume += 20
  if (n >= 20) {
    const vol5  = vol.slice(-5).reduce((a, b) => a + b, 0) / 5
    const vol20 = vol.slice(-20).reduce((a, b) => a + b, 0) / 20
    if (vol5 > vol20 * 1.4) volume += 25; else if (vol5 > vol20 * 1.2) volume += 12
  }
  volume = Math.min(100, volume)

  // ── BREAKOUT (0-100) ─────────────────────────────────────────
  let breakout = 0
  if      (rsi14 >= 50 && rsi14 <= 65) breakout += 35
  else if (rsi14 >= 40 && rsi14 < 50)  breakout += 15
  else if (rsi14 < 30)                 breakout += 20
  else if (rsi14 > 65 && rsi14 <= 75)  breakout += 22
  const bbRange    = bb.upper - bb.lower
  const priceInBB  = bbRange > 0 ? (price - bb.lower) / bbRange : 0.5
  if      (priceInBB > 0.8) breakout += 20
  else if (priceInBB > 0.6) breakout += 30
  else if (priceInBB > 0.5) breakout += 15
  if      (bb.bandwidth < 0.04) breakout += 25
  else if (bb.bandwidth < 0.07) breakout += 12
  if (macdHistogram > 0 && macd > 0) breakout += 20
  breakout = Math.min(100, breakout)

  // ── COMPOSITE ─────────────────────────────────────────────────
  const composite = Math.round(
    momentum * 0.30 +
    trend    * 0.28 +
    volume   * 0.22 +
    breakout * 0.20,
  )

  const signal: Signal =
    composite >= 72 ? 'STRONG_BUY' :
    composite >= 52 ? 'BUY'        :
    composite >= 35 ? 'WATCH'      : 'AVOID'

  const strongCount = [momentum > 65, trend > 65, volume > 65, breakout > 65].filter(Boolean).length
  const confidence: Confidence = strongCount >= 3 ? 'HIGH' : strongCount >= 2 ? 'MEDIUM' : 'LOW'

  // ── PRICE TARGETS ─────────────────────────────────────────────
  const upFactor = composite / 100
  const midTarget  = price * (1 + 0.05 + upFactor * 0.15)
  const lowTarget  = price * (1 + 0.02 + upFactor * 0.05)
  const highTarget = price * (1 + 0.10 + upFactor * 0.30)

  // ── CATALYSTS & RISKS ─────────────────────────────────────────
  const catalysts: string[] = []
  if (volumeRatio > 1.8) catalysts.push(`Volume ${volumeRatio.toFixed(1)}× avg — institutional activity`)
  if (sma20 > sma50)     catalysts.push('Golden cross: SMA20 above SMA50')
  if (rsi14 >= 50 && rsi14 <= 65) catalysts.push(`RSI ${rsi14.toFixed(0)} — bullish momentum zone`)
  if (macd > 0 && macd > macdSignal) catalysts.push('MACD bullish crossover confirmed')
  if (mom5d > 5)  catalysts.push(`+${mom5d.toFixed(1)}% weekly momentum — trend continuation`)
  if (distFromHigh < 8) catalysts.push(`Near 52-week high (${distFromHigh.toFixed(1)}% below)`)
  if (bb.bandwidth < 0.05) catalysts.push('Bollinger Band squeeze — explosive move likely')
  if (price > sma20 && price > sma50) catalysts.push('Price above all key moving averages')

  const risks: string[] = []
  if (rsi14 > 75)          risks.push(`RSI ${rsi14.toFixed(0)} — overbought, pullback risk`)
  if (volumeRatio < 0.7)   risks.push('Below-average volume — weak conviction')
  if (macd < 0)            risks.push('MACD negative — bearish pressure')
  if (price < sma50)       risks.push('Price below 50-day SMA — bearish trend')
  if (mom20d < -8)         risks.push(`−${Math.abs(mom20d).toFixed(1)}% monthly — downtrend`)

  return {
    quote,
    technicals,
    scores: { momentum, trend, volume, breakout, composite },
    signal,
    confidence,
    priceTarget: {
      low:       parseFloat(lowTarget.toFixed(2)),
      mid:       parseFloat(midTarget.toFixed(2)),
      high:      parseFloat(highTarget.toFixed(2)),
      upsidePct: parseFloat(((midTarget - price) / price * 100).toFixed(1)),
    },
    catalysts: catalysts.slice(0, 4),
    risks:     risks.slice(0, 3),
    updatedAt: new Date().toISOString(),
  }
}
