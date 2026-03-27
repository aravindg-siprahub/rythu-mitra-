import { useNavigate } from "react-router-dom";

export default function CTASection() {
  const navigate = useNavigate();

  return (
    <section id="get-started" className="relative overflow-hidden bg-green-gradient py-20 lg:py-28">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-10"
          style={{
            width: 60 + i * 30,
            height: 60 + i * 30,
            background: "white",
            borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
            left: `${10 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
            transform: `rotate(${i * 45}deg)`,
          }}
        />
      ))}

      <div className="relative mx-auto max-w-4xl px-4 text-center">
        <h2 className="font-display text-3xl font-bold text-primary-foreground sm:text-4xl lg:text-[56px] lg:leading-tight">
          Start with a free farmer account
        </h2>
        <p className="mt-6 text-lg text-primary-foreground/80">
          Sign up to access the dashboard, crop tools, disease lab and market views — all tied to
          your profile.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="btn-rythu shimmer flex flex-col items-center bg-card px-10 py-5 text-primary shadow-green-lg hover:scale-105"
          >
            <span className="text-lg font-bold">Create account</span>
            <span className="text-xs text-muted-foreground">Farmers register with email</span>
          </button>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="btn-rythu flex flex-col items-center border-2 border-primary-foreground/40 px-10 py-5 text-primary-foreground hover:bg-primary-foreground/10"
          >
            <span className="text-lg font-bold">Sign in</span>
            <span className="text-xs text-primary-foreground/60">Already registered</span>
          </button>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-primary-foreground/70">
          <span>No card required to register</span>
          <span>Plain-language UI</span>
          <span>Works on common phones</span>
        </div>
      </div>
    </section>
  );
}
