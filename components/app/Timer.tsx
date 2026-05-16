'use client'

import { useRef, useState } from 'react'
import { Clock, X, Lock } from 'lucide-react'

interface Props {
  onTimerEnd: () => void
  isPro: boolean
  onUpgradeNeeded: () => void
}

const PRESETS = [15, 30, 45, 60]

export default function Timer({ onTimerEnd, isPro, onUpgradeNeeded }: Props) {
  const [open, setOpen] = useState(false)
  const [selectedMinutes, setSelectedMinutes] = useState(30)
  const [remaining, setRemaining] = useState<number | null>(null)
  const intervalRef = useRef<number | null>(null)
  const onTimerEndRef = useRef(onTimerEnd)
  onTimerEndRef.current = onTimerEnd

  const handleOpen = () => {
    if (!isPro) {
      onUpgradeNeeded()
      return
    }
    setOpen(v => !v)
  }

  const startTimer = () => {
    if (intervalRef.current) window.clearInterval(intervalRef.current)
    const total = selectedMinutes * 60
    setRemaining(total)
    setOpen(false)
    intervalRef.current = window.setInterval(() => {
      setRemaining(prev => {
        if (prev === null || prev <= 1) {
          window.clearInterval(intervalRef.current!)
          intervalRef.current = null
          onTimerEndRef.current()
          return null
        }
        return prev - 1
      })
    }, 1000)
  }

  const cancelTimer = () => {
    if (intervalRef.current) window.clearInterval(intervalRef.current)
    intervalRef.current = null
    setRemaining(null)
  }

  const format = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <>
      <button
        onClick={handleOpen}
        title={isPro ? 'Sleep timer' : 'Sleep timer (Pro)'}
        className={`fixed bottom-6 right-6 z-20 glass glass-hover flex items-center gap-2 px-3 py-2.5 transition-all ${
          remaining !== null
            ? 'border-amber-400/40 text-amber-300'
            : isPro
            ? 'text-white/50'
            : 'text-white/30'
        }`}
        style={{ borderRadius: '12px' }}
      >
        {!isPro && <Lock size={12} className="text-white/30" />}
        <Clock size={17} />
        {remaining !== null && (
          <span className="text-sm font-mono font-medium tabular-nums">{format(remaining)}</span>
        )}
      </button>

      {open && isPro && (
        <div
          className="fixed bottom-20 right-6 z-20 glass p-5 w-64"
          style={{ animation: 'fadeInAnim 0.3s ease-out' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white/80">Sleep Timer</h3>
            <button
              onClick={() => setOpen(false)}
              className="text-white/35 hover:text-white/60 transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-1.5 mb-4">
            {PRESETS.map(p => (
              <button
                key={p}
                onClick={() => setSelectedMinutes(p)}
                className={`py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedMinutes === p
                    ? 'bg-violet-500/35 text-violet-200 border border-violet-400/40'
                    : 'glass-sm text-white/50 hover:text-white/70 hover:bg-white/10'
                }`}
              >
                {p}m
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 mb-4">
            <input
              type="range"
              min="5"
              max="120"
              step="5"
              value={selectedMinutes}
              onChange={e => setSelectedMinutes(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs text-white/45 w-10 text-right tabular-nums shrink-0">
              {selectedMinutes}m
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={startTimer}
              className="flex-1 py-2 rounded-lg bg-violet-500/28 hover:bg-violet-500/38 text-violet-200 text-sm font-medium transition-all border border-violet-400/30"
            >
              {remaining !== null ? 'Restart' : 'Start'}
            </button>
            {remaining !== null && (
              <button
                onClick={cancelTimer}
                className="px-3 py-2 rounded-lg glass-sm text-red-400/70 hover:text-red-300 text-sm transition-all"
              >
                Cancel
              </button>
            )}
          </div>

          {remaining !== null && (
            <p className="text-center text-xs text-white/35 mt-3">
              Stops in {format(remaining)}
            </p>
          )}
        </div>
      )}
    </>
  )
}
