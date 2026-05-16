import { X, Square } from 'lucide-react'
import type { ActiveSound, Sound } from '../types'

interface ActiveSoundDetail extends ActiveSound {
  sound: Sound
}

interface Props {
  activeSounds: ActiveSoundDetail[]
  onVolumeChange: (id: string, volume: number) => void
  onStop: () => void
  onRemove: (id: string) => void
}

export default function ActiveMixer({ activeSounds, onVolumeChange, onStop, onRemove }: Props) {
  return (
    <div className="glass p-5 animate-fadeIn">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-violet-400 inline-block" style={{ boxShadow: '0 0 6px rgba(167,139,250,0.8)', animation: 'pulse 2s ease-in-out infinite' }} />
          Now Playing
          <span className="text-white/30 font-normal">({activeSounds.length})</span>
        </h3>
        <button
          onClick={onStop}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-red-400/80 hover:text-red-300 border border-red-500/20 hover:border-red-400/30 hover:bg-red-500/10 transition-all"
        >
          <Square size={10} fill="currentColor" />
          Stop All
        </button>
      </div>

      <div className="space-y-4">
        {activeSounds.map(({ id, volume, sound }) => (
          <div key={id} className="flex items-center gap-3">
            <span className="text-xl w-7 text-center leading-none shrink-0">{sound.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-white/70 truncate">{sound.name}</span>
                <span className="text-xs text-white/28 tabular-nums ml-2 shrink-0">
                  {Math.round(volume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={e => onVolumeChange(id, Number(e.target.value))}
              />
            </div>
            <button
              onClick={() => onRemove(id)}
              className="text-white/25 hover:text-white/55 transition-colors p-1 shrink-0"
              title={`Remove ${sound.name}`}
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
