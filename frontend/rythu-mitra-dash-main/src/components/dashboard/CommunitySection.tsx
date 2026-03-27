import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

const communityLabels = [
  { emoji: '🌾', label: 'Farmers Registered' },
  { emoji: '📍', label: 'Districts Covered' },
  { emoji: '🏛️', label: 'States Active' },
  { emoji: '📱', label: 'App Downloads' },
];

export default function CommunitySection() {
  return (
    <section id="community" className="space-y-6">
      <div className="farm-section-header">
        <div className="section-icon">
          <span className="text-base">👨‍🌾</span>
        </div>
        <h2 className="text-xl font-bold text-foreground tracking-tight">Farmer Community</h2>
      </div>

      {/* Stats — empty state */}
      <div className="relative overflow-hidden rounded-3xl p-8" style={{
        background: 'linear-gradient(135deg, #052e16 0%, #14532d 50%, #16a34a 100%)',
      }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-20 w-40 h-40 rounded-full bg-white/30 blur-3xl" />
        </div>
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          {communityLabels.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl p-5 text-center text-white"
              style={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <span className="text-3xl">{s.emoji}</span>
              <p className="text-3xl font-bold font-mono mt-2 text-white/30">—</p>
              <p className="text-sm text-white/70 mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* State Leaderboard — empty state */}
        <div className="farm-card">
          <h3 className="font-semibold text-foreground mb-4">Top States by Farmers</h3>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Users className="w-10 h-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No state data available yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Connect backend to see leaderboard</p>
          </div>
        </div>

        {/* Live Feed — empty state */}
        <div className="farm-card">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
            <h3 className="font-semibold text-foreground">New Farmers Joining</h3>
          </div>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <span className="text-3xl mb-3">👨‍🌾</span>
            <p className="text-sm text-muted-foreground">No live feed data</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Will show real-time registrations once connected</p>
          </div>
        </div>
      </div>
    </section>
  );
}
