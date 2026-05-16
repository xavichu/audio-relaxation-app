import SoundCard from './SoundCard'
import { SOUNDS, CATEGORIES } from '../sounds'

interface Props {
  activeSoundIds: string[]
  onToggle: (id: string) => void
}

export default function SoundGrid({ activeSoundIds, onToggle }: Props) {
  const categories = ['nature', 'ambient', 'focus'] as const

  return (
    <div className="space-y-7">
      {categories.map(category => {
        const sounds = SOUNDS.filter(s => s.category === category)
        const info = CATEGORIES[category]
        return (
          <section key={category}>
            <div className="mb-3">
              <h2 className="text-sm font-semibold text-white/80 uppercase tracking-widest">
                {info.label}
              </h2>
              <p className="text-xs text-white/35 mt-0.5">{info.description}</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {sounds.map(sound => (
                <SoundCard
                  key={sound.id}
                  sound={sound}
                  isActive={activeSoundIds.includes(sound.id)}
                  onToggle={onToggle}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
