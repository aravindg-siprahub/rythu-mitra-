import { useScrollAnimation } from "../../hooks/useScrollAnimation";

const whyItMatters = [
  {
    icon: "🌾",
    title: "Smarter crop choices",
    desc: "Bring soil, water and market context together before you commit seed and fertiliser.",
  },
  {
    icon: "🔬",
    title: "Earlier problem spotting",
    desc: "Structured checks on symptoms help you act before issues spread across the plot.",
  },
  {
    icon: "📈",
    title: "Clearer selling conversations",
    desc: "Price bands and trends support talks with traders — not rumours alone.",
  },
  {
    icon: "⚡",
    title: "Built for real devices",
    desc: "Designed for common smartphones and patchy networks in rural India.",
  },
];

const targetStates = [
  "Andhra Pradesh",
  "Telangana",
  "Maharashtra",
  "Karnataka",
  "Tamil Nadu",
  "Punjab",
  "Uttar Pradesh",
  "Madhya Pradesh",
  "Rajasthan",
  "Gujarat",
];

export default function ImpactSection() {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <section id="impact" ref={ref} className="relative overflow-hidden py-20 lg:py-28">
      <img
        src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80"
        alt="Aerial view of farmland"
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-foreground/75" />

      <div className={`relative mx-auto max-w-7xl px-4 section-fade-in ${isVisible ? "visible" : ""}`}>
        <div className="text-center">
          <span className="inline-block rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground">
            Why it matters
          </span>
          <h2 className="mt-6 font-display text-3xl font-bold text-primary-foreground sm:text-4xl lg:text-5xl">
            Better information at the right time
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/70">
            India has a large number of small and marginal holdings. Rythu Mitra is built to put
            decision support within reach of everyday farmers — not only large farms.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {whyItMatters.map((item) => (
            <div
              key={item.title}
              className="glass-dark rounded-2xl border border-primary-foreground/10 p-8 text-center"
            >
              <div className="mb-4 text-4xl">{item.icon}</div>
              <h3 className="font-display text-lg font-bold text-primary-foreground">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-primary-foreground/70">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="mb-4 text-sm font-semibold text-primary-foreground/80">
            States where teams typically onboard farmers first
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {targetStates.map((state) => (
              <span
                key={state}
                className="rounded-full border border-primary/40 bg-primary/30 px-4 py-1.5 text-xs font-medium text-primary-foreground"
              >
                {state}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
