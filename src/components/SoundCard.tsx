import type { Sound } from '../types'

const BAR_HEIGHTS = [55, 85, 45, 70]

interface Props {
  sound: Sound
  isActive: boolean
  onToggle: (id: string) => void
}

export default function SoundCard({ sound, isActive, onToggle }: Props) {
  return (
    <button
      onClick={() => onToggle(sound.id)}
      className={`glass glass-hover w-full text-left p-4 transition-all duration-300 ${isActive ? 'sound-active' : ''}`}
      style={
        isActive
          ? { boxShadow: `0 0 22px ${sound.glowColor}`, borderColor: sound.color + 'aa' }
          : undefined
      }
    >
      <div className="flex items-start justify-between mb-2.5">
        <span className="text-2xl leading-none">{sound.emoji}</span>
        {isActive && (
          <div className="flex gap-0.5 items-end h-4 mt-0.5">
            {BAR_HEIGHTS.map((h, i) => (
              <div
                key={i}
                className="w-0.5 rounded-full origin-bottom"
                style={{
                  background: sound.color,
                  height: `${h}%`,
                  animation: `equalizer ${0.65 + i * 0.12}s ease-in-out infinite alternate`,
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
