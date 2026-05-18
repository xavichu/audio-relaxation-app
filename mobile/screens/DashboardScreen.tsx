import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import type { GrowthAnalysis, Signal } from '../lib/investment-algorithm'
import { getAllAnalyses, tickAll } from '../lib/market-data'
import OpportunityCard from '../components/OpportunityCard'

type Filter = Signal | 'ALL'
type SortKey = 'rank' | 'changePercent' | 'momentum' | 'trend' | 'volume'

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'ALL',        label: 'All'        },
  { key: 'STRONG_BUY',label: 'Strong Buy'  },
  { key: 'BUY',       label: 'Buy'         },
  { key: 'WATCH',     label: 'Watch'       },
  { key: 'AVOID',     label: 'Avoid'       },
]

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'rank',         label: 'Score'    },
  { key: 'changePercent',label: 'Change'   },
  { key: 'momentum',     label: 'Momentum' },
  { key: 'trend',        label: 'Trend'    },
  { key: 'volume',       label: 'Volume'   },
]

function fmtTime(d: Date) {
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function DashboardScreen() {
  const insets  = useSafeAreaInsets()
  const [data,   setData]   = useState<GrowthAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter,  setFilter]  = useState<Filter>('ALL')
  const [sortKey, setSortKey] = useState<SortKey>('rank')
  const [lastTick, setLastTick] = useState<Date | null>(null)
  const [tickN,    setTickN]    = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const load = useCallback((isRefresh = false) => {
    if (!isRefresh) setLoading(true)
    // Run on next tick so UI doesn't freeze
    setTimeout(() => {
      const analyses = getAllAnalyses()
      setData(analyses)
      setLastTick(new Date())
      setLoading(false)
      setRefreshing(false)
    }, 0)
  }, [])

  useEffect(() => {
    load()
    timerRef.current = setInterval(() => {
      const analyses = tickAll()
      setData(analyses)
      setLastTick(new Date())
      setTickN(n => n + 1)
    }, 5000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [load])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    load(true)
  }, [load])

  // Derived filtered+sorted list
  const displayed = data
    .filter(a => filter === 'ALL' || a.signal === filter)
    .sort((a, b) => {
      switch (sortKey) {
        case 'rank':          return a.rank - b.rank
        case 'changePercent': return b.quote.changePercent - a.quote.changePercent
        case 'momentum':      return b.scores.momentum - a.scores.momentum
        case 'trend':         return b.scores.trend - a.scores.trend
        case 'volume':        return b.scores.volume - a.scores.volume
        default:              return 0
      }
    })

  const counts = {
    STRONG_BUY: data.filter(a => a.signal === 'STRONG_BUY').length,
    BUY:        data.filter(a => a.signal === 'BUY').length,
    WATCH:      data.filter(a => a.signal === 'WATCH').length,
    AVOID:      data.filter(a => a.signal === 'AVOID').length,
  }
  const avgScore = data.length
    ? Math.round(data.reduce((s, a) => s + a.scores.composite, 0) / data.length)
    : 0

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* ── Sticky header ── */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.logoBox}>
            <Feather name="trending-up" size={16} color="#fff" />
          </View>
          <View>
            <Text style={s.appTitle}>Growth Research</Text>
            <Text style={s.appSub}>AI-powered investment screener</Text>
          </View>
        </View>
        <View style={s.liveBox}>
          <View style={s.liveDot} />
          <Text style={s.liveTxt}>LIVE</Text>
          {lastTick && (
            <Text style={s.tickTxt}>#{tickN} · {fmtTime(lastTick)}</Text>
          )}
        </View>
      </View>

      {loading ? (
        <View style={s.loadingBox}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={s.loadingTxt}>Analysing {15} stocks…</Text>
        </View>
      ) : (
        <FlatList
          data={displayed}
          keyExtractor={(a: GrowthAnalysis) => a.quote.symbol}
          contentContainerStyle={[s.list, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#8b5cf6"
            />
          }
          ListHeaderComponent={
            <View style={s.listHeader}>
              {/* Summary chips */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chips}>
                <View style={[s.chip, { backgroundColor: 'rgba(16,185,129,0.15)' }]}>
                  <Text style={[s.chipTxt, { color: '#10b981' }]}>
                    Strong Buy <Text style={s.chipNum}>{counts.STRONG_BUY}</Text>
                  </Text>
                </View>
                <View style={[s.chip, { backgroundColor: 'rgba(34,197,94,0.12)' }]}>
                  <Text style={[s.chipTxt, { color: '#22c55e' }]}>
                    Buy <Text style={s.chipNum}>{counts.BUY}</Text>
                  </Text>
                </View>
                <View style={[s.chip, { backgroundColor: 'rgba(245,158,11,0.12)' }]}>
                  <Text style={[s.chipTxt, { color: '#f59e0b' }]}>
                    Watch <Text style={s.chipNum}>{counts.WATCH}</Text>
                  </Text>
                </View>
                <View style={[s.chip, { backgroundColor: 'rgba(239,68,68,0.12)' }]}>
                  <Text style={[s.chipTxt, { color: '#ef4444' }]}>
                    Avoid <Text style={s.chipNum}>{counts.AVOID}</Text>
                  </Text>
                </View>
                <View style={[s.chip, { backgroundColor: 'rgba(139,92,246,0.15)' }]}>
                  <Text style={[s.chipTxt, { color: '#a78bfa' }]}>
                    Avg score <Text style={s.chipNum}>{avgScore}</Text>
                  </Text>
                </View>
              </ScrollView>

              {/* Signal filter */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow}>
                {FILTERS.map(f => (
                  <Pressable
                    key={f.key}
                    onPress={() => setFilter(f.key)}
                    style={[s.filterBtn, filter === f.key && s.filterBtnActive]}
                  >
                    <Text style={[s.filterTxt, filter === f.key && s.filterTxtActive]}>
                      {f.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              {/* Sort row */}
              <View style={s.sortRow}>
                <Text style={s.sortLabel}>Sort:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {SORTS.map(sort => (
                    <Pressable
                      key={sort.key}
                      onPress={() => setSortKey(sort.key)}
                      style={[s.sortBtn, sortKey === sort.key && s.sortBtnActive]}
                    >
                      <Text style={[s.sortTxt, sortKey === sort.key && s.sortTxtActive]}>
                        {sort.label}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* Algorithm factor legend */}
              <View style={s.legend}>
                <Text style={s.legendTitle}>Algorithm weights</Text>
                <View style={s.legendRow}>
                  {[
                    { color: '#8b5cf6', label: 'Momentum 30%' },
                    { color: '#3b82f6', label: 'Trend 28%'    },
                    { color: '#06b6d4', label: 'Volume 22%'   },
                    { color: '#f97316', label: 'Breakout 20%' },
                  ].map(item => (
                    <View key={item.label} style={s.legendItem}>
                      <View style={[s.legendDot, { backgroundColor: item.color }]} />
                      <Text style={s.legendTxt}>{item.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          }
          ListEmptyComponent={
            <Text style={s.empty}>No stocks match this filter.</Text>
          }
          renderItem={({ item }: { item: GrowthAnalysis }) => <OpportunityCard analysis={item} />}
        />
      )}

      {/* ── Footer disclaimer ── */}
      <View style={[s.footer, { paddingBottom: insets.bottom + 4 }]}>
        <Text style={s.footerTxt}>
          Educational & research only · Not financial advice · Simulated market data
        </Text>
      </View>
    </View>
  )
}

const VIOLET = '#8b5cf6'

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: '#0a0a12' },

  header:      {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#0a0a12',
  },
  headerLeft:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBox:     {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(16,185,129,0.25)', alignItems: 'center', justifyContent: 'center',
  },
  appTitle:    { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  appSub:      { fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 1 },
  liveBox:     { flexDirection: 'row', alignItems: 'center', gap: 5 },
  liveDot:     { width: 7, height: 7, borderRadius: 4, backgroundColor: '#10b981' },
  liveTxt:     { fontSize: 11, fontWeight: '700', color: '#10b981', letterSpacing: 0.5 },
  tickTxt:     { fontSize: 9, color: 'rgba(255,255,255,0.25)' },

  loadingBox:  { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingTxt:  { fontSize: 13, color: 'rgba(255,255,255,0.4)' },

  list:        { paddingHorizontal: 12, paddingTop: 12 },
  listHeader:  { gap: 10, marginBottom: 12 },

  chips:       { flexGrow: 0, marginBottom: 0 },
  chip:        { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 },
  chipTxt:     { fontSize: 11, fontWeight: '500' },
  chipNum:     { fontWeight: '800' },

  filterRow:   { flexGrow: 0 },
  filterBtn:   {
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7,
    marginRight: 8, backgroundColor: 'rgba(255,255,255,0.06)',
  },
  filterBtnActive: { backgroundColor: VIOLET },
  filterTxt:    { fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: '500' },
  filterTxtActive:{ color: '#fff', fontWeight: '700' },

  sortRow:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sortLabel:   { fontSize: 11, color: 'rgba(255,255,255,0.35)' },
  sortBtn:     { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginRight: 4 },
  sortBtnActive: { backgroundColor: 'rgba(255,255,255,0.10)' },
  sortTxt:      { fontSize: 11, color: 'rgba(255,255,255,0.35)' },
  sortTxtActive: { color: '#fff', fontWeight: '600' },

  legend:      {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  legendTitle: { fontSize: 9, color: 'rgba(255,255,255,0.35)', fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  legendRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  legendItem:  { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot:   { width: 8, height: 8, borderRadius: 4 },
  legendTxt:   { fontSize: 10, color: 'rgba(255,255,255,0.5)' },

  empty:       { textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13, marginTop: 40 },

  footer:      {
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 8, paddingHorizontal: 16,
    backgroundColor: '#0a0a12',
  },
  footerTxt:   { fontSize: 9, color: 'rgba(255,255,255,0.2)', textAlign: 'center' },
})
