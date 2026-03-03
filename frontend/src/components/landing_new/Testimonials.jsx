import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { Star } from 'lucide-react';

const testimonials = [
  {
    quote: "I was about to plant rice like every year. Rythu Mitra's AI suggested maize instead based on my soil data. I earned ₹48,000 more this season. This app changed my life.",
    name: 'Raju Yadav',
    location: 'Nalgonda, Telangana',
    crop: '🌽 Maize Farmer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  },
  {
    quote: "My tomato crop was dying and I didn't know why. I took a photo with Rythu Mitra — it detected early blight in 2 seconds. I saved my entire crop worth ₹1.8 lakhs.",
    name: 'Sunita Patil',
    location: 'Nashik, Maharashtra',
    crop: '🍅 Vegetable Farmer',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
  },
  {
    quote: "I used to sell cotton whenever I needed money. Now I check Rythu Mitra's price forecast and wait for the peak. I earned ₹60,000 more than last year doing the same work.",
    name: 'Gurpreet Singh',
    location: 'Bathinda, Punjab',
    crop: '🌸 Cotton Farmer',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  },
];

const Testimonials = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className="py-20 bg-green-light">
      <div className={`container mx-auto px-4 section-animate ${isVisible ? 'visible' : ''}`}>
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase mb-4">Farmer Stories</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">12.4 Million Farmers Can't Be Wrong</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-card rounded-2xl p-8 card-shadow hover:-translate-y-1 transition-all duration-300 relative">
              <span className="font-display text-7xl text-primary/20 absolute top-4 left-6 leading-none">"</span>
              <p className="font-display italic text-foreground text-lg leading-relaxed mb-6 relative z-10 pt-8">{t.quote}</p>
              <div className="flex items-center gap-3">
                <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover" loading="lazy" />
                <div>
                  <span className="font-bold text-foreground text-sm">{t.name}</span>
                  <span className="block text-xs text-muted-foreground">{t.location}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">{t.crop}</span>
                <div className="flex">
                  {[...Array(5)].map((_, si) => (
                    <Star key={si} className="w-3.5 h-3.5 text-accent fill-accent" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Rating summary */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-lg font-semibold text-foreground">
            <span className="font-mono">4.8/5</span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-accent fill-accent" />
              ))}
            </div>
            <span className="text-muted-foreground text-sm font-normal">from 2.1M+ app reviews</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
