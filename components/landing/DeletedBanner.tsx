'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'

export default function DeletedBanner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [visible, setVisible] = useState(false)
  const didRun = useRef(false)

  useEffect(() => {
    if (didRun.current) return
    if (searchParams.get('deleted') === 'true') {
      didRun.current = true
      setVisible(true)
      router.replace('/', { scroll: false })
      const t = window.setTimeout(() => setVisible(false), 6000)
      return () => clearTimeout(t)
    }
  }, [searchParams, router])

  if (!visible) return null

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md text-white/80 text-sm font-medium shadow-lg"
      style={{ animation: 'fadeInAnim 0.3s ease-out' }}
    >
      <CheckCircle size={16} className="text-green-400 shrink-0" />
      Your account has been permanently deleted. Take care.
    </div>
  )
}
