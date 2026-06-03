import Link from 'next/link'
import { Moon } from 'lucide-react'

export const metadata = {
  title: 'Terms of Service – Serenity',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 mb-10 text-white/50 hover:text-white/80 transition-colors">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Moon size={12} />
          </div>
          <span className="text-sm font-semibold">Serenity</span>
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-white/35 text-sm mb-10">Last updated: January 1, 2025</p>

        <div className="space-y-8 text-white/60 text-sm leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-white/85 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Serenity (&quot;the Service&quot;), you agree to be bound by these Terms
              of Service. If you do not agree, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white/85 mb-3">2. Description of Service</h2>
            <p>
              Serenity is a web-based ambient sound mixer designed to aid relaxation, focus, and
              sleep. The Service includes both a free tier and a paid Pro subscription.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white/85 mb-3">3. Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials
              and for all activities that occur under your account. You must be at least 13 years
              old to use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white/85 mb-3">4. Subscriptions and Billing</h2>
            <p>
              Serenity Pro is offered on a monthly or annual subscription basis. Subscriptions
              automatically renew at the end of each billing period unless cancelled. You may cancel
              at any time through the billing portal accessible from your account page.
            </p>
            <p className="mt-3">
              Payments are processed by Stripe. By subscribing, you agree to Stripe&apos;s{' '}
              <a
                href="https://stripe.com/legal"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 hover:text-violet-300"
              >
                Terms of Service
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white/85 mb-3">5. Refunds</h2>
            <p>
              We offer a 7-day money-back guarantee for new Pro subscriptions. To request a refund,
              contact us within 7 days of your initial purchase at{' '}
              <a href="mailto:hello@serenity.app" className="text-violet-400 hover:text-violet-300">
                hello@serenity.app
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white/85 mb-3">6. Prohibited Uses</h2>
            <p>You may not use the Service to:</p>
            <ul className="list-disc list-inside space-y-2 mt-3">
              <li>Violate any applicable law or regulation</li>
              <li>Attempt to gain unauthorized access to the Service or its systems</li>
              <li>Reverse-engineer or attempt to extract the source code of the Service</li>
              <li>Resell or redistribute access to the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white/85 mb-3">7. Disclaimer of Warranties</h2>
            <p>
              The Service is provided &quot;as is&quot; without warranties of any kind. Serenity is not a
              medical product and is not intended to diagnose, treat, or cure any condition. Consult
              a healthcare professional for medical advice.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white/85 mb-3">8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Serenity shall not be liable for any indirect,
              incidental, or consequential damages arising from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white/85 mb-3">9. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the Service
              after changes constitutes your acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white/85 mb-3">10. Contact</h2>
            <p>
              Questions about these terms? Contact us at{' '}
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
