import React from 'react';
import { motion } from 'framer-motion';
import PageShell from './components/layout/PageShell';
import Navbar from './components/layout/Navbar';
import GlassCard from './components/ui/GlassCard';
import Badge from './components/ui/Badge';
import Button from './components/ui/Button';

const WORKERS = [
  { id: 1, name: "S. Rao", skill: "Harvesting Expert", rate: "₹500/day", status: "Available", rating: 4.8 },
  { id: 2, name: "M. Laxmi", skill: "Sowing Specialist", rate: "₹450/day", status: "Busy", rating: 4.9 },
  { id: 3, name: "K. John", skill: "Machinery Operator", rate: "₹800/day", status: "Available", rating: 4.7 },
  { id: 4, name: "R. Devi", skill: "General Labor", rate: "₹400/day", status: "Available", rating: 4.5 },
];

export default function Workers() {
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
            Workforce <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Connect</span>
          </motion.h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            On-demand skilled labor marketplace and team management.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Filters */}
          <div className="lg:col-span-3 space-y-4">
            <GlassCard>
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Filter Skilled Labor</h3>
              <div className="space-y-3">
                {['Harvesting', 'Sowing', 'Machinery', 'General'].map(skill => (
                  <label key={skill} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                    <input type="checkbox" className="rounded border-white/20 bg-white/5 text-orange-500 focus:ring-orange-500/50" defaultChecked />
                    <span className="text-sm font-medium text-slate-300">{skill}</span>
                  </label>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Workers Grid */}
          <div className="lg:col-span-9">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {WORKERS.map((worker) => (
                <GlassCard key={worker.id} className="group hover:bg-white/10 transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center text-xl text-orange-400 font-bold border border-orange-500/20">
                      {worker.name.charAt(0)}
                    </div>
                    <Badge variant={worker.status === 'Available' ? 'success' : 'neutral'}>{worker.status}</Badge>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-orange-400 transition-colors">{worker.name}</h3>
                  <p className="text-sm text-slate-400 mb-4">{worker.skill}</p>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Daily Rate</p>
                      <p className="text-sm font-bold text-white">{worker.rate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Rating</p>
                      <div className="flex items-center gap-1">
                        <span className="text-orange-400">★</span>
                        <span className="text-sm font-bold text-white">{worker.rating}</span>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full mt-4" variant={worker.status === 'Available' ? 'primary' : 'outline'} disabled={worker.status !== 'Available'}>
                    {worker.status === 'Available' ? 'Hire Now' : 'Busy'}
                  </Button>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
