import { Leaf, Twitter, Linkedin, Youtube, Instagram, MessageCircle } from 'lucide-react';

const platformLinks = ['Crop AI Recommendation', 'Disease Detection', 'Market Prices', 'Weather Intelligence', 'Worker Booking', 'Transport Booking', 'AI Advisory Feed'];
const companyLinks = ['About Us', 'Our Technology', 'Impact Report', 'Press & Media', 'Careers', 'Contact Us', 'Privacy Policy'];

const Footer = () => {
  return (
    <footer className="bg-footer-bg text-primary-foreground/80 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg green-gradient-bg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg text-primary-foreground">Rythu Mitra</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">Empowering Indian farmers with the power of AI</p>
            <div className="flex gap-3">
              {[Twitter, Linkedin, Youtube, Instagram, MessageCircle].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-primary-foreground/10 flex items-center justify-center hover:bg-primary/30 transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">Platform</h4>
            <ul className="space-y-2">
              {platformLinks.map(link => (
                <li key={link}><a href="#" className="text-sm hover:text-primary transition-colors">{link}</a></li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">Company</h4>
            <ul className="space-y-2">
              {companyLinks.map(link => (
                <li key={link}><a href="#" className="text-sm hover:text-primary transition-colors">{link}</a></li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">Get Weekly Farming Tips</h4>
            <div className="flex gap-2 mb-3">
              <input type="email" placeholder="Your email" className="flex-1 px-4 py-2 rounded-xl bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground text-sm placeholder:text-primary-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary" />
              <button className="px-4 py-2 rounded-xl green-gradient-bg text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">Subscribe</button>
            </div>
            <p className="text-xs text-primary-foreground/50">Join 2.4M farmers getting weekly AI insights</p>

            <div className="mt-6 flex gap-2">
              <div className="px-4 py-2 rounded-lg bg-primary-foreground/10 text-xs font-medium text-center">
                <span className="block font-bold">Google Play</span>
                <span className="text-primary-foreground/50">Download</span>
              </div>
              <div className="px-4 py-2 rounded-lg bg-primary-foreground/10 text-xs font-medium text-center">
                <span className="block font-bold">App Store</span>
                <span className="text-primary-foreground/50">Coming Soon</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-primary/20 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-primary-foreground/50">© 2025 Rythu Mitra. Made with ❤️ for Indian Farmers.</p>
          <p className="text-xs text-primary-foreground/50">🟢 All Systems Operational | API Status</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
