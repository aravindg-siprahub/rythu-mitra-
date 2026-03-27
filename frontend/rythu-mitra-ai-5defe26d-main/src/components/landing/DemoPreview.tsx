import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const DemoPreview = () => {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <section id="demo" ref={ref} className="bg-card py-20 lg:py-28">
      <div className={`mx-auto max-w-6xl px-4 section-fade-in ${isVisible ? 'visible' : ''}`}>
        <div className="text-center">
          <span className="inline-block rounded-full bg-green-light px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">See It In Action</span>
          <h2 className="mt-6 font-display text-3xl font-bold text-foreground sm:text-4xl">A Glimpse into the Rythu Mitra Platform</h2>
        </div>

        {/* Browser mockup */}
        <div className="mt-12 rounded-2xl shadow-green-lg border border-border overflow-hidden">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-3">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-destructive/60" />
              <div className="h-3 w-3 rounded-full bg-gold/60" />
              <div className="h-3 w-3 rounded-full bg-primary/60" />
            </div>
            <div className="mx-auto rounded-lg bg-card px-6 py-1 text-xs text-muted-foreground">app.rythumitra.com/dashboard</div>
          </div>
          {/* Dashboard content */}
          <div className="bg-green-light p-6 grid gap-4 sm:grid-cols-2">
            {/* Crop recommendation */}
            <div className="rounded-2xl bg-card p-5 shadow-sm">
              <div className="text-xs font-semibold uppercase text-primary mb-2">🌾 Crop Recommendation</div>
              <div className="text-lg font-bold text-foreground">AI-Recommended Crop for Your Soil</div>
              <p className="text-sm text-muted-foreground mt-1">Based on soil NPK values, temperature, humidity & rainfall data</p>
              <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full w-[85%] rounded-full bg-green-gradient-light" />
              </div>
            </div>
            {/* Disease detection */}
            <div className="rounded-2xl bg-card p-5 shadow-sm">
              <div className="text-xs font-semibold uppercase text-primary mb-2">🔬 Disease Detection</div>
              <div className="text-lg font-bold text-foreground">Leaf Analysis Results</div>
              <p className="text-sm text-muted-foreground mt-1">Upload a photo → Get instant diagnosis with treatment plan</p>
              <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full w-[92%] rounded-full bg-gold-gradient" />
              </div>
            </div>
            {/* Market prices */}
            <div className="rounded-2xl bg-card p-5 shadow-sm">
              <div className="text-xs font-semibold uppercase text-primary mb-2">📈 Market Prices</div>
              <div className="text-lg font-bold text-foreground">Live Mandi Price Tracker</div>
              <p className="text-sm text-muted-foreground mt-1">Compare prices across mandis to find the best deal</p>
              <div className="mt-3 flex gap-1">
                {[40, 55, 35, 65, 50, 70, 85].map((h, i) => (
                  <div key={i} className="flex-1 rounded-sm bg-primary/30" style={{ height: h * 0.5 }}>
                    <div className="w-full rounded-sm bg-primary" style={{ height: '60%', marginTop: '40%' }} />
                  </div>
                ))}
              </div>
            </div>
            {/* Weather */}
            <div className="rounded-2xl bg-card p-5 shadow-sm">
              <div className="text-xs font-semibold uppercase text-primary mb-2">⛅ Weather Advisory</div>
              <div className="text-lg font-bold text-foreground">7-Day Farming Forecast</div>
              <p className="text-sm text-muted-foreground mt-1">District-level weather with AI-powered farming advice</p>
              <div className="mt-3 flex gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(d => (
                  <div key={d} className="flex-1 text-center rounded-lg bg-muted py-2">
                    <div className="text-[10px] text-muted-foreground">{d}</div>
                    <div className="text-xs font-bold text-foreground mt-1">☀️</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="flex flex-wrap justify-center gap-3">
            <a href="#get-started" className="btn-rythu border-2 border-primary px-6 py-3 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground">🌾 Try Crop AI</a>
            <a href="#get-started" className="btn-rythu border-2 border-primary px-6 py-3 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground">🔬 Try Disease Detection</a>
          </div>
        </div>
      </div>
    </section>
  );
};
export default DemoPreview;
