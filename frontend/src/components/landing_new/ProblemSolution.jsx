import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { ArrowRight } from 'lucide-react';

const problems = [
  'Wrong crop selection = crop failure & debt',
  'Undetected diseases destroy 20-40% of yield',
  'Selling crops below market price = huge losses',
  'No access to skilled workers during harvest season',
];

const solutions = [
  'AI recommends the perfect crop for your soil & climate',
  'Photo-based disease detection in 2 seconds',
  'Live mandi prices from 2,400+ markets in real-time',
  'Instant booking of local farm workers & transport',
];

const ProblemSolution = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className="py-20 bg-green-light">
      <div className={`container mx-auto px-4 section-animate ${isVisible ? 'visible' : ''}`}>
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Problem */}
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
              Indian Farmers Face These Challenges Every Day
            </h2>
            <div className="space-y-4">
              {problems.map((p, i) => (
                <div key={i} className="bg-card rounded-2xl p-5 border-l-4 border-destructive card-shadow">
                  <p className="text-foreground font-medium">❌ {p}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Solution */}
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
              Rythu Mitra Solves All of This with AI
            </h2>
            <div className="space-y-4">
              {solutions.map((s, i) => (
                <div key={i} className="bg-card rounded-2xl p-5 border-l-4 border-primary card-shadow">
                  <p className="text-foreground font-medium">✅ {s}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center divider */}
        <div className="flex items-center justify-center mt-12">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full green-gradient-bg text-primary-foreground font-bold text-lg">
            Rythu Mitra <ArrowRight className="w-5 h-5" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;
