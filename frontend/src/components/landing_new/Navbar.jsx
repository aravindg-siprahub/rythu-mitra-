import { useState, useEffect } from 'react';
import { Menu, X, Leaf, Download, Rocket } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const navLinks = ['Features', 'How It Works', 'Impact', 'Pricing', 'About'];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const [authDropdown, setAuthDropdown] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest('#auth-menu')) {
        setAuthDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
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

        <div className="hidden lg:block z-[60]">
          <div id="auth-menu" style={{ position: 'relative' }}>
            {!isLoggedIn ? (
              <button
                onClick={() => setAuthDropdown(!authDropdown)}
                className="px-6 py-2 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
              >
                Login / Register ▾
              </button>
            ) : (
              <button
                onClick={() => setAuthDropdown(!authDropdown)}
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                className="px-4 py-1.5 rounded-xl border border-border hover:bg-secondary/10 transition-colors"
              >
                <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                  {user?.full_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'F'}
                </span>
                <span className="font-medium text-sm text-foreground">{user?.username}</span>
                <span className="text-muted-foreground">▾</span>
              </button>
            )}

            {authDropdown && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: '8px 0', minWidth: 180, boxShadow: '0 10px 40px rgba(0,0,0,0.15)', zIndex: 1000 }}>
                {!isLoggedIn ? (
                  <>
                    <button onClick={() => { navigate('/login'); setAuthDropdown(false); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#111827' }} className="hover:bg-gray-50">
                      🔑 Login
                    </button>
                    <button onClick={() => { navigate('/register'); setAuthDropdown(false); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#16a34a', fontWeight: 600 }} className="hover:bg-gray-50">
                      ✨ Register Free
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { navigate('/dashboard'); setAuthDropdown(false); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#111827' }} className="hover:bg-gray-50">
                      📊 Dashboard
                    </button>
                    <button onClick={() => { logout(); navigate('/'); setAuthDropdown(false); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#ef4444' }} className="hover:bg-gray-50">
                      🚪 Logout
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
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
          <button onClick={() => navigate(isLoggedIn ? '/dashboard' : '/register')} className="px-8 py-3 rounded-xl bg-card text-primary text-center font-semibold">
            🚀 Get Started Free
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
