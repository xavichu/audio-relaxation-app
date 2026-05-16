'use client'

import Link from 'next/link'
import { Moon, Volume2, Wind, LogOut, Zap } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '../../lib/supabase-client'
import { useRouter } from 'next/navigation'

interface Props {
  masterVolume: number
  onMasterVolumeChange: (vol: number) => void
  user: User | null
  isPro: boolean
  onUpgradeClick: () => void
  onToggleBreathing: () => void
  showBreathing: boolean
}

export default function AppHeader({
  masterVolume,
  onMasterVolumeChange,
  user,
  isPro,
  onUpgradeClick,
  onToggleBreathing,
  showBreathing,
}: Props) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-10 glass rounded-none border-l-0 border-r-0 border-t-0 px-5 py-3.5">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
            <Moon size={14} />
          </div>
          <div>
            <h1 className="text-base font-semibold leading-tight">Serenity</h1>
            <p className="text-[10px] text-white/35 leading-tight hidden sm:block">Audio Relaxation</p>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-center max-w-xs">
          <Volume2 size={15} className="text-white/45 shrink-0" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={masterVolume}
            onChange={(e) => onMasterVolumeChange(Number(e.target.value))}
            className="w-full"
            title={`Master volume ${Math.round(masterVolume * 100)}%`}
          />
        </div>

        <div className="flex items-center gap-2">
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

          {!isPro && (
            <button
              onClick={onUpgradeClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-violet-600/30 text-violet-300 border border-violet-400/30 hover:bg-violet-600/40 transition-all"
            >
              <Zap size={11} fill="currentColor" />
              <span className="hidden sm:inline">Upgrade</span>
            </button>
          )}

          {user && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/30 hidden md:block max-w-[120px] truncate">
                {user.email}
              </span>
              <button
                onClick={handleSignOut}
                title="Sign out"
                className="p-1.5 rounded-lg text-white/35 hover:text-white/60 hover:bg-white/5 transition-all"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
