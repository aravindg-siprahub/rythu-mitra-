import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { Wheat, Microscope, TrendingUp, CloudSun, Users, Truck, MessageSquare } from 'lucide-react';

const features = [
  {
    icon: Wheat,
    title: 'AI Crop Recommendation',
    desc: 'Enter your soil NPK values, temperature, humidity and rainfall — our ML model trained on 2,200+ samples recommends the most profitable crop with 99.3% accuracy.',
    stats: '99.3% Accuracy • 22 Crops',
    cta: 'Try It Free →',
  },
  {
    icon: Microscope,
    title: 'AI Plant Disease Detection',
    desc: 'Upload a single photo of your crop leaf. Our computer vision model identifies 38+ diseases in under 2 seconds and gives you instant treatment recommendations.',
    stats: '38 Diseases • 2 Second Detection',
    cta: 'Upload Leaf Photo →',
  },
  {
    icon: TrendingUp,
    title: 'Live Mandi Market Intelligence',
    desc: 'Real-time crop prices from 2,400+ mandis across India. Get price trend predictions so you know the perfect day to sell your harvest for maximum profit.',
    stats: '2,400+ Mandis • Updated Every 15min',
    cta: 'Check Prices →',
  },
  {
    icon: CloudSun,
    title: 'Hyperlocal Weather Intelligence',
    desc: '7-day district-level weather forecasts with AI-powered farming advisories. Know exactly when to sow, irrigate, spray, and harvest.',
    stats: '542 Districts • 7-Day Forecast',
    cta: 'Check My Weather →',
  },
  {
    icon: Users,
    title: 'Agricultural Workforce Booking',
    desc: 'Instantly book verified, skilled farm workers for harvesting, planting, and spraying. Rated workers, transparent pricing, no middlemen.',
    stats: 'Verified Workers • Instant Booking',
    cta: 'Find Workers →',
  },
  {
    icon: Truck,
    title: 'Crop Transport Network',
    desc: 'Book tractors and trucks to transport your harvest to mandi or warehouse. Real-time tracking, transparent pricing, reliable drivers.',
    stats: 'Multiple Vehicle Types • GPS Tracked',
    cta: 'Book Transport →',
  },
  {
    icon: MessageSquare,
    title: 'Personalized AI Advisory',
    desc: 'Daily AI-generated advisories powered by GPT — covering crop care, pest alerts, market timing, and government scheme notifications.',
    stats: 'GPT-Powered • Daily Updates',
    cta: 'Read Advisories →',
  },
];

const Features = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="features" ref={ref} className="py-20 bg-card">
      <div className={`container mx-auto px-4 section-animate ${isVisible ? 'visible' : ''}`}>
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase mb-4">What We Offer</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground leading-tight">
            Everything a Farmer Needs,<br />
            <span className="gradient-text">Powered by Artificial Intelligence</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="group bg-card rounded-2xl p-6 border border-border hover:card-shadow-hover transition-all duration-300 hover:-translate-y-1 border-t-4 border-t-primary">
              <div className="w-12 h-12 rounded-xl green-gradient-bg flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-3">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">{f.desc}</p>
              <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">{f.stats}</div>
              <div>
                <a href="#" className="text-primary font-semibold text-sm hover:underline">{f.cta}</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
