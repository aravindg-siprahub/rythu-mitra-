import { ChevronDown } from 'lucide-react';

const particles = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  delay: `${Math.random() * 6}s`,
  size: 4 + Math.random() * 6,
}));

const HeroSection = () => (
  <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
    {/* BG Image */}
    <img
      src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&q=80"
      alt="Indian paddy field at golden hour"
      className="absolute inset-0 h-full w-full object-cover"
      loading="eager"
    />
    {/* Overlay */}
    <div className="absolute inset-0" style={{ background: 'rgba(15,31,15,0.65)' }} />

    {/* Particles */}
    {particles.map(p => (
      <div
        key={p.id}
        className="absolute rounded-full animate-float"
        style={{
          left: p.left, top: p.top,
          width: p.size, height: p.size,
          background: 'hsla(142,72%,45%,0.4)',
          animationDelay: p.delay,
        }}
      />
    ))}

    {/* Content */}
    <div className="relative z-10 mx-auto max-w-[900px] px-4 text-center">
      {/* Badge */}
      <div className="mx-auto mb-8 inline-block rounded-full glass-dark px-6 py-2.5 text-sm font-medium text-primary-foreground border border-primary-foreground/20">
        🌿 India's AI-Powered Agricultural Intelligence Platform
      </div>

      <h1 className="font-display text-4xl font-bold leading-tight text-primary-foreground sm:text-5xl md:text-6xl lg:text-7xl">
        Empowering Every
        <br />
        <span className="text-gradient">Indian Farmer</span>
        <br />
        with the Power of AI
      </h1>

      <p className="mx-auto mt-6 max-w-2xl text-base font-body text-primary-foreground/80 sm:text-lg md:text-xl">
        From soil analysis to harvest — Rythu Mitra gives every farmer access to AI crop recommendations, disease detection, live market prices, and smart advisories. Built for Indian agriculture.
      </p>

      {/* CTAs */}
      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <a href="#get-started" className="btn-rythu shimmer flex flex-col items-center bg-card px-8 py-4 text-primary shadow-green-lg hover:scale-105">
          <span className="text-lg font-bold">🚀 Get Early Access</span>
          <span className="text-xs text-muted-foreground">Free for all Indian farmers</span>
        </a>
        <a href="#features" className="btn-rythu flex flex-col items-center border-2 border-primary-foreground/40 px-8 py-4 text-primary-foreground hover:bg-primary-foreground/10">
          <span className="text-lg font-bold">🌾 Explore Features</span>
          <span className="text-xs text-primary-foreground/60">See what Rythu Mitra can do</span>
        </a>
      </div>

      {/* Trust */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-primary-foreground/70">
        <span>✅ AI-Powered Insights</span>
        <span>•</span>
        <span>✅ Real-Time Market Data</span>
        <span>•</span>
        <span>✅ Works on Any Device</span>
        <span>•</span>
        <span>✅ Free for Farmers</span>
      </div>
    </div>

    {/* Scroll indicator */}
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-slow">
      <ChevronDown className="h-8 w-8 text-primary-foreground/50" />
    </div>
  </section>
);
export default HeroSection;
