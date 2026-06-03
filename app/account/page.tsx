'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Moon, ArrowLeft, CreditCard, Zap, LogOut, Shield, Trash2, X } from 'lucide-react'
import { useAuth } from '../../components/AuthProvider'
import { createClient } from '../../lib/supabase-client'

export default function AccountPage() {
  const { user, isPro, loading } = useAuth()
  const router = useRouter()
  const [portalLoading, setPortalLoading] = useState(false)
  const [portalError, setPortalError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const handleManageBilling = async () => {
    setPortalLoading(true)
    setPortalError('')
    try {
      const res = await fetch('/api/portal', { method: 'POST' })
      const data = (await res.json()) as { url?: string; error?: string }
      if (data.url) {
        window.location.href = data.url
      } else {
        setPortalError(data.error ?? 'Failed to open billing portal.')
      }
    } catch {
      setPortalError('Failed to open billing portal. Please try again.')
    } finally {
      setPortalLoading(false)
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const handleDeleteAccount = async () => {
    setDeleteLoading(true)
    setDeleteError('')
    try {
      const res = await fetch('/api/account/delete', { method: 'DELETE' })
      const data = (await res.json()) as { deleted?: boolean; error?: string }
      if (!data.deleted) {
        setDeleteError(data.error ?? 'Failed to delete account. Please try again.')
        setDeleteLoading(false)
        return
      }
      // Sign out locally and send to home page
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/?deleted=true')
    } catch {
      setDeleteError('Failed to delete account. Please try again.')
      setDeleteLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-lg mx-auto">
        {/* Back link */}
        <Link
          href="/app"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white/65 text-sm mb-8 transition-colors"
        >
          <ArrowLeft size={15} />
          Back to app
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Moon size={18} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">My Account</h1>
            <p className="text-sm text-white/40 truncate max-w-xs">{user?.email}</p>
          </div>
        </div>

        {/* Subscription card */}
        <div className="glass p-6 mb-4">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xs font-semibold text-white/50 uppercase tracking-widest">
              Subscription
            </h2>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                isPro
                  ? 'bg-violet-500/15 text-violet-300 border-violet-400/30'
                  : 'bg-white/5 text-white/45 border-white/10'
              }`}
            >
              {isPro ? '✦ Pro' : 'Free Plan'}
            </span>
          </div>

          {isPro ? (
            <div className="space-y-4">
              <p className="text-sm text-white/55 leading-relaxed">
                You have access to all 12 sounds, the sleep timer, and the breathing guide.
              </p>
              <button
                onClick={handleManageBilling}
                disabled={portalLoading}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl glass-sm text-sm text-white/65 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CreditCard size={15} />
                {portalLoading ? 'Opening portal…' : 'Manage subscription & billing'}
              </button>
              {portalError && (
                <p className="text-red-300 text-xs mt-2">{portalError}</p>
              )}
              <p className="text-xs text-white/25">
                Cancel, update payment method, or view invoices via Stripe&apos;s secure portal.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-white/55 leading-relaxed">
                You&apos;re on the free plan. Upgrade to Pro to unlock all 12 sounds, the sleep
                timer, and the breathing guide.
              </p>
              <div className="grid grid-cols-2 gap-3 py-2">
                {[
                  'All 12 ambient sounds',
                  'Sleep timer with fade',
                  'Breathing guide',
                  'Binaural beats',
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-xs text-white/50">
                    <span className="text-violet-400">✓</span>
                    {f}
                  </div>
                ))}
              </div>
              <Link
                href="/app"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all"
              >
                <Zap size={14} fill="currentColor" />
                Upgrade to Pro — from $7.99/mo
              </Link>
            </div>
          )}
        </div>

        {/* Security card */}
        <div className="glass p-6 mb-4">
          <h2 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-4">
            Security
          </h2>
          <Link
            href="/forgot-password"
            className="flex items-center gap-2.5 text-sm text-white/55 hover:text-white/80 transition-colors"
          >
            <Shield size={15} />
            Change password
          </Link>
        </div>

        {/* Sign out */}
        <div className="glass p-6 mb-4">
          <h2 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-4">
            Session
          </h2>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2.5 text-sm text-red-400/65 hover:text-red-300 transition-colors"
          >
            <LogOut size={15} />
            Sign out of Serenity
          </button>
        </div>

        {/* Delete account */}
        <div className="glass p-6 border border-red-500/10">
          <h2 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-4">
            Danger Zone
          </h2>
          <p className="text-sm text-white/40 mb-4 leading-relaxed">
            Permanently delete your account and all associated data. This cannot be undone.
          </p>
          <button
            onClick={() => { setShowDeleteModal(true); setDeleteConfirm(''); setDeleteError('') }}
            className="flex items-center gap-2.5 text-sm text-red-400/55 hover:text-red-300 transition-colors"
          >
            <Trash2 size={15} />
            Delete my account
          </button>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass w-full max-w-md p-6 rounded-2xl relative">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 text-white/30 hover:text-white/60 transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
                <Trash2 size={16} className="text-red-400" />
              </div>
              <h2 className="text-base font-bold text-white">Delete account</h2>
            </div>

            <p className="text-sm text-white/55 mb-1 leading-relaxed">
              This will immediately and permanently delete your account and cancel any active
              subscription. There is no undo.
            </p>
            <p className="text-sm text-white/55 mb-5 leading-relaxed">
              Type <span className="font-mono text-red-300 font-semibold">DELETE</span> to confirm.
            </p>

            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="DELETE"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 text-sm outline-none focus:border-red-400/40 mb-4"
            />

            {deleteError && (
              <p className="text-red-300 text-xs mb-3">{deleteError}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl glass-sm text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== 'DELETE' || deleteLoading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deleteLoading ? 'Deleting…' : 'Delete account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
