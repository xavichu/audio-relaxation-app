import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function CtaBanner() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div
          className="glass p-12 rounded-2xl"
          style={{
            background: 'rgba(139, 92, 246, 0.08)',
            borderColor: 'rgba(139, 92, 246, 0.2)',
            boxShadow: '0 0 60px rgba(139, 92, 246, 0.08)',
          }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to find your calm?
          </h2>
          <p className="text-white/50 text-lg mb-8">
            Start for free today. No credit card required.
          </p>
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-violet-600 hover:bg-violet-500 text-white font-semibold text-base transition-all"
            style={{ boxShadow: '0 0 30px rgba(139, 92, 246, 0.4)' }}
          >
            Start for free
            <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}
