import { describe, it, expect } from 'vitest'
import { SOUNDS, FREE_SOUND_IDS, CATEGORIES } from '../lib/sounds'

describe('sound catalog integrity', () => {
  it('exposes a non-empty catalog', () => {
    expect(SOUNDS.length).toBeGreaterThan(0)
  })

  it('has unique sound ids', () => {
    const ids = SOUNDS.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('only marks sounds that actually exist as free', () => {
    const ids = new Set(SOUNDS.map((s) => s.id))
    for (const freeId of FREE_SOUND_IDS) {
      expect(ids.has(freeId)).toBe(true)
    }
  })

  it('keeps the free tier limited (paywall must mean something)', () => {
    expect(FREE_SOUND_IDS.length).toBeLessThan(SOUNDS.length)
  })

  it('assigns every sound to a known category', () => {
    const known = Object.keys(CATEGORIES)
    for (const sound of SOUNDS) {
      expect(known).toContain(sound.category)
    }
  })

  it('gives every sound the fields the UI renders', () => {
    for (const sound of SOUNDS) {
      expect(sound.name).toBeTruthy()
      expect(sound.emoji).toBeTruthy()
      expect(sound.description).toBeTruthy()
      expect(sound.color).toMatch(/^#/)
    }
  })
})
