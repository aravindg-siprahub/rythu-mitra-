import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const DownloadCTA = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="download" ref={ref} className="relative py-20 overflow-hidden green-gradient-bg">
      {/* Decorative leaf shapes */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-10"
          style={{
            width: 60 + i * 30,
            height: 60 + i * 30,
            background: 'white',
            left: `${10 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
            borderRadius: '50% 0 50% 0',
            transform: `rotate(${i * 45}deg)`,
          }}
        />
      ))}

      <div className={`container mx-auto px-4 relative z-10 text-center section-animate ${isVisible ? 'visible' : ''}`}>
        <h2 className="font-display text-4xl md:text-6xl font-bold text-primary-foreground leading-tight mb-6">
          Start Your AI Farming Journey<br />Today — It's Completely Free
        </h2>
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
          Join 12.4 million farmers already using Rythu Mitra to grow more, earn more, and waste less.
        </p>


        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-primary-foreground/80">
          <span>🔒 100% Free</span>
          <span>🌿 No Ads</span>
          <span>⚡ Works on 2G</span>
        </div>
      </div>
    </section>
  );
};

export default DownloadCTA;
