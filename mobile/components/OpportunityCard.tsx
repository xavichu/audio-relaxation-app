import React, { useRef, useState } from 'react'
import {
  Animated,
  LayoutAnimation,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
  Platform,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import type { GrowthAnalysis, Signal } from '../lib/investment-algorithm'
import ScoreMeter from './ScoreMeter'
import ScoreRing from './ScoreRing'

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

const SIGNAL: Record<Signal, { label: string; bg: string; text: string; border: string }> = {
  STRONG_BUY: { label: 'Strong Buy', bg: 'rgba(16,185,129,0.18)',  text: '#10b981', border: 'rgba(16,185,129,0.35)' },
  BUY:        { label: 'Buy',        bg: 'rgba(34,197,94,0.12)',   text: '#22c55e', border: 'rgba(34,197,94,0.25)'  },
  WATCH:      { label: 'Watch',      bg: 'rgba(245,158,11,0.12)',  text: '#f59e0b', border: 'rgba(245,158,11,0.25)' },
  AVOID:      { label: 'Avoid',      bg: 'rgba(239,68,68,0.12)',   text: '#ef4444', border: 'rgba(239,68,68,0.25)'  },
}

const SCORE_COLORS = {
  momentum: '#8b5cf6',
  trend:    '#3b82f6',
  volume:   '#06b6d4',
  breakout: '#f97316',
}

const CONF_COLOR: Record<string, string> = {
  HIGH: '#10b981', MEDIUM: '#f59e0b', LOW: 'rgba(255,255,255,0.3)',
}

function fmtPrice(v: number) {
  return v >= 1000
    ? `$${v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    : `$${v.toFixed(2)}`
}
function fmtCap(v: number) {
  if (v >= 1e12) return `$${(v / 1e12).toFixed(1)}T`
  if (v >= 1e9)  return `$${(v / 1e9).toFixed(1)}B`
  return `$${(v / 1e6).toFixed(0)}M`
}
function fmtVol(v: number) {
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`
  if (v >= 1e3) return `${(v / 1e3).toFixed(0)}K`
  return `${v}`
}

interface Props { analysis: GrowthAnalysis }

export default function OpportunityCard({ analysis }: Props) {
  const [expanded, setExpanded] = useState(false)
  const { quote, scores, signal, confidence, priceTarget, catalysts, risks, technicals, rank } = analysis
  const sig  = SIGNAL[signal]
  const isUp = quote.changePercent >= 0

  function toggle() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setExpanded(v => !v)
  }

  return (
    <View style={[s.card, { borderColor: sig.border }]}>
      {/* ── Header row ── */}
      <View style={s.header}>
        {/* Rank badge */}
        <View style={s.rankBadge}>
          <Text style={s.rankText}>#{rank}</Text>
        </View>

        {/* Score ring */}
        <ScoreRing score={scores.composite} size={52} />

        {/* Symbol + meta */}
        <View style={s.meta}>
          <View style={s.symbolRow}>
            <Text style={s.symbol}>{quote.symbol}</Text>
            <View style={[s.sigBadge, { backgroundColor: sig.bg, borderColor: sig.border }]}>
              <Text style={[s.sigText, { color: sig.text }]}>{sig.label}</Text>
            </View>
          </View>
          <Text style={s.name} numberOfLines={1}>{quote.name}</Text>
          <View style={s.confRow}>
            <Text style={s.sector}>{quote.sector}</Text>
            <Text style={[s.conf, { color: CONF_COLOR[confidence] }]}>
              {confidence} confidence
            </Text>
          </View>
        </View>

        {/* Price */}
        <View style={s.priceBlock}>
          <Text style={s.price}>{fmtPrice(quote.price)}</Text>
          <View style={s.changeRow}>
            <Feather
              name={isUp ? 'trending-up' : 'trending-down'}
              size={11}
              color={isUp ? '#10b981' : '#ef4444'}
            />
            <Text style={[s.change, { color: isUp ? '#10b981' : '#ef4444' }]}>
              {isUp ? '+' : ''}{quote.changePercent.toFixed(2)}%
            </Text>
          </View>
          <Text style={s.cap}>{fmtCap(quote.marketCap)}</Text>
        </View>
      </View>

      {/* ── Score bars 2×2 ── */}
      <View style={s.barsGrid}>
        <View style={s.barsCol}>
          <ScoreMeter label="Momentum" value={scores.momentum} color={SCORE_COLORS.momentum} />
          <ScoreMeter label="Trend"    value={scores.trend}    color={SCORE_COLORS.trend}    />
        </View>
        <View style={s.barsCol}>
          <ScoreMeter label="Volume"   value={scores.volume}   color={SCORE_COLORS.volume}   />
          <ScoreMeter label="Breakout" value={scores.breakout} color={SCORE_COLORS.breakout} />
        </View>
      </View>

      {/* ── Price target strip ── */}
      <View style={s.targetStrip}>
        <Feather name="crosshair" size={11} color="rgba(255,255,255,0.4)" />
        <Text style={s.targetLabel}>Target</Text>
        <Text style={s.targetLow}>{fmtPrice(priceTarget.low)}</Text>
        <Text style={s.targetMid}>{fmtPrice(priceTarget.mid)}</Text>
        <Text style={s.targetHigh}>{fmtPrice(priceTarget.high)}</Text>
        <View style={{ flex: 1 }} />
        <Text style={s.upside}>+{priceTarget.upsidePct}%</Text>
      </View>

      {/* ── Expand toggle ── */}
      <Pressable onPress={toggle} style={s.expandBtn}>
        <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={12} color="rgba(255,255,255,0.3)" />
        <Text style={s.expandTxt}>{expanded ? 'Hide details' : 'Technicals & signals'}</Text>
      </Pressable>

      {/* ── Expanded section ── */}
      {expanded && (
        <View style={s.expandBody}>
          {/* 3×3 technicals grid */}
          <View style={s.techGrid}>
            {[
              ['RSI 14',  technicals.rsi14.toFixed(1)],
              ['MACD',    technicals.macd.toFixed(3)],
              ['Vol ×',   technicals.volumeRatio.toFixed(2)],
              ['SMA 20',  fmtPrice(technicals.sma20)],
              ['SMA 50',  fmtPrice(technicals.sma50)],
              ['BB Width',`${(technicals.bbBandwidth * 100).toFixed(1)}%`],
              ['Mom 1d',  `${technicals.mom1d >= 0 ? '+' : ''}${technicals.mom1d.toFixed(1)}%`],
              ['Mom 5d',  `${technicals.mom5d >= 0 ? '+' : ''}${technicals.mom5d.toFixed(1)}%`],
              ['ATR',     fmtPrice(technicals.atr14)],
            ].map(([lbl, val]) => (
              <View key={lbl} style={s.techCell}>
                <Text style={s.techLbl}>{lbl}</Text>
                <Text style={s.techVal}>{val}</Text>
              </View>
            ))}
          </View>

          {/* Catalysts */}
          {catalysts.length > 0 && (
            <View style={s.section}>
              <View style={s.sectionHead}>
                <Feather name="zap" size={10} color="#10b981" />
                <Text style={[s.sectionTitle, { color: '#10b981' }]}>Catalysts</Text>
              </View>
              {catalysts.map((c, i) => (
                <Text key={i} style={s.bullet}>
                  <Text style={{ color: '#10b981' }}>• </Text>{c}
                </Text>
              ))}
            </View>
          )}

          {/* Risks */}
          {risks.length > 0 && (
            <View style={s.section}>
              <View style={s.sectionHead}>
                <Feather name="alert-triangle" size={10} color="#f59e0b" />
                <Text style={[s.sectionTitle, { color: '#f59e0b' }]}>Risk factors</Text>
              </View>
              {risks.map((r, i) => (
                <Text key={i} style={s.bullet}>
                  <Text style={{ color: '#f59e0b' }}>• </Text>{r}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 10,
    overflow: 'hidden',
  },
  header:     { flexDirection: 'row', alignItems: 'flex-start', padding: 12, gap: 10 },
  rankBadge:  { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  rankText:   { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.5)' },
  meta:       { flex: 1, minWidth: 0 },
  symbolRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  symbol:     { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  sigBadge:   { borderWidth: 1, borderRadius: 20, paddingHorizontal: 7, paddingVertical: 2 },
  sigText:    { fontSize: 9, fontWeight: '700' },
  name:       { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  confRow:    { flexDirection: 'row', gap: 8, marginTop: 2 },
  sector:     { fontSize: 9, color: 'rgba(255,255,255,0.25)' },
  conf:       { fontSize: 9, fontWeight: '600' },
  priceBlock: { alignItems: 'flex-end' },
  price:      { fontSize: 17, fontWeight: '700', color: '#fff', fontVariant: ['tabular-nums'] },
  changeRow:  { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
  change:     { fontSize: 11, fontWeight: '600', fontVariant: ['tabular-nums'] },
  cap:        { fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 2 },

  barsGrid: { flexDirection: 'row', gap: 10, paddingHorizontal: 12, paddingBottom: 10 },
  barsCol:  { flex: 1, gap: 6 },

  targetStrip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginHorizontal: 12, marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7,
  },
  targetLabel: { fontSize: 10, color: 'rgba(255,255,255,0.4)' },
  targetLow:   { fontSize: 10, color: 'rgba(255,255,255,0.35)', fontVariant: ['tabular-nums'] },
  targetMid:   { fontSize: 11, fontWeight: '700', color: '#fff', fontVariant: ['tabular-nums'] },
  targetHigh:  { fontSize: 10, color: 'rgba(255,255,255,0.35)', fontVariant: ['tabular-nums'] },
  upside:      { fontSize: 11, fontWeight: '700', color: '#10b981' },

  expandBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingBottom: 10,
  },
  expandTxt: { fontSize: 10, color: 'rgba(255,255,255,0.3)' },

  expandBody: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    padding: 12,
    gap: 12,
  },
  techGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  techCell: {
    width: '30%', backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8, padding: 8, alignItems: 'center',
  },
  techLbl: { fontSize: 8, color: 'rgba(255,255,255,0.35)', marginBottom: 2 },
  techVal: { fontSize: 11, fontWeight: '600', color: '#fff', fontVariant: ['tabular-nums'] },

  section:     { gap: 4 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 2 },
  sectionTitle:{ fontSize: 10, fontWeight: '700' },
  bullet:      { fontSize: 11, color: 'rgba(255,255,255,0.55)', lineHeight: 17 },
})
