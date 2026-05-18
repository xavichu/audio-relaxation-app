import React from 'react'
import { Text, View } from 'react-native'
import Svg, { Circle } from 'react-native-svg'

interface Props {
  score: number   // 0–100
  size?: number
}

function ringColor(s: number) {
  if (s >= 70) return '#10b981'
  if (s >= 50) return '#22c55e'
  if (s >= 35) return '#f59e0b'
  return '#ef4444'
}

export default function ScoreRing({ score, size = 52 }: Props) {
  const sw  = 4
  const r   = (size - sw) / 2
  const circ = 2 * Math.PI * r
  const dash = (Math.min(100, score) / 100) * circ
  const color = ringColor(score)

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* SVG ring — rotated so 0 is at top */}
      <Svg
        width={size} height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ position: 'absolute', top: 0, left: 0, transform: [{ rotate: '-90deg' }] }}
      >
        <Circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth={sw}
        />
        <Circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={sw}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
      </Svg>
      <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>{Math.round(score)}</Text>
    </View>
  )
}
