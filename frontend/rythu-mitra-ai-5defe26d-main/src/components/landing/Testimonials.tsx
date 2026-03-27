import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Quote } from 'lucide-react';

const useCases = [
  {
    scenario: 'A farmer unsure which crop to plant this season',
    outcome: 'Rythu Mitra analyzes soil NPK, temperature, humidity, and rainfall data to recommend the most profitable crop — eliminating the guesswork that often leads to poor yields.',
    crop: '🌾 Crop Selection',
  },
  {
    scenario: 'A farmer notices yellowing leaves but can\'t identify the disease',
    outcome: 'A single photo uploaded to Rythu Mitra instantly identifies the disease and provides specific treatment recommendations — catching problems before they spread to the entire field.',
    crop: '🔬 Disease Detection',
  },
  {
    scenario: 'A farmer ready to sell but unsure about current market rates',
    outcome: 'Real-time mandi prices from across India help the farmer compare rates and choose the best market and timing — potentially earning significantly more than selling blindly.',
    crop: '📈 Market Intelligence',
  },
];

const Testimonials = () => {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <section ref={ref} className="bg-green-light py-20 lg:py-28">
      <div className={`mx-auto max-w-7xl px-4 section-fade-in ${isVisible ? 'visible' : ''}`}>
        <div className="text-center">
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">Real-World Scenarios</span>
          <h2 className="mt-6 font-display text-3xl font-bold text-foreground sm:text-4xl">
            How Rythu Mitra Helps<br />at Every Stage of Farming
          </h2>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          {useCases.map(t => (
            <div key={t.crop} className="card-rythu bg-card p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-green-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-light mb-4">
                <Quote className="h-6 w-6 text-primary" />
              </div>
              <span className="inline-block rounded-full bg-green-light px-3 py-1 text-xs font-semibold text-primary mb-4">{t.crop}</span>
              <h3 className="font-display text-base font-bold text-foreground italic leading-relaxed">"{t.scenario}"</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{t.outcome}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Built with real agricultural datasets and validated by domain experts in Indian farming.
          </p>
        </div>
      </div>
    </section>
  );
};
export default Testimonials;
