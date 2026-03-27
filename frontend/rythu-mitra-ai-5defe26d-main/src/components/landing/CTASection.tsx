const CTASection = () => (
  <section id="get-started" className="relative bg-green-gradient py-20 lg:py-28 overflow-hidden">
    {/* Decorative leaves */}
    {[...Array(6)].map((_, i) => (
      <div
        key={i}
        className="absolute rounded-full opacity-10"
        style={{
          width: 60 + i * 30,
          height: 60 + i * 30,
          background: 'white',
          borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
          left: `${10 + i * 15}%`,
          top: `${20 + (i % 3) * 25}%`,
          transform: `rotate(${i * 45}deg)`,
        }}
      />
    ))}

    <div className="relative mx-auto max-w-4xl px-4 text-center">
      <h2 className="font-display text-3xl font-bold text-primary-foreground sm:text-4xl lg:text-[56px] lg:leading-tight">
        Start Your AI Farming Journey<br />Today — It's Completely Free
      </h2>
      <p className="mt-6 text-lg text-primary-foreground/80">
        Rythu Mitra is free for every Indian farmer. Sign up now and start making smarter, data-driven farming decisions.
      </p>

      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <a href="#" className="btn-rythu shimmer flex flex-col items-center bg-card px-10 py-5 text-primary shadow-green-lg hover:scale-105">
          <span className="text-lg font-bold">🚀 Get Early Access</span>
          <span className="text-xs text-muted-foreground">Free for all farmers</span>
        </a>
        <a href="#features" className="btn-rythu flex flex-col items-center border-2 border-primary-foreground/40 px-10 py-5 text-primary-foreground hover:bg-primary-foreground/10">
          <span className="text-lg font-bold">🌾 Explore the Platform</span>
          <span className="text-xs text-primary-foreground/60">See all features</span>
        </a>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-primary-foreground/70">
        <span>🔒 100% Free</span>
        <span>🌿 No Ads</span>
        <span>⚡ Works on 2G</span>
      </div>
    </div>
  </section>
);
export default CTASection;
