import { Link } from "react-router-dom";
import { Leaf } from "lucide-react";

const platformLinks = [
  { label: "Crop recommendation", to: "/login" },
  { label: "Disease detection", to: "/login" },
  { label: "Market prices", to: "/login" },
  { label: "Weather", to: "/login" },
  { label: "Bookings", to: "/login" },
];

const companyLinks = [
  { label: "Log in", to: "/login" },
  { label: "Create account", to: "/register" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-footer-bg text-primary-foreground/70">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                <Leaf className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold text-primary-foreground">Rythu Mitra</span>
            </div>
            <p className="text-sm leading-relaxed">Decision support for Indian farmers.</p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-primary-foreground">Platform</h4>
            <ul className="space-y-2.5">
              {platformLinks.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm transition-colors hover:text-primary-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-primary-foreground">Account</h4>
            <ul className="space-y-2.5">
              {companyLinks.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm transition-colors hover:text-primary-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-primary-foreground/60">
              Privacy and terms can be added as static pages when your legal copy is ready.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-primary-foreground">Stay in touch</h4>
            <p className="mb-3 text-sm">
              For product feedback or partnerships, email your team once your public address is set.
            </p>
            <Link
              to="/register"
              className="btn-rythu inline-block bg-primary px-4 py-2.5 text-sm text-primary-foreground hover:opacity-90"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs sm:flex-row">
          <span>
            © {year} Rythu Mitra. Built for Indian agriculture.
          </span>
        </div>
      </div>
    </footer>
  );
}
