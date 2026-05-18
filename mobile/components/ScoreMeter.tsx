import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

interface Props {
  label: string
  value: number
  color: string
}

export default function ScoreMeter({ label, value, color }: Props) {
  return (
    <View style={s.root}>
      <View style={s.row}>
        <Text style={s.label}>{label}</Text>
        <Text style={s.val}>{Math.round(value)}</Text>
      </View>
      <View style={s.track}>
        <View style={[s.fill, { width: `${Math.min(100, value)}%` as `${number}%`, backgroundColor: color }]} />
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  root:  { flex: 1 },
  row:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  label: { fontSize: 9,  color: 'rgba(255,255,255,0.45)' },
  val:   { fontSize: 9,  color: 'rgba(255,255,255,0.85)', fontWeight: '600', fontVariant: ['tabular-nums'] },
  track: { height: 4, backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 2, overflow: 'hidden' },
  fill:  { height: 4, borderRadius: 2 },
})
