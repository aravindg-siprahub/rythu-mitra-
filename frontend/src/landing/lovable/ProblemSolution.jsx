import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import { ArrowRight } from "lucide-react";

const problems = [
  "Choosing the wrong crop for soil and weather can waste a season.",
  "Diseases and pests spread fast when symptoms are missed early.",
  "Selling without price context often means leaving money on the table.",
  "Peak labour and transport needs are hard to coordinate at short notice.",
];

const solutions = [
  "Crop tools use soil and climate inputs to narrow sensible options for your land.",
  "Upload leaf or field photos to get structured guidance and next steps.",
  "See mandi-style price context and trends so timing decisions are clearer.",
  "Book labour, machinery and transport flows inside the same console.",
];

export default function ProblemSolution() {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <section ref={ref} className="bg-green-light py-20 lg:py-28">
      <div className={`mx-auto max-w-7xl px-4 section-fade-in ${isVisible ? "visible" : ""}`}>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground lg:text-4xl">
              Challenges farmers face every season
            </h2>
            <div className="mt-8 space-y-4">
              {problems.map((p, i) => (
                <div
                  key={i}
                  className="rounded-2xl border-l-4 border-destructive bg-card p-5 shadow-sm"
                >
                  <span className="text-muted-foreground">{p}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-display text-3xl font-bold text-foreground lg:text-4xl">
              How Rythu Mitra supports you
            </h2>
            <div className="mt-8 space-y-4">
              {solutions.map((s, i) => (
                <div
                  key={i}
                  className="rounded-2xl border-l-4 border-primary bg-card p-5 shadow-sm"
                >
                  <span className="text-muted-foreground">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <div className="flex items-center gap-2 rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground">
            Rythu Mitra <ArrowRight className="h-5 w-5" />
          </div>
        </div>
      </div>
    </section>
  );
}
