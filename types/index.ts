export interface Sound {
  id: string
  name: string
  emoji: string
  category: 'nature' | 'ambient' | 'focus'
  description: string
  color: string
  glowColor: string
}

export interface ActiveSound {
  id: string
  volume: number
}
