import { motion } from 'framer-motion';
import { Leaf, MapPin, Brain, Zap, TrendingUp, Sprout, Bug, Cloud, BarChart3 } from 'lucide-react';

const stats = [
  { icon: Sprout, label: 'Registered Farmers', suffix: '', placeholder: '—' },
  { icon: MapPin, label: 'Districts Covered', suffix: '', placeholder: '—' },
  { icon: Brain, label: 'Crop AI Accuracy', suffix: '', placeholder: '—' },
  { icon: Zap, label: 'AI Response Time', suffix: '', placeholder: '—' },
  { icon: TrendingUp, label: 'API Uptime', suffix: '', placeholder: '—' },
  { icon: Leaf, label: 'Crops Supported', suffix: '', placeholder: '—' },
];

const StatCard = ({ icon: Icon, label, placeholder, index }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="farm-card-hover relative overflow-hidden"
    >
      <div className="absolute -right-2 -bottom-2 opacity-[0.04]">
        <Icon className="w-16 h-16" />
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="section-icon">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <span className="text-[11px] font-medium px-2.5 py-1 rounded-full farm-badge text-muted-foreground">
          No data yet
        </span>
      </div>

      <p className="text-[32px] font-bold font-mono text-muted-foreground/40 leading-none tracking-tight">
        {placeholder}
      </p>
      <p className="text-[13px] text-muted-foreground mt-1 font-medium">{label}</p>

      <div className="mt-3 pt-3 border-t border-gray-100">
        <span className="text-[11px] text-muted-foreground">Connect backend to see live data</span>
      </div>
    </motion.div>
  );
};

const quickActions = [
  { icon: Leaf, label: 'Crop AI', id: 'crop-ai' },
  { icon: Bug, label: 'Disease Check', id: 'disease' },
  { icon: BarChart3, label: 'Markets', id: 'market' },
  { icon: Cloud, label: 'Weather', id: 'weather' },
];

export default function OverviewSection() {
  return (
    <section id="overview" className="space-y-8">
      {/* Premium Hero Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-3xl"
        style={{ height: 220 }}
      >
        <img
          src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1400&q=80"
          alt="Paddy field"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, rgba(5,46,22,0.92) 0%, rgba(20,83,45,0.85) 40%, rgba(22,163,74,0.70) 100%)',
        }} />
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="absolute right-10 -top-2 text-[120px] opacity-[0.06] select-none pointer-events-none">🌾</div>

        <div className="relative z-10 h-full flex items-center px-8 md:px-10">
          <div className="flex-1">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium" style={{
              background: 'rgba(245,158,11,0.2)',
              border: '1px solid rgba(245,158,11,0.3)',
              color: '#fbbf24',
            }}>
              ⚡ Rythu Mitra — AI Agriculture Platform
            </span>
            <h2 className="text-white text-[28px] md:text-[32px] font-bold mt-3 leading-tight tracking-tight">
              Kisan ka Saathi,<br />
              <span className="text-green-400">AI ka Shakti 🌾</span>
            </h2>
            <p className="text-white/70 mt-2 text-[15px]">
              Complete farm intelligence — crops, markets, weather & more
            </p>
          </div>

          <div className="hidden md:grid grid-cols-2 gap-2.5">
            {quickActions.map((a) => (
              <button
                key={a.label}
                onClick={() => document.getElementById(a.id)?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-white transition-all"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                  e.currentTarget.style.borderColor = 'rgba(34,197,94,0.5)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <a.icon className="w-4 h-4" />
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stat Cards — empty state */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={stat.label} {...stat} index={i} />
        ))}
      </div>
    </section>
  );
}
