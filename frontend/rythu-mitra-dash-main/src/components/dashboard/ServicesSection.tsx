import { motion } from 'framer-motion';
import { Users, Truck } from 'lucide-react';

export default function ServicesSection() {
  return (
    <section id="services" className="space-y-6">
      <div className="farm-section-header">
        <div className="section-icon-gold">
          <span className="text-base">👷</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">Agricultural Workforce & Transport</h2>
          <p className="text-sm text-muted-foreground">Instant Booking • Verified Providers</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Workers — empty state */}
        <div className="farm-card">
          <div className="px-5 py-3 -mx-6 -mt-6 mb-6 rounded-t-[20px]" style={{
            background: 'linear-gradient(135deg, #052e16, #16a34a)',
          }}>
            <h3 className="font-semibold text-sm text-white">👷 Book Farm Workers</h3>
            <p className="text-xs text-white/70">Skilled agricultural workforce on demand</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs text-muted-foreground font-medium">Work Type</label>
              <select className="farm-input text-sm mt-1">
                <option>Harvesting</option>
                <option>Planting</option>
                <option>Spraying</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium">Workers Needed</label>
              <input type="number" defaultValue={3} min={1} className="farm-input text-sm mt-1" />
            </div>
          </div>

          <button className="btn-shine w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors mb-4">
            🔍 Find Available Workers
          </button>

          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Users className="w-8 h-8 text-muted-foreground/25 mb-2" />
            <p className="text-sm text-muted-foreground">No workers listed yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Connect backend to browse available workers</p>
          </div>
        </div>

        {/* Transport — empty state */}
        <div className="farm-card">
          <div className="px-5 py-3 -mx-6 -mt-6 mb-6 rounded-t-[20px]" style={{
            background: 'linear-gradient(135deg, #0ea5e9, #16a34a)',
          }}>
            <h3 className="font-semibold text-sm text-white">🚛 Book Transport Vehicle</h3>
            <p className="text-xs text-white/70">Tractors, trucks with GPS tracking</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs text-muted-foreground font-medium">Vehicle Type</label>
              <select className="farm-input text-sm mt-1">
                <option>Tractor</option>
                <option>Mini Truck</option>
                <option>Truck</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium">Load (tons)</label>
              <input type="number" defaultValue={5} min={1} className="farm-input text-sm mt-1" />
            </div>
          </div>

          <button className="btn-shine w-full py-2.5 rounded-xl bg-farm-sky text-white text-sm font-semibold hover:opacity-90 transition-colors mb-4">
            🔍 Find Vehicles
          </button>

          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Truck className="w-8 h-8 text-muted-foreground/25 mb-2" />
            <p className="text-sm text-muted-foreground">No vehicles listed yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Connect backend to browse available transport</p>
          </div>
        </div>
      </div>
    </section>
  );
}
