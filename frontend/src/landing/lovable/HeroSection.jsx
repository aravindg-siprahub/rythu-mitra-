import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PARTICLES = [
  { id: 0, left: "12%", top: "18%", delay: "0s", size: 5 },
  { id: 1, left: "45%", top: "22%", delay: "1.2s", size: 6 },
  { id: 2, left: "78%", top: "35%", delay: "2.1s", size: 4 },
  { id: 3, left: "22%", top: "62%", delay: "0.8s", size: 7 },
  { id: 4, left: "65%", top: "58%", delay: "3s", size: 5 },
  { id: 5, left: "88%", top: "72%", delay: "1.5s", size: 6 },
  { id: 6, left: "35%", top: "40%", delay: "2.4s", size: 4 },
  { id: 7, left: "55%", top: "12%", delay: "0.3s", size: 5 },
  { id: 8, left: "8%", top: "48%", delay: "2.8s", size: 6 },
  { id: 9, left: "92%", top: "28%", delay: "1.1s", size: 4 },
  { id: 10, left: "18%", top: "85%", delay: "3.2s", size: 5 },
  { id: 11, left: "50%", top: "78%", delay: "0.6s", size: 6 },
  { id: 12, left: "72%", top: "88%", delay: "0.8s", size: 4 },
  { id: 13, left: "40%", top: "52%", delay: "0.8s", size: 5 },
  { id: 14, left: "60%", top: "45%", delay: "0.8s", size: 7 },
];

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&q=80"
        alt="Indian paddy field at golden hour"
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
      />
      <div className="absolute inset-0" style={{ background: "rgba(15,31,15,0.65)" }} />

      {PARTICLES.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-float"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background: "hsla(142,72%,45%,0.4)",
            animationDelay: p.delay,
          }}
        />
      ))}

      <div className="relative z-10 mx-auto max-w-[900px] px-4 text-center">
        <div className="mx-auto mb-8 inline-block rounded-full glass-dark px-6 py-2.5 text-sm font-medium text-primary-foreground border border-primary-foreground/20">
          India-focused agricultural intelligence for your field
        </div>

        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold leading-tight text-primary-foreground">
          Empowering Every
          <br />
          <span className="text-gradient">Indian Farmer</span>
          <br />
          with practical tools
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base font-body text-primary-foreground/80 sm:text-lg md:text-xl">
          From soil and weather to mandi context — Rythu Mitra gives you a single place to plan
          crops, check disease symptoms, follow advisories, and coordinate work. Built for
          real Indian conditions.
        </p>

        <div className="mt-8 flex flex-col items-center gap-4 w-full sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="btn-rythu shimmer flex flex-col items-center justify-center w-full max-w-[280px] sm:w-auto bg-card px-6 py-4 text-primary shadow-green-lg hover:scale-[1.02] sm:hover:scale-105"
          >
            <span className="text-base sm:text-lg font-bold">Create free account</span>
            <span className="text-sm sm:text-xs text-muted-foreground mt-1">Farmers register with email</span>
          </button>
          <a
            href="#features"
            className="btn-rythu flex flex-col items-center justify-center w-full max-w-[280px] sm:w-auto border-2 border-primary-foreground/40 px-6 py-4 text-primary-foreground hover:bg-primary-foreground/10"
          >
            <span className="text-base sm:text-lg font-bold">Explore features</span>
            <span className="text-sm sm:text-xs text-primary-foreground/60 mt-1">See what the console offers</span>
          </a>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-primary-foreground/70">
          <span>Soil &amp; crop guidance</span>
          <span className="hidden sm:inline">•</span>
          <span>Photo-based disease help</span>
          <span className="hidden sm:inline">•</span>
          <span>Works on common phones</span>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-slow">
        <ChevronDown className="h-8 w-8 text-primary-foreground/50" aria-hidden />
      </div>
    </section>
  );
}
