'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Moon, Mail } from 'lucide-react'
import { createClient } from '../../lib/supabase-client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password`
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      })

      if (resetError) {
        setError(resetError.message)
        return
      }

      setSent(true)
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="glass p-10">
            <div className="w-16 h-16 rounded-full bg-violet-500/15 border border-violet-400/30 flex items-center justify-center mx-auto mb-5">
              <Mail size={28} className="text-violet-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Check your email</h2>
            <p className="text-white/50 mb-2">
              We sent a password reset link to
            </p>
            <p className="text-white/80 font-medium mb-6">{email}</p>
            <p className="text-white/35 text-sm mb-8">
              Click the link in the email to set a new password. The link expires in 1 hour.
            </p>
            <Link
              href="/login"
              className="inline-block px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-all"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Moon size={18} />
            </div>
            <span className="text-xl font-semibold">Serenity</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">Reset your password</h1>
          <p className="text-white/50">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        <div className="glass p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm text-white/70 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-violet-400/60 transition-all"
                placeholder="you@example.com"
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>

          <p className="text-center text-white/40 text-sm mt-6">
            Remember your password?{' '}
            <Link href="/login" className="text-violet-400 hover:text-violet-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
