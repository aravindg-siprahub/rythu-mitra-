import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import { Wheat, MapPin, Bot, Microscope, TrendingUp, Zap } from "lucide-react";

const stats = [
  { icon: Wheat, label: "Crop coverage", value: "Major crops" },
  { icon: MapPin, label: "Geography", value: "Across India" },
  { icon: Bot, label: "Guidance", value: "AI-assisted" },
  { icon: Microscope, label: "Disease help", value: "Photo + tips" },
  { icon: TrendingUp, label: "Markets", value: "Mandi context" },
  { icon: Zap, label: "Console", value: "One workflow" },
];

export default function StatsSection() {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <section ref={ref} className="bg-card py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div
          className={`grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6 section-fade-in ${
            isVisible ? "visible" : ""
          }`}
        >
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex min-w-[150px] flex-col items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-gradient-light">
                  <Icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <span className="font-mono-stat text-2xl font-bold text-foreground">{stat.value}</span>
                <span className="text-center text-sm text-muted-foreground">{stat.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
