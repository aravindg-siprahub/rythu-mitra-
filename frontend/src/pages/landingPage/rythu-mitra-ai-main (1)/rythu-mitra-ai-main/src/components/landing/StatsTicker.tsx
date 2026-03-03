import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Sparkles, Leaf, Shield, Zap } from 'lucide-react';

const StatsTicker = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section
      ref={ref}
      className="relative py-20 overflow-hidden bg-background"
    >
      {/* Decorative floating circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-primary/5"
            style={{
              width: 80 + i * 40,
              height: 80 + i * 40,
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animation: `float-particle ${5 + i}s ease-in-out ${i * 0.5}s infinite`,
            }}
          />
        ))}
      </div>

      <div className={`container mx-auto px-4 relative z-10 section-animate ${isVisible ? 'visible' : ''}`}>
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase bg-primary/10 text-primary">
            <Sparkles className="w-3.5 h-3.5" /> Why Rythu Mitra
          </span>
        </div>

        {/* Headline */}
        <h2 className="font-display text-3xl md:text-5xl font-bold text-center text-foreground mb-4 leading-tight">
          The Future of Farming
          <br />
          <span className="gradient-text">
            is Already Here
          </span>
        </h2>

        <p className="text-center text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed text-muted-foreground">
          One platform. Every tool a farmer needs. Powered by cutting-edge artificial intelligence — and completely free.
        </p>

        {/* 3 highlight cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            {
              icon: Leaf,
              title: 'AI That Understands Your Soil',
              desc: 'Our ML models analyze NPK values, climate & rainfall to recommend the perfect crop — with 99.3% accuracy.',
            },
            {
              icon: Shield,
              title: 'Protect Crops Before It\'s Too Late',
              desc: 'Snap a photo of any leaf. Our vision AI detects 38+ diseases in 2 seconds and prescribes treatment instantly.',
            },
            {
              icon: Zap,
              title: 'Sell Smarter, Earn More',
              desc: 'Live prices from 2,400+ mandis with trend predictions — so you sell at peak price, not desperation price.',
            },
          ].map((card, i) => (
            <div
              key={i}
              className="group rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1 bg-card border border-border card-shadow hover:card-shadow-hover"
            >
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 bg-primary/10">
                <card.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-2">{card.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsTicker;
