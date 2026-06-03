import Link from 'next/link'
import { Moon } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy – Serenity',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 mb-10 text-white/50 hover:text-white/80 transition-colors">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Moon size={12} />
          </div>
          <span className="text-sm font-semibold">Serenity</span>
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-white/35 text-sm mb-10">Last updated: January 1, 2025</p>

        <div className="space-y-8 text-white/60 text-sm leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-white/85 mb-3">1. Information We Collect</h2>
            <p>
              When you create an account, we collect your email address and password (stored securely
              via Supabase Auth). If you subscribe to Serenity Pro, your payment is processed by
              Stripe. We never see or store your full credit card number.
            </p>
            <p className="mt-3">
              We do not collect audio data. All sounds are generated locally in your browser using
              the Web Audio API and are never transmitted to our servers.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white/85 mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>To create and manage your account</li>
              <li>To process your subscription payments via Stripe</li>
              <li>To send you transactional emails (password reset, billing receipts)</li>
              <li>To provide customer support when you contact us</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white/85 mb-3">3. Data Sharing</h2>
            <p>
              We do not sell your personal data. We share your information only with:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-3">
              <li><strong className="text-white/75">Supabase</strong> — authentication and database hosting</li>
              <li><strong className="text-white/75">Stripe</strong> — payment processing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white/85 mb-3">4. Cookies</h2>
            <p>
              We use session cookies solely to keep you logged in. We do not use tracking or
              advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white/85 mb-3">5. Data Retention</h2>
            <p>
              We retain your account data for as long as your account is active. You may delete your
              account at any time by contacting us at{' '}
              <a href="mailto:hello@serenity.app" className="text-violet-400 hover:text-violet-300">
                hello@serenity.app
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white/85 mb-3">6. Your Rights</h2>
            <p>
              Depending on your location, you may have the right to access, correct, or delete your
              personal data. To exercise these rights, contact us at{' '}
              <a href="mailto:hello@serenity.app" className="text-violet-400 hover:text-violet-300">
                hello@serenity.app
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white/85 mb-3">7. Security</h2>
            <p>
              We use industry-standard security practices including encrypted connections (HTTPS),
              secure authentication via Supabase, and PCI-compliant payment processing via Stripe.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white/85 mb-3">8. Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. We will notify you of significant changes
              by email or by posting a notice on this page.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white/85 mb-3">9. Contact</h2>
            <p>
              Questions about this policy? Email us at{' '}
              <a href="mailto:hello@serenity.app" className="text-violet-400 hover:text-violet-300">
                hello@serenity.app
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/8">
          <Link href="/" className="text-sm text-white/35 hover:text-white/55 transition-colors">
            ← Back to Serenity
          </Link>
        </div>
      </div>
    </div>
  )
}
