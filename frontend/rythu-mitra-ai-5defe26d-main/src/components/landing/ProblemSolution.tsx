import { useScrollAnimation } from '@/hooks/useScrollAnimation';
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
    <section ref={ref} className="bg-green-light py-20 lg:py-28">
      <div className={`mx-auto max-w-7xl px-4 section-fade-in ${isVisible ? 'visible' : ''}`}>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
          {/* Problem */}
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground lg:text-4xl">
              Indian Farmers Face These Challenges Every Day
            </h2>
            <div className="mt-8 space-y-4">
              {problems.map((p, i) => (
                <div key={i} className="rounded-2xl bg-card p-5 border-l-4 border-destructive shadow-sm">
                  <span className="text-muted-foreground">❌ {p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Divider (desktop) */}
          <div className="hidden lg:flex items-center justify-center absolute left-1/2 -translate-x-1/2 self-center" style={{ position: 'relative', left: 'auto', transform: 'none' }}>
          </div>

          {/* Solution */}
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground lg:text-4xl">
              Rythu Mitra Solves All of This with AI
            </h2>
            <div className="mt-8 space-y-4">
              {solutions.map((s, i) => (
                <div key={i} className="rounded-2xl bg-card p-5 border-l-4 border-primary shadow-sm">
                  <span className="text-muted-foreground">✅ {s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <div className="flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-primary-foreground font-semibold">
            Rythu Mitra <ArrowRight className="h-5 w-5" />
          </div>
        </div>
      </div>
    </section>
  );
};
export default ProblemSolution;
