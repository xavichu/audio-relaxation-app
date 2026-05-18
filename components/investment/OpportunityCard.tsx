'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp, Target, AlertTriangle, Zap } from 'lucide-react'
import type { GrowthAnalysis, Signal } from '@/lib/investment-algorithm'
import ScoreMeter from './ScoreMeter'

const SIGNAL_META: Record<Signal, { label: string; bg: string; text: string; ring: string }> = {
  STRONG_BUY: { label: 'Strong Buy', bg: 'bg-emerald-500/20', text: 'text-emerald-400', ring: 'ring-emerald-500/40' },
  BUY:        { label: 'Buy',        bg: 'bg-green-500/15',   text: 'text-green-400',   ring: 'ring-green-500/30'  },
  WATCH:      { label: 'Watch',      bg: 'bg-amber-500/15',   text: 'text-amber-400',   ring: 'ring-amber-500/30'  },
  AVOID:      { label: 'Avoid',      bg: 'bg-red-500/15',     text: 'text-red-400',     ring: 'ring-red-500/30'    },
}

const CONF_COLOR: Record<string, string> = {
  HIGH:   'text-emerald-400',
  MEDIUM: 'text-amber-400',
  LOW:    'text-white/40',
}

const SCORE_COLORS: Record<string, string> = {
  momentum: 'bg-violet-500',
  trend:    'bg-blue-500',
  volume:   'bg-cyan-500',
  breakout: 'bg-orange-500',
}

function fmtPrice(v: number) {
  return v >= 1000 ? `$${v.toLocaleString('en-US', { minimumFractionDigits: 0 })}` : `$${v.toFixed(2)}`
}

