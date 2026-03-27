import React from "react";
import PageShell from "../components/layout/PageShell";
import TopNav from "../components/dashboard/TopNav";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Booking() {
  const navigate = useNavigate();
  const activeBookings = [
    { id: "RM-B-9021", service: "Tractor T-40", type: "Equip", date: "Feb 04, 2026", status: "Confirmed", icon: "🚜" },
    { id: "RM-B-8832", service: "Machine Harvesting", type: "Service", date: "Feb 12, 2026", status: "Pending", icon: "🌾" }
  ];

  return (
    <PageShell>
      <TopNav />
      <div className="pt-28 pb-20 px-8">
        <div className="max-w-[1200px] mx-auto">

          <div className="mb-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black tracking-[0.3em] uppercase mb-6"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Immutable Transaction Ledger
            </motion.div>
            <h1 className="text-5xl lg:text-7xl font-black text-white mb-6 tracking-tighter leading-[0.85] uppercase italic font-title neo-dark-headline">
              Dispatch <br /><span className="text-brand-gradient">Ledger.</span>
            </h1>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-[0.2em] max-w-xl leading-relaxed">
              Verify equipment rentals and workforce deployments. <span className="text-emerald-500 font-black">STATUS: SYNCHRONIZED</span> // 0 Retries.
            </p>
          </div>

          <div className="space-y-12">
            <div className="flex items-center gap-4">
              <span className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_15px_#3b82f6] animate-pulse" />
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic leading-none">Active Command Commitments</h3>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {activeBookings.map((b, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="p-10 neo-dark-panel group relative overflow-hidden transition-all duration-500">
                    <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-blue-500 opacity-0 group-hover:opacity-5 blur-[80px] transition-opacity duration-1000" />
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 relative z-10">
                      <div className="flex items-center gap-10">
                        <div className="h-24 w-24 rounded-[2rem] bg-black/40 flex items-center justify-center text-5xl border border-white/5 group-hover:border-blue-500/30 transition-all duration-700 shadow-2xl group-hover:scale-105">
                          {b.icon}
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-slate-700 uppercase tracking-[0.4em] mb-4">{b.id} // SECURE_HASH: 0x82f...a4c</p>
                          <h4 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase italic group-hover:text-blue-500 transition-colors duration-500">{b.service}</h4>
                          <div className="flex items-center gap-6">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{b.type} UNIT</span>
                            <div className="h-1.5 w-1.5 rounded-full bg-slate-800" />
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">SCHEDULED: {b.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className={`px-8 py-3 rounded-2xl text-[10px] font-black tracking-[0.3em] uppercase border transition-all duration-500 ${b.status === "Confirmed" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 group-hover:bg-emerald-500 group-hover:text-white" : "bg-amber-500/10 text-amber-500 border-amber-500/30 group-hover:bg-amber-500 group-hover:text-white"}`}>
                          {b.status}
                        </div>
                        <button className="h-16 w-16 flex items-center justify-center rounded-2xl bg-white/5 border border-white/5 hover:bg-blue-600 hover:border-blue-400 hover:text-white transition-all duration-500 text-2xl group-hover:shadow-2xl group-hover:shadow-blue-500/20">
                          📑
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="pt-20">
              <div className="p-20 rounded-[4rem] bg-black/20 border border-dashed border-white/5 flex flex-col items-center justify-center text-center group hover:border-blue-500/20 transition-all duration-1000 relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="text-8xl mb-8 group-hover:scale-125 transition-transform duration-1000 opacity-20 group-hover:opacity-100 filter group-hover:drop-shadow-[0_0_50px_rgba(59,130,246,0.3)]">🚀</div>
                <h3 className="text-3xl font-black text-white tracking-tighter mb-4 uppercase italic">Expansion Required?</h3>
                <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em] max-w-sm mb-12 leading-relaxed">System detects capacity limits in Cluster-A. Deploy additional units via Hyper-Logistics center.</p>
                <button
                  onClick={() => navigate("/transport")}
                  className="h-16 px-16 rounded-2xl bg-white text-black font-black text-[10px] uppercase tracking-[0.4em] hover:bg-blue-600 hover:text-white transition-all shadow-2xl active:scale-95"
                >
                  Enter Logistics Hub
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
