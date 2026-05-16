'use client'

import { useEffect, useRef, useState } from 'react'

const PHASES = [
  { label: 'Inhale', duration: 4 },
  { label: 'Hold', duration: 4 },
  { label: 'Exhale', duration: 6 },
  { label: 'Hold', duration: 2 },
] as const

const TOTAL_TICKS = 160 // 16 seconds × 10 ticks/s

function easeInOut(t: number) {
  return (1 - Math.cos(t * Math.PI)) / 2
}

function getPhaseInfo(ticks: number) {
  const t = ticks / 10
  if (t < 4) {
    return { label: 'Inhale', secondsLeft: Math.ceil(4 - t), scale: 0.5 + 0.5 * easeInOut(t / 4) }
  }
  if (t < 8) {
    return { label: 'Hold', secondsLeft: Math.ceil(8 - t), scale: 1.0 }
  }
  if (t < 14) {
    return { label: 'Exhale', secondsLeft: Math.ceil(14 - t), scale: 1.0 - 0.5 * easeInOut((t - 8) / 6) }
  }
  return { label: 'Hold', secondsLeft: Math.ceil(16 - t), scale: 0.5 }
}

export default function BreathingGuide() {
  const [ticks, setTicks] = useState(0)
  const [running, setRunning] = useState(true)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    if (!running) return
    intervalRef.current = window.setInterval(() => {
      setTicks(t => (t + 1) % TOTAL_TICKS)
    }, 100)
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
    }
  }, [running])

  const { label, secondsLeft, scale } = getPhaseInfo(ticks)
  const phaseIndex = label === 'Inhale' ? 0 : ticks / 10 < 8 ? 1 : ticks / 10 < 14 ? 2 : 3

  return (
    <div className="glass p-6" style={{ animation: 'fadeInAnim 0.3s ease-out' }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-white/80">Breathing Guide</h3>
          <p className="text-xs text-white/35 mt-0.5">4–4–6–2 box breathing</p>
        </div>
        <button
          onClick={() => setRunning(v => !v)}
          className="glass-sm text-xs text-white/50 hover:text-white/70 px-3 py-1.5 transition-all"
        >
          {running ? 'Pause' : 'Resume'}
        </button>
      </div>

      <div className="flex flex-col items-center">
        <div className="relative flex items-center justify-center w-36 h-36 mb-5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="absolute inset-0 rounded-full border border-violet-400/15"
              style={{
                transform: `scale(${1 + i * 0.28 * scale})`,
                opacity: Math.max(0, 0.5 - i * 0.15),
                transition: 'transform 100ms linear, opacity 100ms linear',
              }}
            />
          ))}
          <div
            className="rounded-full bg-gradient-to-br from-violet-500/55 to-indigo-500/55 border border-violet-400/40"
            style={{
              width: `${72 * scale}px`,
              height: `${72 * scale}px`,
              transition: 'width 100ms linear, height 100ms linear',
              boxShadow: `0 0 ${28 * scale}px rgba(139,92,246,0.45)`,
            }}
          />
        </div>

        <p className="text-base font-light text-white/75 mb-1">{label}</p>
        <p className="text-4xl font-bold tabular-nums text-violet-300 leading-none mb-5">
          {secondsLeft}
        </p>

        <div className="flex items-center gap-5">
          {PHASES.map((p, i) => (
            <div key={p.label + i} className="flex flex-col items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{
                  background: i === phaseIndex ? '#a78bfa' : 'rgba(255,255,255,0.18)',
                  boxShadow: i === phaseIndex ? '0 0 6px rgba(167,139,250,0.7)' : 'none',
                  transform: i === phaseIndex ? 'scale(1.3)' : 'scale(1)',
                }}
              />
              <span className="text-[10px] text-white/28">{p.duration}s</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