function fmtCap(v: number) {
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`
  if (v >= 1e9)  return `$${(v / 1e9).toFixed(1)}B`
  if (v >= 1e6)  return `$${(v / 1e6).toFixed(0)}M`
  return `$${v.toLocaleString()}`
}

interface Props {
  analysis: GrowthAnalysis
  style?: React.CSSProperties
}

export default function OpportunityCard({ analysis, style }: Props) {
  const [expanded, setExpanded] = useState(false)
  const { quote, scores, signal, confidence, priceTarget, catalysts, risks, technicals, rank } = analysis
  const meta = SIGNAL_META[signal]
  const isUp = quote.changePercent >= 0

  // Composite score ring color
  const ringColor = scores.composite >= 70 ? '#10b981' : scores.composite >= 50 ? '#22c55e' : scores.composite >= 35 ? '#f59e0b' : '#ef4444'
  const circumference = 2 * Math.PI * 18
  const strokeDash = (scores.composite / 100) * circumference

  return (
    <div
      className={`rounded-2xl border border-white/8 bg-white/[0.04] backdrop-blur transition-all duration-300 ${meta.ring} ring-1 hover:bg-white/[0.07]`}
      style={style}
    >
      {/* ── Header ── */}
      <div className="p-4 flex items-start gap-3">
        {/* Rank */}
        <div className="shrink-0 w-7 h-7 rounded-full bg-white/8 flex items-center justify-center text-xs font-bold text-white/50">
          {rank}
        </div>

        {/* Score ring */}
        <div className="shrink-0 relative w-12 h-12">
          <svg viewBox="0 0 44 44" className="w-full h-full -rotate-90">
            <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
            <circle
              cx="22" cy="22" r="18" fill="none"
              stroke={ringColor} strokeWidth="4"
              strokeDasharray={`${strokeDash} ${circumference}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.8s ease' }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold tabular-nums">
            {scores.composite}
          </span>
        </div>

        {/* Symbol + name */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-bold tracking-tight">{quote.symbol}</span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.bg} ${meta.text}`}>
              {meta.label}
            </span>
            <span className={`text-[10px] ${CONF_COLOR[confidence]}`}>
              {confidence} confidence
            </span>
          </div>
          <div className="text-xs text-white/40 truncate">{quote.name}</div>
          <div className="text-[10px] text-white/30 mt-0.5">{quote.sector}</div>
        </div>

        {/* Price */}
        <div className="shrink-0 text-right">
          <div className="text-lg font-semibold tabular-nums">{fmtPrice(quote.price)}</div>
          <div className={`flex items-center gap-0.5 justify-end text-xs font-medium ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
            {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {isUp ? '+' : ''}{quote.changePercent.toFixed(2)}%
          </div>
          <div className="text-[10px] text-white/30 mt-0.5">
            Mkt cap {fmtCap(quote.marketCap)}
          </div>
        </div>
      </div>

      {/* ── Score bars ── */}
      <div className="px-4 pb-3 grid grid-cols-2 gap-x-4 gap-y-2">
        {(['momentum','trend','volume','breakout'] as const).map(k => (
          <ScoreMeter key={k} label={k.charAt(0).toUpperCase()+k.slice(1)} value={scores[k]} color={SCORE_COLORS[k]} small />
        ))}
      </div>

      {/* ── Price target bar ── */}
      <div className="mx-4 mb-3 rounded-xl bg-white/5 px-3 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 text-xs text-white/50">
          <Target size={12} />
          Price target
        </div>
        <div className="flex items-center gap-3 text-xs tabular-nums">
          <span className="text-white/40">{fmtPrice(priceTarget.low)}</span>
          <span className="font-semibold text-white">{fmtPrice(priceTarget.mid)}</span>
          <span className="text-white/40">{fmtPrice(priceTarget.high)}</span>
        </div>
        <span className="text-emerald-400 font-semibold text-xs">+{priceTarget.upsidePct}%</span>
      </div>

      {/* ── Expand toggle ── */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full px-4 pb-3 flex items-center gap-1.5 text-xs text-white/35 hover:text-white/60 transition-colors"
      >
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        {expanded ? 'Hide details' : 'Show technicals & signals'}
      </button>

      {/* ── Expanded details ── */}
      {expanded && (
        <div className="border-t border-white/8 px-4 py-3 space-y-3">
          {/* Technicals grid */}
          <div className="grid grid-cols-3 gap-2">
            {[
              ['RSI 14',  technicals.rsi14.toFixed(1)],
              ['MACD',    technicals.macd.toFixed(3)],
              ['Signal',  technicals.macdSignal.toFixed(3)],
              ['SMA 20',  fmtPrice(technicals.sma20)],
              ['SMA 50',  fmtPrice(technicals.sma50)],
              ['Vol ×',   technicals.volumeRatio.toFixed(2)],
              ['BB Width',`${(technicals.bbBandwidth * 100).toFixed(1)}%`],
              ['ATR',     fmtPrice(technicals.atr14)],
              ['Mom 5d',  `${technicals.mom5d >= 0 ? '+' : ''}${technicals.mom5d.toFixed(1)}%`],
            ].map(([label, val]) => (
              <div key={label} className="rounded-lg bg-white/5 px-2 py-1.5 text-center">
                <div className="text-[9px] text-white/35 mb-0.5">{label}</div>
                <div className="text-xs font-semibold tabular-nums">{val}</div>
              </div>
            ))}
          </div>

          {/* Catalysts */}
          {catalysts.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold mb-1.5">
                <Zap size={10} /> Catalysts
              </div>
              <ul className="space-y-1">
                {catalysts.map((cat: string, i: number) => (
                  <li key={i} className="text-[11px] text-white/55 flex gap-1.5">
                    <span className="text-emerald-500 shrink-0">•</span>{cat}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Risks */}
          {risks.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-semibold mb-1.5">
                <AlertTriangle size={10} /> Risk factors
              </div>
              <ul className="space-y-1">
                {risks.map((risk: string, i: number) => (
                  <li key={i} className="text-[11px] text-white/55 flex gap-1.5">
                    <span className="text-amber-500 shrink-0">•</span>{risk}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
