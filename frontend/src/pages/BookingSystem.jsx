import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";

/** Worker / provider role: same tab, different hub (not the farmer "request a service" form). */
function isSupplierRole(role) {
  const r = (role || "").toLowerCase();
  return r === "supplier" || r === "worker";
}

function useRmRole() {
  const location = useLocation();
  const [role, setRole] = useState(() =>
    (typeof window !== "undefined" ? localStorage.getItem("rm_role") || "farmer" : "farmer").toLowerCase()
  );

  useEffect(() => {
    const sync = () => setRole((localStorage.getItem("rm_role") || "farmer").toLowerCase());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
    };
  }, [location.pathname]);

  return role;
}

function SupplierWorkHub() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0b1220] text-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-blue-200">
            Worker / provider
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Provider hub</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            This tab is for people offering labor, transport, or equipment. Browse open jobs from farmers and track your
            applications — not the same screen as booking a service for your own farm.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3 space-y-6">
              <GlassCard className="bg-white/5">
                <div className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Find work</div>
                <div className="mt-2 text-lg font-black">Open jobs near you</div>
                <p className="mt-2 text-sm text-slate-400">
                  Posting, applying, and hire flow live in the Work module.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    variant="gradient"
                    size="md"
                    type="button"
                    onClick={() => navigate("/work")}
                  >
                    Go to Work →
                  </Button>
                  <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-slate-200 hover:bg-white/10"
                  >
                    Home
                  </button>
                </div>
              </GlassCard>

              <GlassCard className="bg-white/5">
                <div className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Service bookings</div>
                <div className="mt-2 text-lg font-black">Incoming requests</div>
                <p className="mt-2 text-sm text-slate-400">
                  When a farmer books your service through the platform, confirmations will appear here. (Backend wiring
                  pending.)
                </p>
                <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-6 text-center text-sm text-slate-400">
                  No incoming service bookings yet.
                </div>
              </GlassCard>
            </div>

            <div className="lg:col-span-2">
              <GlassCard className="bg-white/5">
                <div className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Why this looks different</div>
                <div className="mt-3 space-y-3 text-sm text-slate-300">
                  <p>
                    <span className="font-bold text-white">Farmers</span> use Booking to request equipment, experts, or
                    supplies.
                  </p>
                  <p>
                    <span className="font-bold text-white">Workers</span> use Work to find jobs and manage applications.
                  </p>
                  <p className="text-xs text-slate-500">
                    Need the farmer booking form? Log out and sign in as Farmer, or switch role on the role selection
                    screen after login.
                  </p>
                </div>
              </GlassCard>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const TABS = [
  {
    key: "equipment",
    title: "Equipment Rental",
    subtitle: "Tractor, sprayer, harvester, pump sets",
    icon: "🚜",
  },
  {
    key: "expert",
    title: "Expert Consultation",
    subtitle: "Talk to an agronomist or plant doctor",
    icon: "🧑‍🌾",
  },
  {
    key: "supply",
    title: "Supply Delivery",
    subtitle: "Seeds, fertilizer, pesticide, micronutrients",
    icon: "📦",
  },
];

const cardMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
};

