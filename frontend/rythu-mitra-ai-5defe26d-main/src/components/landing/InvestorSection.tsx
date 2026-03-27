import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { BarChart3, TrendingUp, Sprout, Building2, Globe } from 'lucide-react';

const vision = [
  { icon: BarChart3, label: 'AI-first approach to agricultural decision-making' },
  { icon: TrendingUp, label: 'Scalable across all Indian states and crop types' },
  { icon: Sprout, label: 'Free for farmers — sustainable monetization model planned' },
  { icon: Building2, label: 'Government partnership and B2B integration ready' },
  { icon: Globe, label: 'Expandable to South Asian and African markets' },
];
const opportunity = [
  { label: 'TAM', value: '$400B', sub: 'Indian Agriculture Market' },
  { label: 'SAM', value: '$12B', sub: 'AgriTech Addressable Market' },
  { label: 'Farm Holdings', value: '140M+', sub: 'Across India' },
  { label: 'AI Adoption', value: '<2%', sub: 'Current Penetration' },
];

const InvestorSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <section id="about" ref={ref} className="bg-card py-20 lg:py-28">
      <div className={`mx-auto max-w-7xl px-4 section-fade-in ${isVisible ? 'visible' : ''}`}>
        <div className="text-center">
          <span className="inline-block rounded-full bg-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold border border-gold/30">The Opportunity</span>
          <h2 className="mt-6 font-display text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
            Building the Operating System<br />
            <span className="text-gradient">for Indian Agriculture</span>
          </h2>
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-2">
          <div>
            <p className="text-lg leading-relaxed text-muted-foreground">
              India has over 140 million farm holdings. Less than 2% have access to AI-powered decision-making tools. Rythu Mitra is designed to bridge this gap — making advanced agricultural AI accessible to every farmer.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              We are building the data layer, AI layer, and marketplace layer for the $400 billion Indian agriculture sector — starting with the tools farmers need most.
            </p>
            <div className="mt-8 space-y-4">
              {vision.map(m => {
                const Icon = m.icon;
                return (
                  <div key={m.label} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-light">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{m.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {opportunity.map(t => (
              <div key={t.label} className="card-rythu bg-card border border-border p-6 text-center">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.label}</div>
                <div className="mt-2 font-mono-stat text-3xl font-bold text-foreground">{t.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{t.sub}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <a href="mailto:hello@rythumitra.com" className="btn-rythu inline-block border-2 border-gold px-8 py-3 text-gold font-semibold hover:bg-gold hover:text-accent-foreground">
            📧 Get in Touch
          </a>
        </div>
      </div>
    </section>
  );
};
export default InvestorSection;
