import { useNavigate } from "react-router-dom";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

export default function DemoPreview() {
  const navigate = useNavigate();
  const { ref, isVisible } = useScrollAnimation();
  return (
    <section id="demo" ref={ref} className="bg-card py-20 lg:py-28">
      <div className={`mx-auto max-w-6xl px-4 section-fade-in ${isVisible ? "visible" : ""}`}>
        <div className="text-center">
          <span className="inline-block rounded-full bg-green-light px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
            Console preview
          </span>
          <h2 className="mt-6 font-display text-3xl font-bold text-foreground sm:text-4xl">
            A glance at the Rythu Mitra dashboard
          </h2>
        </div>

        <div className="mt-12 overflow-hidden rounded-2xl border border-border shadow-green-lg">
          <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-3">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-destructive/60" />
              <div className="h-3 w-3 rounded-full bg-gold/60" />
              <div className="h-3 w-3 rounded-full bg-primary/60" />
            </div>
            <div className="mx-auto rounded-lg bg-card px-6 py-1 text-xs text-muted-foreground">
              Your dashboard after sign-in
            </div>
          </div>
          <div className="grid gap-4 bg-green-light p-6 sm:grid-cols-2">
            <div className="rounded-2xl bg-card p-5 shadow-sm">
              <div className="mb-2 text-xs font-semibold uppercase text-primary">Crop recommendation</div>
              <div className="text-lg font-bold text-foreground">Ranked crops for your soil</div>
              <p className="mt-1 text-sm text-muted-foreground">{`Based on NPK, moisture and season inputs you provide`}</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[70%] rounded-full bg-green-gradient-light" />
              </div>
            </div>
            <div className="rounded-2xl bg-card p-5 shadow-sm">
              <div className="mb-2 text-xs font-semibold uppercase text-primary">Disease detection</div>
              <div className="text-lg font-bold text-foreground">Leaf analysis</div>
              <p className="mt-1 text-sm text-muted-foreground">Photo → structured guidance (not a substitute for a field visit)</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[75%] rounded-full bg-gold-gradient" />
              </div>
            </div>
            <div className="rounded-2xl bg-card p-5 shadow-sm">
              <div className="mb-2 text-xs font-semibold uppercase text-primary">Market prices</div>
              <div className="text-lg font-bold text-foreground">Trend view</div>
              <p className="mt-1 text-sm text-muted-foreground">Illustrative bars — live data appears after login</p>
              <div className="mt-3 flex gap-1">
                {[40, 55, 35, 65, 50, 70, 85].map((h, i) => (
                  <div key={i} className="flex-1 rounded-sm bg-primary/30" style={{ height: h * 0.5 }}>
                    <div className="w-full rounded-sm bg-primary" style={{ height: "60%", marginTop: "40%" }} />
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-card p-5 shadow-sm">
              <div className="mb-2 text-xs font-semibold uppercase text-primary">Weather</div>
              <div className="text-lg font-bold text-foreground">Week ahead</div>
              <p className="mt-1 text-sm text-muted-foreground">District forecast with spray and irrigation hints</p>
              <div className="mt-3 flex gap-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri"].map((d) => (
                  <div key={d} className="flex-1 rounded-lg bg-muted py-2 text-center">
                    <div className="text-[10px] text-muted-foreground">{d}</div>
                    <div className="mt-1 text-xs font-bold text-foreground">—</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="btn-rythu border-2 border-primary px-6 py-3 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground"
            >
              Open crop tools
            </button>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="btn-rythu border-2 border-primary px-6 py-3 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground"
            >
              Open disease lab
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
