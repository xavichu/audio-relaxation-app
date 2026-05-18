'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  Activity, RefreshCw, TrendingUp, BarChart2, Zap, Shield, Eye
} from 'lucide-react'
import type { GrowthAnalysis, Signal } from '@/lib/investment-algorithm'
import OpportunityCard from './OpportunityCard'

type FilterSignal = Signal | 'ALL'
type SortKey = 'rank' | 'changePercent' | 'volume' | 'momentum' | 'trend'

const SIGNAL_FILTERS: { value: FilterSignal; label: string; icon: React.ReactNode }[] = [
  { value: 'ALL',        label: 'All',        icon: <BarChart2 size={12} /> },
  { value: 'STRONG_BUY',label: 'Strong Buy',  icon: <Zap size={12} /> },
  { value: 'BUY',        label: 'Buy',        icon: <TrendingUp size={12} /> },
  { value: 'WATCH',      label: 'Watch',      icon: <Eye size={12} /> },
  { value: 'AVOID',      label: 'Avoid',      icon: <Shield size={12} /> },
]

function fmtTime(ts: number) {
  return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function SummaryPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`rounded-full px-3 py-1.5 ${color} text-xs font-semibold`}>
      <span className="opacity-70">{label} </span>{value}
    </div>
  )
}

export default function ResearchDashboard() {
  const [analyses, setAnalyses]   = useState<GrowthAnalysis[]>([])
  const [connected, setConnected] = useState(false)
  const [lastTick, setLastTick]   = useState<number | null>(null)
  const [tickCount, setTickCount] = useState(0)
  const [filter, setFilter]       = useState<FilterSignal>('ALL')
  const [sortKey, setSortKey]     = useState<SortKey>('rank')
  const [loading, setLoading]     = useState(true)
  const esRef = useRef<EventSource | null>(null)

  const connect = useCallback(() => {
    if (esRef.current) { esRef.current.close(); esRef.current = null }
    setLoading(true)

    const es = new EventSource('/api/investment-research/stream')
    esRef.current = es

    es.onopen = () => { setConnected(true) }

    es.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data)
        if (msg.type === 'snapshot' || msg.type === 'tick') {
          setAnalyses(msg.data)
          setLastTick(msg.ts)
          setTickCount(c => c + 1)
          setLoading(false)
        }
      } catch { /* ignore parse errors */ }
    }

    es.onerror = () => {
      setConnected(false)
      es.close()
      esRef.current = null
      // Reconnect after 5 s
      setTimeout(connect, 5000)
    }
  }, [])

  useEffect(() => {
    connect()
    return () => { esRef.current?.close() }
  }, [connect])

  // Derived lists
  const filtered = analyses
    .filter(a => filter === 'ALL' || a.signal === filter)
    .sort((a, b) => {
      if (sortKey === 'rank')          return a.rank - b.rank
      if (sortKey === 'changePercent') return b.quote.changePercent - a.quote.changePercent
      if (sortKey === 'volume')        return b.scores.volume - a.scores.volume
      if (sortKey === 'momentum')      return b.scores.momentum - a.scores.momentum
      if (sortKey === 'trend')         return b.scores.trend - a.scores.trend
      return 0
    })

  const counts = {
    STRONG_BUY: analyses.filter(a => a.signal === 'STRONG_BUY').length,
    BUY:        analyses.filter(a => a.signal === 'BUY').length,
    WATCH:      analyses.filter(a => a.signal === 'WATCH').length,
    AVOID:      analyses.filter(a => a.signal === 'AVOID').length,
  }
  const avgScore = analyses.length
    ? Math.round(analyses.reduce((s, a) => s + a.scores.composite, 0) / analyses.length)
    : 0

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white">
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-20 bg-[#0a0a12]/90 backdrop-blur border-b border-white/8 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight">Growth Research</h1>
              <p className="text-[10px] text-white/40">AI-powered investment screener</p>
            </div>
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-xs text-white/50">{connected ? 'LIVE' : 'Reconnecting…'}</span>
            {lastTick && (
              <span className="text-[10px] text-white/30 hidden sm:inline">
                {fmtTime(lastTick)} · tick #{tickCount}
              </span>
            )}
            <button
              onClick={connect}
              className="ml-2 p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
              title="Reconnect"
            >
              <RefreshCw size={12} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">
        {/* ── Summary pills ── */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-1.5 text-xs text-white/40 mr-1">
            <Activity size={12} />
            Market signal
          </div>
          <SummaryPill label="Strong Buy" value={counts.STRONG_BUY} color="bg-emerald-500/15 text-emerald-400" />
          <SummaryPill label="Buy"        value={counts.BUY}        color="bg-green-500/10 text-green-400" />
          <SummaryPill label="Watch"      value={counts.WATCH}      color="bg-amber-500/10 text-amber-400" />
          <SummaryPill label="Avoid"      value={counts.AVOID}      color="bg-red-500/10 text-red-400" />
          <div className="ml-auto flex items-center gap-1 text-xs text-white/40">
            Avg score:
            <span className="font-semibold text-white ml-1">{avgScore}</span>
            <span className="text-white/20">/100</span>
          </div>
        </div>

        {/* ── Filter + sort ── */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          {/* Signal filter */}
          <div className="flex gap-1.5 flex-wrap">
            {SIGNAL_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filter === f.value
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/40'
                    : 'bg-white/6 text-white/50 hover:bg-white/10 hover:text-white/80'
                }`}
              >
                {f.icon}
                {f.label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 text-xs text-white/40">
            Sort:
            {(['rank','changePercent','momentum','trend','volume'] as SortKey[]).map(k => (
              <button
                key={k}
                onClick={() => setSortKey(k)}
                className={`px-2 py-1 rounded-lg transition-colors ${
                  sortKey === k ? 'bg-white/10 text-white' : 'hover:bg-white/6 text-white/40 hover:text-white/60'
                }`}
              >
                {{ rank: 'Score', changePercent: 'Change', momentum: 'Momentum', trend: 'Trend', volume: 'Volume' }[k]}
              </button>
            ))}
          </div>
        </div>

        {/* ── Algorithm explainer ── */}
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
          <div className="text-xs text-white/40 font-semibold mb-2 uppercase tracking-widest">Algorithm factors</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { name: 'Momentum (30%)',  desc: 'Price change 1d/5d/20d + 52W proximity', color: 'bg-violet-500' },
              { name: 'Trend (28%)',     desc: 'SMA cross, MACD, EMA alignment',          color: 'bg-blue-500'   },
              { name: 'Volume (22%)',    desc: 'Surge vs avg, sustained flow, day bias',   color: 'bg-cyan-500'   },
              { name: 'Breakout (20%)', desc: 'RSI zone, BB squeeze, histogram',          color: 'bg-orange-500' },
            ].map(f => (
              <div key={f.name} className="flex gap-2">
                <div className={`w-1.5 h-full rounded-full ${f.color} shrink-0 min-h-[36px]`} />
                <div>
                  <div className="text-[11px] font-semibold">{f.name}</div>
                  <div className="text-[10px] text-white/35 mt-0.5">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Stock cards ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
            <div className="text-sm text-white/40">Running analysis on {15} stocks…</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-white/30 text-sm">No stocks match this filter.</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((a, i) => (
              <OpportunityCard
                key={a.quote.symbol}
                analysis={a}
                style={{ animationDelay: `${i * 40}ms` }}
              />
            ))}
          </div>
        )}

        {/* ── Disclaimer ── */}
        <p className="text-[10px] text-white/20 text-center pb-4">
          For educational and research purposes only. Not financial advice. Past performance does not guarantee future results.
          Algorithmic signals use technical analysis and simulated market data.
        </p>
      </div>
    </div>
  )
}
