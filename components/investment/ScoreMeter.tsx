'use client'

interface Props {
  label: string
  value: number   // 0-100
  color: string   // tailwind bg-* class
  small?: boolean
}

export default function ScoreMeter({ label, value, color, small }: Props) {
  const h = small ? 'h-1.5' : 'h-2'
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className={`text-white/50 ${small ? 'text-[10px]' : 'text-xs'}`}>{label}</span>
        <span className={`font-semibold tabular-nums ${small ? 'text-[10px]' : 'text-xs'}`}>{value}</span>
      </div>
      <div className={`w-full bg-white/10 rounded-full ${h} overflow-hidden`}>
        <div
          className={`${h} rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  )
}