function FarmerBookingRequestPage() {
  const [tab, setTab] = useState("equipment");
  const [submitting, setSubmitting] = useState(false);
  const [lastBooking, setLastBooking] = useState(null);

  const [common, setCommon] = useState({
    district: "",
    date: "",
    notes: "",
  });

  const [equipment, setEquipment] = useState({
    item: "Tractor",
    hours: "4",
  });

  const [expert, setExpert] = useState({
    type: "Crop planning",
    phone: "",
    preferredLanguage: "Telugu",
  });

  const [supply, setSupply] = useState({
    items: "",
    address: "",
  });

  const activeTab = useMemo(() => TABS.find((t) => t.key === tab), [tab]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // This page is UI-first. Backend endpoints for booking may vary by deployment.
      // We keep data locally so the flow is functional even before wiring APIs.
      const payload =
        tab === "equipment"
          ? { ...common, ...equipment, booking_type: "equipment_rental" }
          : tab === "expert"
          ? { ...common, ...expert, booking_type: "expert_consultation" }
          : { ...common, ...supply, booking_type: "supply_delivery" };

      setLastBooking({
        id: Date.now(),
        createdAt: new Date().toISOString(),
        payload,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1220] text-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <div className="mb-6">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-emerald-200">
              Farmer
            </div>
            <div className="text-xs font-black uppercase tracking-[0.35em] text-slate-400">Services</div>
            <h1 className="mt-2 text-3xl font-black tracking-tight">Booking System</h1>
            <p className="mt-2 text-sm text-slate-300">
              Book equipment, expert consultation, or farm supplies delivery.
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex flex-col gap-3 md:flex-row">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 rounded-2xl border px-4 py-4 text-left transition ${
                  tab === t.key
                    ? "border-white/20 bg-white/10"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-black">{t.title}</div>
                    <div className="mt-1 text-xs text-slate-300">{t.subtitle}</div>
                  </div>
                  <div className="text-2xl">{t.icon}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <GlassCard className="bg-white/5">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                      {activeTab?.title}
                    </div>
                    <div className="mt-2 text-lg font-black">Booking details</div>
                  </div>
                  <div className="text-2xl">{activeTab?.icon}</div>
                </div>

                <form onSubmit={onSubmit} className="space-y-5">
                  {/* Common */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                        District
                      </label>
                      <input
                        className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-blue-500/60"
                        value={common.district}
                        onChange={(e) => setCommon((s) => ({ ...s, district: e.target.value }))}
                        placeholder="e.g. Warangal"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                        Date
                      </label>
                      <input
                        type="date"
                        className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-blue-500/60"
                        value={common.date}
                        onChange={(e) => setCommon((s) => ({ ...s, date: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {tab === "equipment" && (
                      <motion.div key="equipment" {...cardMotion} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                              Equipment
                            </label>
                            <select
                              className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-blue-500/60"
                              value={equipment.item}
                              onChange={(e) => setEquipment((s) => ({ ...s, item: e.target.value }))}
                            >
                              {["Tractor", "Power tiller", "Sprayer", "Harvester", "Pump set"].map((x) => (
                                <option key={x} value={x}>
                                  {x}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                              Hours / Day
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="24"
                              className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-blue-500/60"
                              value={equipment.hours}
                              onChange={(e) => setEquipment((s) => ({ ...s, hours: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-slate-300">
                          Tip: For best availability, book 1–2 days in advance.
                        </div>
                      </motion.div>
                    )}

                    {tab === "expert" && (
                      <motion.div key="expert" {...cardMotion} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                              Consultation type
                            </label>
                            <select
                              className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-blue-500/60"
                              value={expert.type}
                              onChange={(e) => setExpert((s) => ({ ...s, type: e.target.value }))}
                            >
                              {["Crop planning", "Disease help", "Fertilizer schedule", "Irrigation advice"].map((x) => (
                                <option key={x} value={x}>
                                  {x}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                              Phone (WhatsApp)
                            </label>
                            <input
                              className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-blue-500/60"
                              value={expert.phone}
                              onChange={(e) => setExpert((s) => ({ ...s, phone: e.target.value }))}
                              placeholder="+91 9xxxx xxxxx"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                            Preferred language
                          </label>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {["Telugu", "Hindi", "English"].map((l) => (
                              <button
                                key={l}
                                type="button"
                                onClick={() => setExpert((s) => ({ ...s, preferredLanguage: l }))}
                                className={`rounded-xl border px-3 py-2 text-xs font-bold ${
                                  expert.preferredLanguage === l
                                    ? "border-blue-500/50 bg-blue-500/15 text-white"
                                    : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                                }`}
                              >
                                {l}
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {tab === "supply" && (
                      <motion.div key="supply" {...cardMotion} className="space-y-4">
                        <div>
                          <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                            Items needed
                          </label>
                          <textarea
                            className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-blue-500/60"
                            rows={3}
                            value={supply.items}
                            onChange={(e) => setSupply((s) => ({ ...s, items: e.target.value }))}
                            placeholder="e.g. Paddy seed 10kg, DAP 1 bag, Neem oil 1L"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                            Delivery address
                          </label>
                          <textarea
                            className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-blue-500/60"
                            rows={3}
                            value={supply.address}
                            onChange={(e) => setSupply((s) => ({ ...s, address: e.target.value }))}
                            placeholder="Village, Mandal, Landmark"
                            required
                          />
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-slate-300">
                          You’ll get a confirmation call once a supplier accepts the order.
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div>
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                      Notes (optional)
                    </label>
                    <textarea
                      className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-blue-500/60"
                      rows={3}
                      value={common.notes}
                      onChange={(e) => setCommon((s) => ({ ...s, notes: e.target.value }))}
                      placeholder="Any timing constraints or special request"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs text-slate-300">
                      {tab === "equipment"
                        ? "We’ll match you with a nearby operator."
                        : tab === "expert"
                        ? "We’ll schedule a call with an expert."
                        : "We’ll route your request to local suppliers."}
                    </div>
                    <Button variant="gradient" size="md" isLoading={submitting} type="submit">
                      {submitting ? "Submitting..." : "Confirm booking"}
                    </Button>
                  </div>
                </form>
              </GlassCard>
            </div>

            <div className="lg:col-span-2">
              <GlassCard className="bg-white/5">
                <div className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                  Booking status
                </div>
                <div className="mt-3 text-base font-black">Latest request</div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm">
                  {!lastBooking ? (
                    <div className="text-slate-300">
                      No booking yet. Fill the form and confirm to generate a request.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-slate-300">Request ID</div>
                        <div className="font-mono text-xs text-white/90">{lastBooking.id}</div>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-slate-300">Type</div>
                        <div className="font-semibold text-white/90">
                          {lastBooking.payload.booking_type}
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-slate-300">District</div>
                        <div className="font-semibold text-white/90">{lastBooking.payload.district}</div>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-slate-300">Date</div>
                        <div className="font-semibold text-white/90">{lastBooking.payload.date}</div>
                      </div>
                      <div className="mt-3 text-xs text-slate-400">
                        Saved locally for now. We’ll wire this to your booking backend once endpoints are finalized.
                      </div>
                    </div>
                  )}
                </div>
              </GlassCard>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function BookingSystem() {
  const role = useRmRole();
  if (isSupplierRole(role)) {
    return <SupplierWorkHub />;
  }
  return <FarmerBookingRequestPage />;
}
