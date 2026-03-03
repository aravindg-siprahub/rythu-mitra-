import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PageShell from './components/layout/PageShell';
import Navbar from './components/layout/Navbar';
import GlassCard from './components/ui/GlassCard';
import Badge from './components/ui/Badge';
import Button from './components/ui/Button';

// Mock Fleet Data
const FLEET_DATA = [
  { id: "TRK-8842", type: "Heavy Tractor", driver: "Ramesh K.", status: "Active", loc: "Sector 4", fuel: "78%" },
  { id: "TRK-9921", type: "Harvester", driver: "Suresh P.", status: "Idle", loc: "Barn 2", fuel: "45%" },
  { id: "LOG-1102", type: "Delivery Truck", driver: "Mallesh G.", status: "In Transit", loc: "Enroute -> Hyderabad", fuel: "62%" },
];

export default function Transport() {
  return (
    <PageShell>
      <Navbar />

      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto w-full">
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4"
          >
            Logistics <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Command</span>
          </motion.h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Real-time fleet tracking and supply chain optimization network.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Map View Placeholder */}
          <GlassCard className="lg:col-span-2 min-h-[500px] relative overflow-hidden p-0">
            <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4 border border-blue-500/20 shadow-[0_0_50px_rgba(59,130,246,0.2)]">
                  <span className="text-4xl animate-pulse">🛰️</span>
                </div>
                <h3 className="text-white font-bold tracking-widest uppercase text-sm">Live GPS Tracking</h3>
                <p className="text-slate-500 text-xs mt-1">Satellite Relay Active</p>
              </div>
            </div>
            {/* Decorative Grid Lines */}
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
          </GlassCard>

          {/* Fleet Status */}
          <div className="space-y-6">
            <GlassCard>
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-1 h-5 bg-cyan-500 rounded-full" />
                Active Fleet
              </h3>
              <div className="space-y-4">
                {FLEET_DATA.map((vehicle) => (
                  <div key={vehicle.id} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{vehicle.id}</span>
                      <Badge variant={vehicle.status === 'Active' ? 'success' : vehicle.status === 'In Transit' ? 'warning' : 'neutral'}>
                        {vehicle.status}
                      </Badge>
                    </div>
                    <h4 className="font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">{vehicle.type}</h4>
                    <p className="text-xs text-slate-400 flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-slate-500" />
                      {vehicle.driver}
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <span>Fuel: {vehicle.fuel}</span>
                      <span>•</span>
                      <span>{vehicle.loc}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-6" variant="outline">Manage Fleet</Button>
            </GlassCard>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
