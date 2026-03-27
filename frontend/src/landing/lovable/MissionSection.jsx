import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import { BarChart3, TrendingUp, Sprout, Building2, Globe } from "lucide-react";

const vision = [
  { icon: BarChart3, label: "Data-informed decisions for small and large holdings alike." },
  { icon: TrendingUp, label: "Scalable design across states and crop systems." },
  { icon: Sprout, label: "Farmer-first pricing: core access free; optional services later." },
  { icon: Building2, label: "Room for FPOs, cooperatives and government programmes." },
  { icon: Globe, label: "Architecture that can extend to similar regions over time." },
];

export default function MissionSection() {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <section id="about" ref={ref} className="bg-card py-20 lg:py-28">
      <div className={`mx-auto max-w-7xl px-4 section-fade-in ${isVisible ? "visible" : ""}`}>
        <div className="text-center">
          <span className="inline-block rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold">
            Mission
          </span>
          <h2 className="mt-6 font-display text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
            An operating layer for
            <br />
            <span className="text-gradient">Indian agriculture</span>
          </h2>
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-2">
          <div>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Many farmers still rely on fragmented advice and delayed information. Rythu Mitra is
              built to pull crop health, weather, markets and operations into one workflow you can
              open from a normal phone.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              We focus on clarity and trust: what you see should help the next conversation with
              your family, your FPO or your buyer — not replace it.
            </p>
            <div className="mt-8 space-y-4">
              {vision.map((m) => {
                const Icon = m.icon;
                return (
                  <div key={m.label} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-light">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{m.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card-rythu border border-border bg-card p-6 text-center">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Focus
              </div>
              <div className="mt-2 font-mono-stat text-2xl font-bold text-foreground">{`Farmers`}</div>
              <div className="mt-1 text-sm text-muted-foreground">Primary users of the console</div>
            </div>
            <div className="card-rythu border border-border bg-card p-6 text-center">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Model
              </div>
              <div className="mt-2 font-mono-stat text-2xl font-bold text-foreground">{`Sustainable`}</div>
              <div className="mt-1 text-sm text-muted-foreground">Free core; optional paid services later</div>
            </div>
            <div className="card-rythu border border-border bg-card p-6 text-center sm:col-span-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Contact
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Partnerships and enterprise enquiries: use the email in the footer.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
