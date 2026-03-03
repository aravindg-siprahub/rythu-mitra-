import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Smartphone, MapPin, Rocket } from 'lucide-react';

const steps = [
  { num: '01', icon: Smartphone, title: 'Download or Sign Up', desc: 'Get the Rythu Mitra app on Android or use the web platform — completely free, no hidden charges.' },
  { num: '02', icon: MapPin, title: 'Set Your Farm Profile', desc: 'Tell us your district, soil type, and crops you grow. Takes 2 minutes.' },
  { num: '03', icon: Rocket, title: 'Get AI Recommendations', desc: 'Instantly receive crop recommendations, disease alerts, market prices, and daily advisories.' },
];

const HowItWorks = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="how-it-works" ref={ref} className="py-20 bg-green-dark relative overflow-hidden">
      {/* Grain texture overlay */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

      <div className={`container mx-auto px-4 relative z-10 section-animate ${isVisible ? 'visible' : ''}`}>
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-accent text-xs font-bold tracking-widest uppercase mb-4">Simple as 1-2-3</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground leading-tight">
            From Zero to AI-Powered Farming<br />in 3 Simple Steps
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-20 left-[20%] right-[20%] h-[2px] border-t-2 border-dashed border-primary/40" />

          {steps.map((s, i) => (
            <div key={i} className="text-center relative">
              <div className="w-16 h-16 rounded-full border-2 border-accent mx-auto mb-4 flex items-center justify-center">
                <span className="font-mono text-xl font-bold text-accent">{s.num}</span>
              </div>
              <div className="w-12 h-12 rounded-xl green-gradient-bg flex items-center justify-center mx-auto mb-4">
                <s.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl font-bold text-primary-foreground mb-2">{s.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Phone mockup */}
        <div className="mt-16 flex justify-center">
          <div className="w-64 h-[500px] rounded-[2.5rem] border-4 border-primary-foreground/20 green-gradient-bg p-4 relative overflow-hidden shadow-2xl">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-green-dark rounded-full" />
            <div className="mt-8 space-y-3 px-2">
              <div className="bg-primary-foreground/20 rounded-xl p-3">
                <div className="text-xs font-semibold text-primary-foreground">🌾 Crop Recommendation</div>
                <div className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Best crop: Maize • 99.3% match</div>
              </div>
              <div className="bg-primary-foreground/20 rounded-xl p-3">
                <div className="text-xs font-semibold text-primary-foreground">⛅ Weather Today</div>
                <div className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>32°C • No rain • Good for spraying</div>
              </div>
              <div className="bg-primary-foreground/20 rounded-xl p-3">
                <div className="text-xs font-semibold text-primary-foreground">📈 Cotton Price</div>
                <div className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>₹7,240/qtl ↑ 3.2% this week</div>
              </div>
              <div className="bg-primary-foreground/20 rounded-xl p-3">
                <div className="text-xs font-semibold text-primary-foreground">🔬 Disease Alert</div>
                <div className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Early blight risk • Apply fungicide</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <a href="#get-started" className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-card text-primary font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5">
            🚀 Start Your AI Farming Journey — It's Free
          </a>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
