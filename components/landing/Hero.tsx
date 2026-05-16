'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-60px)] flex items-center justify-center px-4 overflow-hidden">
      {/* Background orbs */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full animate-float"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.18) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full animate-float"
        style={{
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
          filter: 'blur(50px)',
          animationDelay: '2s',
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(109, 40, 217, 0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="relative z-10 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-white/60 mb-8">
          <span className="w-2 h-2 rounded-full bg-green-400 inline-block" style={{ boxShadow: '0 0 6px rgba(74,222,128,0.8)' }} />
          Now with binaural beats
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-tight mb-6">
          Sleep better.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
            Focus deeper.
          </span>{' '}
          Relax completely.
        </h1>

        <p className="text-lg sm:text-xl text-white/55 max-w-xl mx-auto mb-10 leading-relaxed">
          A beautiful ambient sound mixer with sleep timer and breathing guide.
          Start free, upgrade anytime.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white font-semibold text-base transition-all animate-pulse-glow"
          >
            Start free
            <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full glass text-white/70 hover:text-white font-medium text-base transition-all"
          >
            Hear it now
          </Link>
        </div>

        <p className="text-white/25 text-sm mt-6">No credit card required &middot; Free forever plan</p>
      </div>
    </section>
  )
}
