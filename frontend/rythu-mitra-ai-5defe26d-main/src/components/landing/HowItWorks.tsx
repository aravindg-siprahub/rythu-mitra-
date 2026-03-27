import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Smartphone, MapPin, Rocket } from 'lucide-react';

const steps = [
  { num: '01', icon: Smartphone, title: 'Sign Up on the Platform', desc: 'Create your free account on Rythu Mitra web platform or mobile app. No charges, no hidden fees — ever.' },
  { num: '02', icon: MapPin, title: 'Set Your Farm Profile', desc: 'Tell us your district, soil type, and crops you grow. It takes less than 2 minutes to get started.' },
  { num: '03', icon: Rocket, title: 'Get AI Recommendations', desc: 'Start receiving personalized crop recommendations, disease alerts, market prices, and daily advisories.' },
];

const HowItWorks = () => {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <section id="how-it-works" ref={ref} className="bg-green-dark py-20 lg:py-28 relative overflow-hidden">
      {/* grain texture */}
      <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.5\'/%3E%3C/svg%3E")' }} />

      <div className={`relative mx-auto max-w-7xl px-4 section-fade-in ${isVisible ? 'visible' : ''}`}>
        <div className="text-center">
          <span className="inline-block rounded-full bg-primary-foreground/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground">Simple as 1-2-3</span>
          <h2 className="mt-6 font-display text-3xl font-bold text-primary-foreground sm:text-4xl lg:text-5xl">
            From Zero to AI-Powered Farming<br />in 3 Simple Steps
          </h2>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.num} className="relative text-center">
                {/* connector line */}
                {i < 2 && <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] border-t-2 border-dashed border-primary-foreground/20" />}
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-2 border-gold">
                  <span className="font-mono-stat text-2xl font-bold text-gold">{step.num}</span>
                </div>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/10">
                  <Icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-display text-xl font-bold text-primary-foreground">{step.title}</h3>
                <p className="mt-3 text-sm text-primary-foreground/70 max-w-xs mx-auto">{step.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Phone mockup */}
        <div className="mt-16 flex justify-center">
          <div className="relative w-[280px] rounded-[36px] border-4 border-primary-foreground/20 bg-gradient-to-b from-primary to-secondary p-4">
            <div className="mx-auto mb-4 h-1.5 w-20 rounded-full bg-primary-foreground/30" />
            <div className="space-y-3 rounded-2xl bg-primary-foreground/10 p-4">
              <div className="h-6 w-3/4 rounded bg-primary-foreground/20" />
              <div className="h-20 rounded-xl bg-primary-foreground/15" />
              <div className="h-12 rounded-xl bg-primary-foreground/15" />
              <div className="h-12 rounded-xl bg-primary-foreground/15" />
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <a href="#get-started" className="btn-rythu shimmer inline-block bg-card px-10 py-4 text-lg font-bold text-primary shadow-green-lg hover:scale-105">
            🚀 Get Early Access — It's Free
          </a>
        </div>
      </div>
    </section>
  );
};
export default HowItWorks;
