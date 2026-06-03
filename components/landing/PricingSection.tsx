'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'

const freeFeatures = [
  '3 sounds (Rain, Ocean, White Noise)',
  'Basic sound mixing',
  'Free account, no credit card',
  'Browser-based, no download',
]

const proFeatures = [
  'All 12 ambient sounds',
  'Unlimited sound mixing',
  'Sleep timer with auto-fade',
  'Guided breathing exercises',
  'Binaural beats (focus & relax)',
  'Priority support',
]

export default function PricingSection() {
  const [yearly, setYearly] = useState(false)

  return (
    <section id="pricing" className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-white/45 text-lg mb-8">
            Start for free. Upgrade when you need more.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-3 glass px-4 py-2 rounded-full">
            <button
              onClick={() => setYearly(false)}
              className={`text-sm font-medium px-3 py-1.5 rounded-full transition-all ${
                !yearly ? 'bg-violet-600 text-white' : 'text-white/50 hover:text-white/70'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`text-sm font-medium px-3 py-1.5 rounded-full transition-all ${
                yearly ? 'bg-violet-600 text-white' : 'text-white/50 hover:text-white/70'
              }`}
            >
              Yearly
              <span className="ml-1.5 text-xs text-green-400">Save 37%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free plan */}
          <div className="glass p-8">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-1">Free</h3>
              <p className="text-white/45 text-sm mb-4">Perfect for getting started</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="text-white/40 text-sm">/ forever</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {freeFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm text-white/60">
                  <Check size={15} className="text-white/30 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              href="/signup"
              className="block text-center py-3 rounded-xl border border-white/15 text-white/70 hover:text-white hover:bg-white/5 text-sm font-medium transition-all"
            >
              Get started free
            </Link>
          </div>

          {/* Pro plan */}
          <div
            className="glass p-8 relative"
            style={{
              borderColor: 'rgba(139, 92, 246, 0.45)',
              boxShadow: '0 0 40px rgba(139, 92, 246, 0.12)',
            }}
          >
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="px-4 py-1 rounded-full bg-violet-600 text-white text-xs font-semibold">
                Most Popular
              </span>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-1">Pro</h3>
              <p className="text-white/45 text-sm mb-4">For serious relaxation</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">
                  {yearly ? '$59.99' : '$7.99'}
                </span>
                <span className="text-white/40 text-sm">
                  {yearly ? '/ year' : '/ month'}
                </span>
              </div>
              {yearly && (
                <p className="text-green-400 text-xs mt-1">Save $35.89 compared to monthly</p>
              )}
            </div>

            <ul className="space-y-3 mb-8">
              {proFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm text-white/80">
                  <Check size={15} className="text-violet-400 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              href="/signup"
              className="block text-center py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all"
            >
              Start Pro
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
