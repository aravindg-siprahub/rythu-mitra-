import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { useCountUp } from '../../hooks/useCountUp';

const impactStats = [
  { value: '₹2.4L', label: 'Average extra income per farmer per year' },
  { value: '40%', label: 'Reduction in crop losses from disease' },
  { value: '3x', label: 'Faster market price discovery' },
  { value: '94%', label: 'Farmer satisfaction rating' },
];

const activeStates = [
  'Andhra Pradesh', 'Telangana', 'Maharashtra', 'Karnataka',
  'Punjab', 'Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan',
  'Tamil Nadu', 'Gujarat', 'Kerala', 'Bihar',
  'West Bengal', 'Odisha', 'Haryana', 'Jharkhand',
  'Assam', 'Chhattisgarh',
];

const Impact = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="impact" ref={ref} className="relative py-20 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80)' }}
      />
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.75)' }} />

      <div className={`container mx-auto px-4 relative z-10 section-animate ${isVisible ? 'visible' : ''}`}>
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground leading-tight">
            Real Impact for Real Farmers
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {impactStats.map((s, i) => (
            <div key={i} className="glass-card-dark rounded-2xl p-6 text-center">
              <span className="block font-mono text-3xl md:text-4xl font-bold text-primary-foreground mb-2">{s.value}</span>
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Active states */}
        <div className="text-center">
          <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto mb-4">
            {activeStates.map(state => (
              <span key={state} className="px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30">
                {state}
              </span>
            ))}
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Active across 18 states and growing</p>
        </div>
      </div>
    </section>
  );
};

export default Impact;
