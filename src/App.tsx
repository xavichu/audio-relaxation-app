import { useState, useCallback, useEffect } from 'react'
import Header from './components/Header'
import SoundGrid from './components/SoundGrid'
import ActiveMixer from './components/ActiveMixer'
import Timer from './components/Timer'
import BreathingGuide from './components/BreathingGuide'
import { SOUNDS } from './sounds'
import { audioEngine } from './audioEngine'
import type { ActiveSound } from './types'

const DEFAULT_VOLUME = 0.62

export default function App() {
  const [activeSounds, setActiveSounds] = useState<ActiveSound[]>([])
  const [masterVolume, setMasterVolume] = useState(0.85)
  const [showBreathing, setShowBreathing] = useState(false)

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

  const activeSoundDetails = activeSounds
    .map(as => ({ ...as, sound: SOUNDS.find(s => s.id === as.id)! }))
    .filter(s => s.sound)

  return (
    <div className="min-h-screen pb-24">
      <Header
        masterVolume={masterVolume}
        onMasterVolumeChange={handleMasterVolume}
        onToggleBreathing={() => setShowBreathing(v => !v)}
        showBreathing={showBreathing}
      />

      <main className="max-w-5xl mx-auto px-4 pt-8 space-y-8">
        {showBreathing && <BreathingGuide />}

        <SoundGrid activeSoundIds={activeSounds.map(s => s.id)} onToggle={toggleSound} />

        {activeSoundDetails.length > 0 && (
          <ActiveMixer
            activeSounds={activeSoundDetails}
            onVolumeChange={updateVolume}
            onStop={stopAll}
            onRemove={toggleSound}
          />
        )}
      </main>

      <Timer onTimerEnd={handleTimerEnd} />
    </div>
  )
}
