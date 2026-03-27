import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const whyItMatters = [
  { icon: '🌾', title: 'Smarter Crop Choices', desc: 'AI analyzes soil, weather, and market data to recommend the most profitable crop — reducing the guesswork that leads to crop failure.' },
  { icon: '🔬', title: 'Early Disease Intervention', desc: 'Detect plant diseases from a single photo before they spread. Early treatment can save up to 40% of yield that would otherwise be lost.' },
  { icon: '📈', title: 'Better Price Discovery', desc: 'Real-time mandi prices help farmers sell at the right time and the right market — no more depending on middlemen for price information.' },
  { icon: '⚡', title: 'Accessible to Everyone', desc: 'Designed to work on low-end smartphones and 2G networks. Available in multiple Indian languages so no farmer is left behind.' },
];

const targetStates = ['Andhra Pradesh', 'Telangana', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Punjab', 'Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan', 'Gujarat'];

const ImpactSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <section id="impact" ref={ref} className="relative py-20 lg:py-28 overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80"
        alt="Aerial view of farmland"
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-foreground/75" />

      <div className={`relative mx-auto max-w-7xl px-4 section-fade-in ${isVisible ? 'visible' : ''}`}>
        <div className="text-center">
          <span className="inline-block rounded-full bg-primary-foreground/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground border border-primary-foreground/20">Why It Matters</span>
          <h2 className="mt-6 font-display text-3xl font-bold text-primary-foreground sm:text-4xl lg:text-5xl">
            The Impact AI Can Create<br />for Indian Agriculture
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/70">
            India has over 140 million farm holdings. Most lack access to timely, data-driven insights. Rythu Mitra is built to change that.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {whyItMatters.map(item => (
            <div key={item.title} className="glass-dark rounded-2xl p-8 text-center border border-primary-foreground/10">
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="font-display text-lg font-bold text-primary-foreground">{item.title}</h3>
              <p className="mt-3 text-sm text-primary-foreground/70 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Target states */}
        <div className="mt-16 text-center">
          <p className="text-sm font-semibold text-primary-foreground/80 mb-4">Targeting farmers across India's key agricultural states</p>
          <div className="flex flex-wrap justify-center gap-2">
            {targetStates.map(state => (
              <span key={state} className="rounded-full bg-primary/30 px-4 py-1.5 text-xs font-medium text-primary-foreground border border-primary/40">
                {state}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
export default ImpactSection;
