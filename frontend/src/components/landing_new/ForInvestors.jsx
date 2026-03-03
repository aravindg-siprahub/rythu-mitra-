import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { BarChart3, TrendingUp, Users, Globe } from 'lucide-react';

const tractionCards = [
  { label: 'TAM', value: '$400B', sub: 'Indian Agriculture Market', icon: Globe },
  { label: 'SAM', value: '$12B', sub: 'AgriTech Addressable Market', icon: BarChart3 },
  { label: 'Users', value: '12.4M', sub: 'Registered Farmers', icon: Users },
  { label: 'Growth', value: '340%', sub: 'Year over Year', icon: TrendingUp },
];

const ForInvestors = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className="py-20 bg-card">
      <div className={`container mx-auto px-4 section-animate ${isVisible ? 'visible' : ''}`}>
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-bold tracking-widest uppercase mb-4">Investment Opportunity</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground leading-tight">
            Building the Operating System<br />for Indian Agriculture
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left - Vision */}
          <div>
            <p className="text-muted-foreground leading-relaxed mb-8 text-lg">
              India has 140 million farm holdings. Less than 2% have access to AI-powered decision making.
              Rythu Mitra is changing that — one farmer at a time.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              We are building the data layer, AI layer, and marketplace layer for the $400 billion Indian agriculture sector.
            </p>
            <div className="space-y-3">
              {[
                ['📊', '12.4M registered users (organic growth)'],
                ['📈', '340% YoY user growth'],
                ['💰', 'Multiple monetization channels'],
                ['🏛️', 'Government partnership ready'],
                ['🌍', 'Expansion to 5 South Asian markets planned'],
              ].map(([icon, text], i) => (
                <div key={i} className="flex items-center gap-3 text-foreground">
                  <span>{icon}</span>
                  <span className="font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Traction cards */}
          <div className="grid grid-cols-2 gap-4">
            {tractionCards.map((c, i) => (
              <div key={i} className="rounded-2xl border border-border p-6 text-center hover:card-shadow-hover transition-all duration-300 hover:-translate-y-1">
                <c.icon className="w-8 h-8 text-accent mx-auto mb-3" />
                <span className="font-mono text-3xl font-bold text-foreground block">{c.value}</span>
                <span className="text-xs text-muted-foreground mt-1 block">{c.sub}</span>
                <span className="inline-block mt-2 px-2 py-0.5 rounded bg-accent/10 text-accent text-[10px] font-bold uppercase">{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <a href="mailto:invest@rythumitra.com" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border-2 border-accent text-accent font-bold text-lg hover:bg-accent/5 transition-colors">
            📧 Contact for Investment Deck
          </a>
        </div>
      </div>
    </section>
  );
};

export default ForInvestors;
