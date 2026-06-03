import Link from 'next/link'
import { Moon } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto mb-6">
          <Moon size={24} />
        </div>
        <p className="text-6xl font-bold text-white/90 mb-3">404</p>
        <h1 className="text-xl font-semibold text-white mb-2">This page drifted away</h1>
        <p className="text-white/45 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all"
          >
            Go home
          </Link>
          <Link
            href="/app"
            className="px-5 py-2.5 rounded-xl glass text-white/70 hover:text-white text-sm font-medium transition-all"
          >
            Open the app
          </Link>
        </div>
      </div>
    </div>
  )
}
