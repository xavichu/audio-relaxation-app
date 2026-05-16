'use client'

import { useState } from 'react'
import { X, Zap, Check } from 'lucide-react'

interface Props {
  onClose: () => void
}

const proFeatures = [
  'All 12 ambient sounds',
  'Sleep timer with auto-fade',
  'Guided breathing exercises',
  'Binaural beats (focus & relax)',
  'Unlimited sound mixing',
]

export default function UpgradeModal({ onClose }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleUpgrade = async (priceId: string) => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })

      const data = await res.json() as { url?: string; error?: string }

      if (!res.ok || data.error) {
        setError(data.error ?? 'Failed to start checkout. Please try again.')
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      setError('Failed to start checkout. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const monthlyPriceId = process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID ?? ''
  const yearlyPriceId = process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID ?? ''

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="relative glass w-full max-w-md p-8"
        style={{
          animation: 'fadeInAnim 0.2s ease-out',
          borderColor: 'rgba(139, 92, 246, 0.3)',
          boxShadow: '0 0 60px rgba(139, 92, 246, 0.15)',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/30 hover:text-white/60 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-violet-600/20 border border-violet-400/30 flex items-center justify-center mx-auto mb-4">
            <Zap size={22} className="text-violet-400" fill="currentColor" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Unlock all sounds &amp; features</h2>
          <p className="text-white/45 text-sm">Upgrade to Pro for the full Serenity experience</p>
        </div>

        <ul className="space-y-2.5 mb-7">
          {proFeatures.map((feature) => (
            <li key={feature} className="flex items-center gap-3 text-sm text-white/70">
              <Check size={15} className="text-violet-400 shrink-0" />
              {feature}
            </li>
          ))}
        </ul>

        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm mb-4">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => handleUpgrade(monthlyPriceId)}
            disabled={loading || !monthlyPriceId}
            className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Monthly</span>
                <span className="text-violet-200 font-normal">$7.99/mo</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleUpgrade(yearlyPriceId)}
            disabled={loading || !yearlyPriceId}
            className="w-full py-3.5 rounded-xl border border-violet-400/30 text-violet-300 hover:bg-violet-600/20 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? null : (
              <>
                <span>Yearly</span>
                <span className="text-violet-400/70 font-normal">$59.99/yr</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/20">
                  Save 37%
                </span>
              </>
            )}
          </button>
        </div>

        <p className="text-center text-xs text-white/25 mt-4">
          Cancel anytime &middot; Powered by Stripe
        </p>
      </div>
    </div>
  )
}
