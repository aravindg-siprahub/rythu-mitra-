import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Wheat, Microscope, TrendingUp, CloudSun, Users, Truck, Brain } from 'lucide-react';

const features = [
  {
    icon: Wheat, title: 'AI Crop Recommendation',
    desc: 'Enter your soil NPK values, temperature, humidity and rainfall — our ML model recommends the most suitable and profitable crop for your specific conditions.',
    stats: '22 Crops • ML-Powered', cta: 'Learn More →',
  },
  {
    icon: Microscope, title: 'AI Plant Disease Detection',
    desc: 'Upload a photo of your crop leaf. Our computer vision model identifies diseases in seconds and provides instant treatment recommendations to save your harvest.',
    stats: '38+ Diseases • Instant Results', cta: 'Learn More →',
  },
  {
    icon: TrendingUp, title: 'Live Mandi Market Intelligence',
    desc: 'Access real-time crop prices from mandis across India. Get price trend insights so you can decide the best time to sell your harvest for maximum returns.',
    stats: '2,400+ Mandis • Real-Time Data', cta: 'Learn More →',
  },
  {
    icon: CloudSun, title: 'Hyperlocal Weather Intelligence',
    desc: '7-day district-level weather forecasts with AI-powered farming advisories. Know exactly when to sow, irrigate, spray, and harvest for optimal results.',
    stats: 'District-Level • 7-Day Forecast', cta: 'Learn More →',
  },
  {
    icon: Users, title: 'Agricultural Workforce Booking',
    desc: 'Find and book verified, skilled farm workers for harvesting, planting, and spraying. Transparent pricing and ratings — no middlemen involved.',
    stats: 'Verified Workers • Direct Booking', cta: 'Learn More →',
  },
  {
    icon: Truck, title: 'Crop Transport Network',
    desc: 'Book tractors and trucks to transport your harvest to mandi or warehouse. Real-time tracking, transparent pricing, and reliable service.',
    stats: 'Multiple Vehicle Types • GPS Tracked', cta: 'Learn More →',
  },
  {
    icon: Brain, title: 'Personalized AI Advisory',
    desc: 'Daily AI-generated advisories covering crop care, pest alerts, market timing, and government scheme notifications — personalized for your region and crops.',
    stats: 'AI-Powered • Daily Updates', cta: 'Learn More →',
  },
];

const FeaturesSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <section id="features" ref={ref} className="bg-card py-20 lg:py-28">
      <div className={`mx-auto max-w-7xl px-4 section-fade-in ${isVisible ? 'visible' : ''}`}>
        <div className="text-center">
          <span className="inline-block rounded-full bg-green-light px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">What We Offer</span>
          <h2 className="mt-6 font-display text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
            Everything a Farmer Needs,<br />
            <span className="text-gradient">Powered by Artificial Intelligence</span>
          </h2>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="group card-rythu border-t-4 border-primary bg-card p-7 transition-all duration-300 hover:-translate-y-2 hover:shadow-green-lg">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-gradient-light mb-5">
                  <Icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground">{f.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                <div className="mt-4 inline-block rounded-full bg-green-light px-3 py-1 text-xs font-medium text-primary">{f.stats}</div>
                <div className="mt-4">
                  <a href="#" className="text-sm font-semibold text-primary hover:underline">{f.cta}</a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
export default FeaturesSection;
