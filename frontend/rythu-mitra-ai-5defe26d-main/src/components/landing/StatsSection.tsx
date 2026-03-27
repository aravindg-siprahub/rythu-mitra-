import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Wheat, MapPin, Bot, Microscope, TrendingUp, Zap } from 'lucide-react';

const stats = [
  { icon: Wheat, label: 'Crops Supported', value: '22+' },
  { icon: MapPin, label: 'Districts Ready', value: 'Pan-India' },
  { icon: Bot, label: 'AI Models Trained', value: '7' },
  { icon: Microscope, label: 'Diseases Detectable', value: '38+' },
  { icon: TrendingUp, label: 'Mandis Integrated', value: '2,400+' },
  { icon: Zap, label: 'Real-Time Processing', value: '<2s' },
];

const StatsSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <section ref={ref} className="bg-card py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className={`grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6 section-fade-in ${isVisible ? 'visible' : ''}`}>
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex flex-col items-center gap-3 min-w-[150px]">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-gradient-light">
                  <Icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <span className="font-mono-stat text-2xl font-bold text-foreground">{stat.value}</span>
                <span className="text-sm text-muted-foreground text-center">{stat.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
export default StatsSection;
