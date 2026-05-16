import { Volume2, Wind, Moon } from 'lucide-react'

interface Props {
  masterVolume: number
  onMasterVolumeChange: (vol: number) => void
  onToggleBreathing: () => void
  showBreathing: boolean
}

export default function Header({ masterVolume, onMasterVolumeChange, onToggleBreathing, showBreathing }: Props) {
  return (
    <header className="sticky top-0 z-10 glass rounded-none border-l-0 border-r-0 border-t-0 px-5 py-3.5">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
            <Moon size={14} />
          </div>
          <div>
            <h1 className="text-base font-semibold leading-tight">Serenity</h1>
            <p className="text-[10px] text-white/35 leading-tight hidden sm:block">Audio Relaxation</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleBreathing}
            title="Toggle breathing guide"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
              showBreathing
                ? 'bg-violet-500/25 text-violet-200 border-violet-400/40'
                : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white/70'
            }`}
          >
            <Wind size={13} />
            <span className="hidden sm:inline">Breathe</span>
          </button>

          <div className="flex items-center gap-2">
            <Volume2 size={15} className="text-white/45 shrink-0" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={masterVolume}
              onChange={e => onMasterVolumeChange(Number(e.target.value))}
              className="w-20 sm:w-28"
              title={`Master volume ${Math.round(masterVolume * 100)}%`}
            />
          </div>
        </div>
      </div>
    </header>
  )
}
