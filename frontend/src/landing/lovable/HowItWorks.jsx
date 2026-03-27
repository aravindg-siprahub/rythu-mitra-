import { useNavigate } from "react-router-dom";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import { Smartphone, MapPin, Rocket } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: Smartphone,
    title: "Create your account",
    desc: "Register with email. No payment is required to open a farmer account.",
  },
  {
    num: "02",
    icon: MapPin,
    title: "Set your farm profile",
    desc: "Add state, district and land details so recommendations stay relevant.",
  },
  {
    num: "03",
    icon: Rocket,
    title: "Use the console each week",
    desc: "Check crop, disease, weather and market tiles before major field decisions.",
  },
];

export default function HowItWorks() {
  const navigate = useNavigate();
  const { ref, isVisible } = useScrollAnimation();
  return (
    <section
      id="how-it-works"
      ref={ref}
      className="relative overflow-hidden bg-green-dark py-20 lg:py-28"
    >
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.5\'/%3E%3C/svg%3E")',
        }}
      />

      <div className={`relative mx-auto max-w-7xl px-4 section-fade-in ${isVisible ? "visible" : ""}`}>
        <div className="text-center">
          <span className="inline-block rounded-full bg-primary-foreground/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground">
            Simple steps
          </span>
          <h2 className="mt-6 font-display text-3xl font-bold text-primary-foreground sm:text-4xl lg:text-5xl">
            From sign-up to weekly field rhythm
          </h2>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.num} className="relative text-center">
                {i < 2 && (
                  <div className="absolute left-[60%] top-12 hidden w-[80%] border-t-2 border-dashed border-primary-foreground/20 lg:block" />
                )}
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-2 border-gold">
                  <span className="font-mono-stat text-2xl font-bold text-gold">{step.num}</span>
                </div>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/10">
                  <Icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-display text-xl font-bold text-primary-foreground">{step.title}</h3>
                <p className="mx-auto mt-3 max-w-xs text-sm text-primary-foreground/70">{step.desc}</p>
              </div>
            );
          })}
        </div>

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
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="btn-rythu shimmer inline-block bg-card px-10 py-4 text-lg font-bold text-primary shadow-green-lg hover:scale-105"
          >
            Register — it&apos;s free
          </button>
        </div>
      </div>
    </section>
  );
}
