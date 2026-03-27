import { Leaf } from 'lucide-react';

const platformLinks = ['Crop AI Recommendation', 'Disease Detection', 'Market Prices', 'Weather Intelligence', 'Worker Booking', 'Transport Booking', 'AI Advisory'];
const companyLinks = ['About Us', 'Our Technology', 'Contact Us', 'Privacy Policy', 'Terms of Service'];

const Footer = () => (
  <footer className="bg-footer-bg text-primary-foreground/70">
    <div className="mx-auto max-w-7xl px-4 py-16">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <Leaf className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold text-primary-foreground">Rythu Mitra</span>
          </div>
          <p className="text-sm leading-relaxed">Empowering Indian farmers with the power of AI</p>
          <div className="mt-4 flex gap-3">
            {['Twitter', 'LinkedIn', 'YouTube', 'Instagram'].map(s => (
              <a key={s} href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground/10 text-xs hover:bg-primary-foreground/20 transition-colors" aria-label={s}>
                {s[0]}
              </a>
            ))}
          </div>
        </div>

        {/* Platform */}
        <div>
          <h4 className="mb-4 text-sm font-semibold text-primary-foreground">Platform</h4>
          <ul className="space-y-2.5">
            {platformLinks.map(l => <li key={l}><a href="#" className="text-sm hover:text-primary-foreground transition-colors">{l}</a></li>)}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="mb-4 text-sm font-semibold text-primary-foreground">Company</h4>
          <ul className="space-y-2.5">
            {companyLinks.map(l => <li key={l}><a href="#" className="text-sm hover:text-primary-foreground transition-colors">{l}</a></li>)}
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="mb-4 text-sm font-semibold text-primary-foreground">Stay Updated</h4>
          <p className="text-sm mb-3">Get farming tips and platform updates delivered to your inbox.</p>
          <div className="flex gap-2">
            <input type="email" placeholder="Enter your email" className="flex-1 rounded-xl bg-primary-foreground/10 px-4 py-2.5 text-sm text-primary-foreground placeholder:text-primary-foreground/40 outline-none focus:ring-2 focus:ring-primary" />
            <button className="btn-rythu bg-primary px-4 py-2.5 text-sm text-primary-foreground hover:opacity-90">Subscribe</button>
          </div>
        </div>
      </div>
    </div>

    <div className="border-t border-primary-foreground/10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs sm:flex-row">
        <span>© 2025 Rythu Mitra. Made with ❤️ for Indian Farmers.</span>
      </div>
    </div>
  </footer>
);
export default Footer;
