import { motion } from 'framer-motion';
import { Cloud, Droplets, Wind, Thermometer, Sun } from 'lucide-react';

export default function WeatherSection() {
  return (
    <section id="weather" className="space-y-6">
      <div className="farm-section-header">
        <div className="section-icon" style={{ background: 'hsl(199 92% 95%)', borderColor: 'hsl(199 89% 85%)' }}>
          <Cloud className="w-[18px] h-[18px] text-farm-sky" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">Smart Weather Intelligence</h2>
          <p className="text-sm text-muted-foreground">Hyperlocal • AI-Powered Advisories</p>
        </div>
      </div>

      {/* Hero Weather Card — empty state */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-3xl p-6 md:p-8 text-white"
        style={{
          background: 'linear-gradient(135deg, #0ea5e9 0%, #16a34a 100%)',
        }}
      >
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-60 h-60 rounded-full blur-3xl" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full blur-3xl" style={{ background: 'rgba(255,255,255,0.05)' }} />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center py-8 text-center">
          <span className="text-5xl mb-4">⛅</span>
          <p className="text-xl font-semibold">Weather Data Not Connected</p>
          <p className="text-sm text-white/70 mt-2 max-w-md">
            Connect your backend to see real-time weather, 7-day forecasts, and smart farming advisories for your location.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-6">
            {[
              { icon: Droplets, label: 'Humidity' },
              { icon: Wind, label: 'Wind' },
              { icon: Thermometer, label: 'Temperature' },
              { icon: Sun, label: 'UV Index' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm" style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}>
                <s.icon className="w-4 h-4 text-white/70" />
                <span className="text-white/70">{s.label}:</span>
                <span className="font-semibold text-white/40">—</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Advisories — empty state */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { icon: '🌱', title: 'Sowing Advisory', borderColor: '#16a34a' },
          { icon: '💧', title: 'Irrigation Advisory', borderColor: '#0ea5e9' },
          { icon: '🚜', title: 'Harvest Advisory', borderColor: '#f59e0b' },
        ].map((a, i) => (
          <motion.div
            key={a.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="farm-card"
            style={{ borderLeft: `4px solid ${a.borderColor}` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{a.icon}</span>
              <h4 className="font-semibold text-foreground text-sm">{a.title}</h4>
            </div>
            <p className="text-sm text-muted-foreground">No advisory data yet. Connect backend for AI-powered advisories.</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
