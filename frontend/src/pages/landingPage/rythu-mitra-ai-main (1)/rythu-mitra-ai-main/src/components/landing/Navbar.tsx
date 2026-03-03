import { useState, useEffect } from 'react';
import { Menu, X, Leaf, Download, Rocket } from 'lucide-react';

const navLinks = ['Features', 'How It Works', 'Impact', 'Pricing', 'About'];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-card/95 backdrop-blur-md shadow-md' : 'bg-card'} border-b border-border`} style={{ height: 72 }}>
      <div className="container mx-auto h-full flex items-center justify-between px-4 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg green-gradient-bg flex items-center justify-center">
            <Leaf className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <span className="font-display font-bold text-lg text-foreground leading-none">Rythu Mitra</span>
            <span className="block text-[10px] text-muted-foreground leading-tight">AI-Powered Farmer Intelligence</span>
          </div>
        </div>

        {/* Center Links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map(link => (
            <a key={link} href={`#${link.toLowerCase().replace(/ /g, '-')}`} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              {link}
            </a>
          ))}
        </div>


        {/* Mobile toggle — animated hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden relative p-2 w-10 h-10 flex flex-col items-center justify-center gap-[5px] text-foreground z-[60]"
          aria-label="Toggle menu"
        >
          <span className={`block h-[2px] w-5 rounded-full bg-current transition-all duration-300 origin-center ${mobileOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
          <span className={`block h-[2px] w-5 rounded-full bg-current transition-all duration-300 ${mobileOpen ? 'opacity-0 scale-x-0' : ''}`} />
          <span className={`block h-[2px] w-5 rounded-full bg-current transition-all duration-300 origin-center ${mobileOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
        </button>
      </div>

      {/* Mobile overlay with staggered reveals */}
      <div
        className={`fixed inset-0 top-[72px] z-50 green-gradient-bg flex flex-col items-center justify-center gap-6 lg:hidden transition-all duration-400 ${mobileOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
      >
        {navLinks.map((link, i) => (
          <a
            key={link}
            href={`#${link.toLowerCase().replace(/ /g, '-')}`}
            onClick={() => setMobileOpen(false)}
            className="text-2xl font-display font-bold text-primary-foreground transition-all duration-500"
            style={{
              transitionDelay: mobileOpen ? `${100 + i * 80}ms` : '0ms',
              opacity: mobileOpen ? 1 : 0,
              transform: mobileOpen ? 'translateY(0)' : 'translateY(20px)',
            }}
          >
            {link}
          </a>
        ))}
        <div
          className="flex flex-col gap-3 mt-4 transition-all duration-500"
          style={{
            transitionDelay: mobileOpen ? `${100 + navLinks.length * 80}ms` : '0ms',
            opacity: mobileOpen ? 1 : 0,
            transform: mobileOpen ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          <a href="#download" className="px-8 py-3 rounded-xl border-2 border-primary-foreground text-primary-foreground text-center font-semibold">
            📱 Download App
          </a>
          <a href="#get-started" className="px-8 py-3 rounded-xl bg-card text-primary text-center font-semibold">
            🚀 Get Started Free
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
