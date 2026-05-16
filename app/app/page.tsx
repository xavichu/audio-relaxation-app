'use client'

import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '../../components/AuthProvider'
import AppHeader from '../../components/app/AppHeader'
import SoundGrid from '../../components/app/SoundGrid'
import ActiveMixer from '../../components/app/ActiveMixer'
import Timer from '../../components/app/Timer'
import BreathingGuide from '../../components/app/BreathingGuide'
import UpgradeModal from '../../components/app/UpgradeModal'
import { audioEngine } from '../../lib/audio-engine'
import { SOUNDS } from '../../lib/sounds'
import type { ActiveSound, Sound } from '../../types/index'

const DEFAULT_VOLUME = 0.62

interface ActiveSoundDetail extends ActiveSound {
  sound: Sound
}

export default function AppPage() {
  const { user, isPro, loading } = useAuth()
  const [activeSounds, setActiveSounds] = useState<ActiveSound[]>([])
  const [masterVolume, setMasterVolume] = useState(0.85)
  const [showBreathing, setShowBreathing] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const toggleSound = useCallback(
    async (soundId: string) => {
      const isActive = activeSounds.some(s => s.id === soundId)
      if (isActive) {
        audioEngine.stop(soundId)
        setActiveSounds(prev => prev.filter(s => s.id !== soundId))
      } else {
        await audioEngine.play(soundId, DEFAULT_VOLUME)
        setActiveSounds(prev => [...prev, { id: soundId, volume: DEFAULT_VOLUME }])
      }
    },
    [activeSounds],
  )

  const updateVolume = useCallback((soundId: string, volume: number) => {
    setActiveSounds(prev => prev.map(s => (s.id === soundId ? { ...s, volume } : s)))
    audioEngine.setVolume(soundId, volume)
  }, [])

  const handleMasterVolume = useCallback((vol: number) => {
    setMasterVolume(vol)
    audioEngine.setMasterVolume(vol)
  }, [])

  const stopAll = useCallback(() => {
    audioEngine.stopAll()
    setActiveSounds([])
  }, [])

  const handleTimerEnd = useCallback(() => {
    audioEngine.fadeTo(0, 3)
    setTimeout(() => {
      audioEngine.stopAll()
      setActiveSounds([])
    }, 3500)
  }, [])

  useEffect(() => {
    audioEngine.setMasterVolume(masterVolume)
  }, [masterVolume])

  const activeSoundDetails = activeSounds.reduce<ActiveSoundDetail[]>((acc, as) => {
    const sound = SOUNDS.find(s => s.id === as.id)
    if (sound) acc.push({ ...as, sound })
    return acc
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-violet-500 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-white/40 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24">
      <AppHeader
        masterVolume={masterVolume}
        onMasterVolumeChange={handleMasterVolume}
        user={user}
        isPro={isPro}
        onUpgradeClick={() => setShowUpgradeModal(true)}
        onToggleBreathing={() => setShowBreathing(v => !v)}
        showBreathing={showBreathing}
      />

      <main className="max-w-5xl mx-auto px-4 pt-8 space-y-8">
        {showBreathing && (
          isPro ? (
            <BreathingGuide />
          ) : (
            <div className="glass p-6 text-center">
              <p className="text-white/60 mb-3">Breathing guide is a Pro feature</p>
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all"
              >
                Upgrade to Pro
              </button>
            </div>
          )
        )}

        <SoundGrid
          activeSoundIds={activeSounds.map(s => s.id)}
          onToggle={toggleSound}
          isPro={isPro}
          onUpgradeNeeded={() => setShowUpgradeModal(true)}
        />

        {activeSoundDetails.length > 0 && (
          <ActiveMixer
            activeSounds={activeSoundDetails}
            onVolumeChange={updateVolume}
            onStop={stopAll}
            onRemove={toggleSound}
          />
        )}
      </main>

      <Timer
        onTimerEnd={handleTimerEnd}
        isPro={isPro}
        onUpgradeNeeded={() => setShowUpgradeModal(true)}
      />

      {showUpgradeModal && (
        <UpgradeModal onClose={() => setShowUpgradeModal(false)} />
      )}
    </div>
  )
}
