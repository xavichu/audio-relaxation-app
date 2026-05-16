const testimonials = [
  {
    initials: 'SM',
    name: 'Sarah M.',
    role: 'Yoga instructor',
    quote: "I've been using Serenity every night for better sleep. The rain + ocean mix is absolutely perfect. I fall asleep within minutes now.",
    color: '#a78bfa',
  },
  {
    initials: 'JK',
    name: 'James K.',
    role: 'Software engineer',
    quote: "The binaural focus beats combined with rain sounds have completely transformed my work sessions. I get so much more done.",
    color: '#34d399',
  },
  {
    initials: 'RP',
    name: 'Rachel P.',
    role: 'Therapist',
    quote: "I recommend Serenity to my patients dealing with anxiety. The breathing guide paired with ambient sounds is a powerful combination.",
    color: '#f472b6',
  },
]

export default function Testimonials() {
  return (
    <section className="py-20 px-4 section-dark">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Loved by thousands
          </h2>
          <p className="text-white/45 text-lg">
            Join people around the world who use Serenity daily.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <div key={t.name} className="glass p-6">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white/90 shrink-0"
                  style={{ background: `${t.color}30`, border: `1px solid ${t.color}50` }}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/90">{t.name}</p>
                  <p className="text-xs text-white/35">{t.role}</p>
                </div>
              </div>
              <p className="text-sm text-white/55 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex gap-0.5 mt-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-amber-400 text-xs">★</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
