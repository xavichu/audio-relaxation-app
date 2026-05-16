'use client'

import Link from 'next/link'
import { Moon } from 'lucide-react'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 glass rounded-none border-l-0 border-r-0 border-t-0 px-5 py-3.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
            <Moon size={14} />
          </div>
          <span className="text-base font-semibold">Serenity</span>
        </Link>

        <div className="hidden sm:flex items-center gap-6">
          <a href="#features" className="text-sm text-white/55 hover:text-white/80 transition-colors">
            Features
          </a>
          <a href="#pricing" className="text-sm text-white/55 hover:text-white/80 transition-colors">
            Pricing
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-white/60 hover:text-white/80 transition-colors px-3 py-1.5"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all"
          >
            Start Free
          </Link>
        </div>
      </div>
    </nav>
  )
}
