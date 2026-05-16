'use client'

import { Lock } from 'lucide-react'
import type { Sound } from '../../types/index'

const BAR_HEIGHTS = [55, 85, 45, 70]

interface Props {
  sound: Sound
  isActive: boolean
  isLocked: boolean
  onToggle: (id: string) => void
  onUpgradeNeeded: () => void
}

export default function SoundCard({ sound, isActive, isLocked, onToggle, onUpgradeNeeded }: Props) {
  const handleClick = () => {
    if (isLocked) {
      onUpgradeNeeded()
      return
    }
    onToggle(sound.id)
  }

  return (
    <button
      onClick={handleClick}
      className={`glass glass-hover w-full text-left p-4 transition-all duration-300 relative ${
        isActive ? 'sound-active' : ''
      } ${isLocked ? 'opacity-60' : ''}`}
      style={
        isActive
          ? { boxShadow: `0 0 22px ${sound.glowColor}`, borderColor: sound.color + 'aa' }
          : undefined
      }
    >
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/30 z-10">
          <div className="flex flex-col items-center gap-1">
            <Lock size={18} className="text-white/60" />
            <span className="text-[10px] text-white/40 font-medium">Pro</span>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between mb-2.5">
        <span className="text-2xl leading-none">{sound.emoji}</span>
        {isActive && !isLocked && (
          <div className="flex gap-0.5 items-end h-4 mt-0.5">
            {BAR_HEIGHTS.map((h, i) => (
              <div
                key={i}
                className="w-0.5 rounded-full origin-bottom"
                style={{
                  background: sound.color,
                  height: `${h}%`,
                  animation: `equalizerAnim ${0.65 + i * 0.12}s ease-in-out infinite alternate`,
                  animationDelay: `${i * 0.11}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>
      <p className="text-sm font-medium text-white/90 leading-tight">{sound.name}</p>
      <p className="text-xs text-white/38 mt-0.5 leading-tight">{sound.description}</p>
    </button>
  )
}
