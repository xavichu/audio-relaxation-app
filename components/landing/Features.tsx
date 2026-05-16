const features = [
  {
    icon: '🎵',
    title: '12 Ambient Sounds',
    description: 'Rain, ocean, fire, binaural beats and more. Each sound is generated in real-time using Web Audio API.',
  },
  {
    icon: '🎚️',
    title: 'Custom Mixing',
    description: 'Layer multiple sounds simultaneously with individual volume control for each. Create your perfect soundscape.',
  },
  {
    icon: '⏱️',
    title: 'Sleep Timer',
    description: 'Set a timer to automatically fade out and stop. Wake up refreshed without leaving audio playing all night.',
  },
  {
    icon: '🫁',
    title: 'Breathing Guide',
    description: 'Guided 4-4-6-2 box breathing with beautiful visual animation. Reduce stress and improve focus.',
  },
  {
    icon: '🌐',
    title: 'Works Anywhere',
    description: 'No download needed. Runs entirely in your browser using Web Audio API. Works on any device.',
  },
  {
    icon: '🔒',
    title: 'Private & Secure',
    description: 'No tracking, no ads, no audio data sent to servers. Just you and your sounds.',
  },
]

export default function Features() {
  return (
    <section id="features" className="py-20 px-4 section-dark">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Everything you need to unwind
          </h2>
          <p className="text-white/45 text-lg max-w-xl mx-auto">
            Carefully designed features to help you sleep, focus, and relax.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature) => (
            <div key={feature.title} className="glass glass-hover p-6">
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-white/45 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
