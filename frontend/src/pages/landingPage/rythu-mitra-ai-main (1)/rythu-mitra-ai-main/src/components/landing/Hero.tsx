import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

const particles = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  top: Math.random() * 100,
  size: 3 + Math.random() * 5,
  delay: Math.random() * 5,
  duration: 4 + Math.random() * 4,
}));

const Hero = () => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const onScroll = () => setOffset(window.scrollY * 0.3);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* BG Image with parallax */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&q=80)',
          transform: `translateY(${offset}px)`,
        }}
      />
      <div className="absolute inset-0" style={{ background: 'rgba(15,31,15,0.65)' }} />

      {/* Particles */}
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full bg-primary/40"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            animation: `float-particle ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 text-center max-w-[900px] mx-auto px-4 py-20">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-card-dark text-primary-foreground text-sm font-medium mb-8">
          🌿 India's Most Advanced Agricultural AI Platform 2025
        </div>

        {/* Headline */}
        <h1 className="font-display font-bold text-primary-foreground leading-[1.1] mb-6">
          <span className="block text-5xl md:text-7xl">Empowering Every</span>
          <span className="block text-5xl md:text-7xl gradient-text" style={{ backgroundImage: 'linear-gradient(135deg, #22C55E, #F59E0B)', backgroundSize: '200% 200%', animation: 'gradient-shift 4s ease infinite' }}>
            Indian Farmer
          </span>
          <span className="block text-5xl md:text-7xl">with the Power of AI</span>
        </h1>

        {/* Sub */}
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
          From soil analysis to harvest — Rythu Mitra gives every farmer access to AI crop recommendations, disease detection, live market prices, and smart advisories. Free forever.
        </p>


        {/* Trust */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
          <span>✅ 12.4M Farmers</span>
          <span className="hidden sm:inline">•</span>
          <span>✅ 542 Districts</span>
          <span className="hidden sm:inline">•</span>
          <span>✅ 99.3% Accuracy</span>
          <span className="hidden sm:inline">•</span>
          <span>✅ Free Forever</span>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10" style={{ animation: 'bounce-arrow 2s ease infinite' }}>
        <ChevronDown className="w-8 h-8 text-primary-foreground/60" />
      </div>
    </section>
  );
};

export default Hero;
