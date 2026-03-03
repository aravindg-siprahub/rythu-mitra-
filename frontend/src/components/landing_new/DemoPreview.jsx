import { useScrollAnimation } from '../../hooks/useScrollAnimation';

const DemoPreview = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className="py-20 bg-card">
      <div className={`container mx-auto px-4 section-animate ${isVisible ? 'visible' : ''}`}>
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase mb-4">See It In Action</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">Watch Rythu Mitra Work in Real-Time</h2>
        </div>

        {/* Browser mockup */}
        <div className="max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-border">
          {/* Browser bar */}
          <div className="bg-muted px-4 py-3 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-destructive/60" />
              <div className="w-3 h-3 rounded-full bg-accent/60" />
              <div className="w-3 h-3 rounded-full bg-primary/60" />
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-card rounded-md px-3 py-1.5 text-xs text-muted-foreground">app.rythumitra.com/dashboard</div>
            </div>
          </div>

          {/* Dashboard content */}
          <div className="bg-card p-6 grid md:grid-cols-2 gap-4">
            {/* Crop rec card */}
            <div className="rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg green-gradient-bg flex items-center justify-center text-xs text-primary-foreground font-bold">🌾</div>
                <h4 className="font-semibold text-foreground text-sm">Crop Recommendation</h4>
              </div>
              <div className="bg-green-light rounded-lg p-3 mb-2">
                <span className="text-primary font-bold">Recommended: Maize</span>
                <span className="text-xs text-muted-foreground ml-2">99.3% match</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                <div className="bg-muted rounded p-2 text-center"><span className="block font-mono font-bold text-foreground">42</span>N (kg/ha)</div>
                <div className="bg-muted rounded p-2 text-center"><span className="block font-mono font-bold text-foreground">38</span>P (kg/ha)</div>
                <div className="bg-muted rounded p-2 text-center"><span className="block font-mono font-bold text-foreground">45</span>K (kg/ha)</div>
              </div>
            </div>

            {/* Disease detection */}
            <div className="rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg green-gradient-bg flex items-center justify-center text-xs text-primary-foreground font-bold">🔬</div>
                <h4 className="font-semibold text-foreground text-sm">Disease Detection</h4>
              </div>
              <div className="bg-destructive/10 rounded-lg p-3 mb-2">
                <span className="text-destructive font-bold">Detected: Early Blight</span>
                <span className="text-xs text-muted-foreground ml-2">98.7% confidence</span>
              </div>
              <p className="text-xs text-muted-foreground">Treatment: Apply Mancozeb 75% WP @ 2.5g/L water. Spray every 7-10 days.</p>
            </div>

            {/* Market price */}
            <div className="rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg green-gradient-bg flex items-center justify-center text-xs text-primary-foreground font-bold">📈</div>
                <h4 className="font-semibold text-foreground text-sm">Market Prices</h4>
              </div>
              <div className="space-y-2">
                {[['Cotton', '₹7,240', '+3.2%'], ['Rice', '₹2,180', '+1.1%'], ['Wheat', '₹2,450', '-0.5%']].map(([crop, price, change]) => (
                  <div key={crop} className="flex items-center justify-between bg-muted rounded-lg px-3 py-2 text-xs">
                    <span className="font-medium text-foreground">{crop}</span>
                    <span className="font-mono font-bold text-foreground">{price}/qtl</span>
                    <span className={change.startsWith('+') ? 'text-primary font-semibold' : 'text-destructive font-semibold'}>{change}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weather */}
            <div className="rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg green-gradient-bg flex items-center justify-center text-xs text-primary-foreground font-bold">⛅</div>
                <h4 className="font-semibold text-foreground text-sm">Weather Advisory</h4>
              </div>
              <div className="flex items-center gap-4 mb-2">
                <span className="text-4xl">☀️</span>
                <div>
                  <span className="font-mono text-2xl font-bold text-foreground">32°C</span>
                  <span className="block text-xs text-muted-foreground">Nalgonda, Telangana</span>
                </div>
              </div>
              <div className="bg-green-light rounded-lg p-2 text-xs text-primary font-medium">✅ Good conditions for pesticide spraying today</div>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
          <p className="w-full text-center text-sm text-muted-foreground mb-2">No signup needed to try</p>
          <a href="#" className="px-6 py-3 rounded-xl border-2 border-primary text-primary font-semibold hover:bg-primary/5 transition-colors">🌾 Try Crop AI Now</a>
          <a href="#" className="px-6 py-3 rounded-xl border-2 border-primary text-primary font-semibold hover:bg-primary/5 transition-colors">🔬 Try Disease Detection</a>
        </div>
      </div>
    </section>
  );
};

export default DemoPreview;
