import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import { Quote } from "lucide-react";

const useCases = [
  {
    scenario: "You are unsure which crop fits this season on your land.",
    outcome:
      "Soil inputs and weather context narrow the list so you discuss options with your family or FPO with confidence.",
    crop: "Crop selection",
  },
  {
    scenario: "You see yellowing or spots but are not sure what it is.",
    outcome:
      "A clear photo and notes help the app guide you toward likely causes and safe next checks before you buy inputs.",
    crop: "Disease & pest",
  },
  {
    scenario: "You are ready to sell and want a fair reference point.",
    outcome:
      "Trends and mandi-style context help you compare timing and outlets instead of relying on a single quote.",
    crop: "Markets",
  },
];

export default function UseCasesSection() {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <section ref={ref} className="bg-green-light py-20 lg:py-28">
      <div className={`mx-auto max-w-7xl px-4 section-fade-in ${isVisible ? "visible" : ""}`}>
        <div className="text-center">
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
            Typical scenarios
          </span>
          <h2 className="mt-6 font-display text-3xl font-bold text-foreground sm:text-4xl">
            Where the console helps
          </h2>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          {useCases.map((t) => (
            <div
              key={t.crop}
              className="card-rythu bg-card p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-green-lg"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-light">
                <Quote className="h-6 w-6 text-primary" />
              </div>
              <span className="mb-4 inline-block rounded-full bg-green-light px-3 py-1 text-xs font-semibold text-primary">
                {t.crop}
              </span>
              <h3 className="font-display text-base font-bold italic leading-relaxed text-foreground">
                &ldquo;{t.scenario}&rdquo;
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{t.outcome}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Guidance is decision support only — always follow local agronomy advice and regulation.
          </p>
        </div>
      </div>
    </section>
  );
}
