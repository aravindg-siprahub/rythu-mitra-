import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, Leaf } from "lucide-react";

const navLinks = ["Features", "How It Works", "Impact", "About"];

export default function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-card/95 backdrop-blur-md shadow-green" : "bg-card"
      } border-b border-border`}
    >
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <span className="font-display text-xl font-bold text-foreground">Rythu Mitra</span>
            <p className="text-[10px] leading-none text-muted-foreground">AI-Powered Farmer Intelligence</p>
          </div>
        </div>

        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(/ /g, "-")}`}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {link}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="btn-rythu border-2 border-primary px-5 py-2.5 text-sm text-primary hover:bg-primary hover:text-primary-foreground"
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="btn-rythu shimmer bg-primary px-5 py-2.5 text-sm text-primary-foreground hover:opacity-90"
          >
            Create account
          </button>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden text-foreground"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 top-[72px] z-50 bg-green-gradient flex flex-col items-center justify-center gap-8 lg:hidden">
          {navLinks.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(/ /g, "-")}`}
              onClick={() => setMobileOpen(false)}
              className="font-display text-2xl font-bold text-primary-foreground"
            >
              {link}
            </a>
          ))}
          <div className="flex flex-col gap-3 mt-8">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                navigate("/login");
              }}
              className="btn-rythu border-2 border-primary-foreground px-8 py-3 text-center text-primary-foreground"
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                navigate("/register");
              }}
              className="btn-rythu bg-card px-8 py-3 text-center text-primary"
            >
              Create account
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
