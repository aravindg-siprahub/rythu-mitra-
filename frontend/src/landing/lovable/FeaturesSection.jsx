import { Link } from "react-router-dom";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import { Wheat, Microscope, TrendingUp, CloudSun, Users, Truck, Brain } from "lucide-react";

const features = [
  {
    icon: Wheat,
    title: "Crop recommendation",
    desc: "Enter soil and climate inputs to get ranked crop ideas suited to your field and season.",
    tag: "Soil & season",
  },
  {
    icon: Microscope,
    title: "Plant disease detection",
    desc: "Upload a clear photo of affected leaves. The app guides you toward likely issues and care steps.",
    tag: "Photo analysis",
  },
  {
    icon: TrendingUp,
    title: "Mandi market context",
    desc: "Follow price trends and comparisons so you can discuss timing and outlets with better information.",
    tag: "Price trends",
  },
  {
    icon: CloudSun,
    title: "Weather intelligence",
    desc: "Local forecasts with farming hints for sowing, irrigation, spraying and harvest windows.",
    tag: "District-level",
  },
  {
    icon: Users,
    title: "Workforce booking",
    desc: "Coordinate labour for planting, spraying and harvest when your module is enabled in your area.",
    tag: "Operations",
  },
  {
    icon: Truck,
    title: "Transport & logistics",
    desc: "Plan movement of produce to mandi or storage with transparent booking flows.",
    tag: "Logistics",
  },
  {
    icon: Brain,
    title: "Advisory layer",
    desc: "Seasonal reminders and alerts tied to your crops and region — not generic spam.",
    tag: "Regional",
  },
];

export default function FeaturesSection() {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <section id="features" ref={ref} className="bg-card py-20 lg:py-28">
      <div className={`mx-auto max-w-7xl px-4 section-fade-in ${isVisible ? "visible" : ""}`}>
        <div className="text-center">
          <span className="inline-block rounded-full bg-green-light px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
            What we offer
          </span>
          <h2 className="mt-6 font-display text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
            Everything a farmer needs,
            <br />
            <span className="text-gradient">in one connected console</span>
          </h2>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group card-rythu border-t-4 border-primary bg-card p-7 transition-all duration-300 hover:-translate-y-2 hover:shadow-green-lg"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-gradient-light">
                  <Icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground">{f.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                <div className="mt-4 inline-block rounded-full bg-green-light px-3 py-1 text-xs font-medium text-primary">
                  {f.tag}
                </div>
                <div className="mt-4">
                  <Link
                    to="/login"
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    Sign in to use this module →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
