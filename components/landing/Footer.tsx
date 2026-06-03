import Link from 'next/link'
import { Moon } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="section-dark border-t border-white/5 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
              <Moon size={12} />
            </div>
            <span className="text-sm font-semibold text-white/70">Serenity</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-xs text-white/35 hover:text-white/55 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-white/35 hover:text-white/55 transition-colors"
            >
              Terms of Service
            </Link>
            <a
              href="mailto:hello@serenity.app"
              className="text-xs text-white/35 hover:text-white/55 transition-colors"
            >
              Contact
            </a>
          </div>

          <p className="text-xs text-white/25">
            &copy; {year} Serenity. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
