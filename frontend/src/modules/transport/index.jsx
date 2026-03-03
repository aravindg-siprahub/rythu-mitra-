import React, { useState } from 'react';
import { THEME } from '../../styles/theme';
import SeasonBanner from '../../components/ui/SeasonBanner';

const LOAD_TYPES = [
    { key: 'grain', label: 'Grain', icon: '🌾' },
    { key: 'vegetables', label: 'Vegetables', icon: '🥬' },
    { key: 'fertilizer', label: 'Fertilizer', icon: '🧪' },
    { key: 'equipment', label: 'Equipment', icon: '⚙️' },
    { key: 'other', label: 'Other', icon: '📦' },
];

const VEHICLE_TYPES = [
    { key: 'mini_truck', label: 'Mini Truck', icon: '🚐', capacity: '1–3 tons' },
    { key: 'truck', label: 'Truck', icon: '🚛', capacity: '5–15 tons' },
    { key: 'tractor', label: 'Tractor', icon: '🚜', capacity: '1–5 tons' },
];

const DISTRICTS = ['Warangal', 'Karimnagar', 'Nizamabad', 'Khammam', 'Nalgonda'];

const BOOKING_STATES = [
    'Request Created', 'Offers Received', 'Offer Accepted',
    'Confirmed', 'In Progress', 'Completed',
];

function StatusTimeline({ currentStep }) {
    return (
        <div className="flex items-center gap-0 overflow-x-auto pb-2">
            {BOOKING_STATES.map((state, i) => {
                const done = i < currentStep;
                const current = i === currentStep;
                return (
                    <React.Fragment key={state}>
                        <div className="flex flex-col items-center min-w-[80px]">
                            <div
                                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black"
                                style={{
                                    backgroundColor: done ? THEME.colors.riskLow : current ? THEME.colors.primary : '#E8F5E9',
                                    color: done || current ? '#fff' : THEME.colors.textMuted,
                                }}
                            >
                                {done ? '✓' : i + 1}
                            </div>
                            <span
                                className="text-[9px] font-medium mt-1 text-center leading-tight max-w-[72px]"
                                style={{ color: current ? THEME.colors.primary : done ? THEME.colors.riskLow : THEME.colors.textMuted }}
                            >
                                {state}
                            </span>
                        </div>
                        {i < BOOKING_STATES.length - 1 && (
                            <div className="h-0.5 flex-1 min-w-[12px]"
                                style={{ backgroundColor: i < currentStep ? THEME.colors.riskLow : THEME.colors.border }} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

export default function TransportBooking() {
    const [origin, setOrigin] = useState('Warangal');
    const [destination, setDestination] = useState('Karimnagar');
    const [loadType, setLoadType] = useState('');
    const [weight, setWeight] = useState(500);
    const [date, setDate] = useState('');
    const [vehicleType, setVehicleType] = useState('');
    const [bookingStatus, setBookingStatus] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);

    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 1);
    const minDateStr = minDate.toISOString().split('T')[0];

    // Rough truck estimate (1 truck ≈ 5000 kg)
    const trucksNeeded = Math.max(1, Math.ceil(weight / 5000));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!loadType || !vehicleType || !date) {
            alert('Please fill all required fields.');
            return;
        }
        setBookingStatus({ id: `TB${Date.now().toString().slice(-6)}`, origin, destination, loadType, date });
        setCurrentStep(0);
    };

    return (
        <div style={{ backgroundColor: THEME.colors.background, minHeight: '100vh' }}>
            <SeasonBanner />
            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-black" style={{ color: THEME.colors.textPrimary }}>
                        🚛 Book Transport for Your Produce
                    </h1>
                    <p className="text-sm mt-1" style={{ color: THEME.colors.textSecondary }}>
                        Find trucks and vehicles to move your harvest
                    </p>
                </div>

                {!bookingStatus ? (
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Route selector */}
                        <div
                            className="rounded-xl p-5 shadow-sm"
                            style={{ backgroundColor: THEME.colors.surface, border: `1px solid ${THEME.colors.border}` }}
                        >
                            <h2 className="font-bold text-sm mb-4" style={{ color: THEME.colors.textPrimary }}>
                                Route
                            </h2>
                            <div className="flex items-center gap-3">
                                <div className="flex-1">
                                    <label className="text-xs font-semibold block mb-1" style={{ color: THEME.colors.textSecondary }}>
                                        Origin
                                    </label>
                                    <select
                                        value={origin}
                                        onChange={(e) => setOrigin(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border text-sm"
                                        style={{ borderColor: THEME.colors.border, color: THEME.colors.textPrimary }}
                                    >
                                        {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div className="mt-5 text-2xl font-black" style={{ color: THEME.colors.primary }}>→</div>
                                <div className="flex-1">
                                    <label className="text-xs font-semibold block mb-1" style={{ color: THEME.colors.textSecondary }}>
                                        Destination
                                    </label>
                                    <select
                                        value={destination}
                                        onChange={(e) => setDestination(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border text-sm"
                                        style={{ borderColor: THEME.colors.border, color: THEME.colors.textPrimary }}
                                    >
                                        {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Load type */}
                        <div
                            className="rounded-xl p-5 shadow-sm"
                            style={{ backgroundColor: THEME.colors.surface, border: `1px solid ${THEME.colors.border}` }}
                        >
                            <h2 className="font-bold text-sm mb-3" style={{ color: THEME.colors.textPrimary }}>
                                What are you transporting?
                            </h2>
                            <div className="flex flex-wrap gap-3">
                                {LOAD_TYPES.map(({ key, label, icon }) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setLoadType(key)}
                                        className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl border font-semibold text-sm transition-all"
                                        style={{
                                            backgroundColor: loadType === key ? THEME.colors.primary : THEME.colors.surface,
                                            color: loadType === key ? '#fff' : THEME.colors.textPrimary,
                                            borderColor: loadType === key ? THEME.colors.primary : THEME.colors.border,
                                        }}
                                    >
                                        <span className="text-2xl">{icon}</span>
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Weight + Date */}
                        <div
                            className="rounded-xl p-5 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4"
                            style={{ backgroundColor: THEME.colors.surface, border: `1px solid ${THEME.colors.border}` }}
                        >
                            <div>
                                <label className="text-xs font-semibold block mb-2" style={{ color: THEME.colors.textSecondary }}>
                                    ⚖️ Estimated Weight: <strong>{weight.toLocaleString('en-IN')} kg</strong>
                                    <span className="ml-2 font-normal" style={{ color: THEME.colors.textMuted }}>
                                        (~{trucksNeeded} truck{trucksNeeded > 1 ? 's' : ''} needed)
                                    </span>
                                </label>
                                <input
                                    type="range"
                                    min={100}
                                    max={10000}
                                    step={100}
                                    value={weight}
                                    onChange={(e) => setWeight(parseInt(e.target.value))}
                                    className="w-full accent-green-700"
                                />
                                <div className="flex justify-between text-[10px] mt-1" style={{ color: THEME.colors.textMuted }}>
                                    <span>100 kg</span>
                                    <span>10,000 kg</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold block mb-1" style={{ color: THEME.colors.textSecondary }}>
                                    📅 Preferred Date
                                </label>
                                <input
                                    type="date"
                                    min={minDateStr}
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border text-sm"
                                    style={{ borderColor: THEME.colors.border, color: THEME.colors.textPrimary }}
                                />
                            </div>
                        </div>

                        {/* Vehicle type */}
                        <div
                            className="rounded-xl p-5 shadow-sm"
                            style={{ backgroundColor: THEME.colors.surface, border: `1px solid ${THEME.colors.border}` }}
                        >
                            <h2 className="font-bold text-sm mb-3" style={{ color: THEME.colors.textPrimary }}>
                                Preferred Vehicle
                            </h2>
                            <div className="flex flex-wrap gap-3">
                                {VEHICLE_TYPES.map(({ key, label, icon, capacity }) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setVehicleType(key)}
                                        className="flex flex-col items-center gap-1 px-5 py-3 rounded-xl border font-semibold text-sm transition-all"
                                        style={{
                                            backgroundColor: vehicleType === key ? THEME.colors.primary : THEME.colors.surface,
                                            color: vehicleType === key ? '#fff' : THEME.colors.textPrimary,
                                            borderColor: vehicleType === key ? THEME.colors.primary : THEME.colors.border,
                                        }}
                                    >
                                        <span className="text-2xl">{icon}</span>
                                        {label}
                                        <span
                                            className="text-[10px] font-normal"
                                            style={{ color: vehicleType === key ? '#a7f3d0' : THEME.colors.textMuted }}
                                        >
                                            {capacity}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 rounded-xl font-bold text-white text-sm"
                            style={{ backgroundColor: THEME.colors.primary }}
                        >
                            🚛 Find Transport
                        </button>
                    </form>

                ) : (
                    /* ── Status tracker ──────────── */
                    <div
                        className="rounded-xl p-6 shadow-sm"
                        style={{ backgroundColor: THEME.colors.surface, border: `1px solid ${THEME.colors.border}` }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="font-bold text-base" style={{ color: THEME.colors.textPrimary }}>
                                    Booking #{bookingStatus.id}
                                </h2>
                                <p className="text-xs mt-1" style={{ color: THEME.colors.textMuted }}>
                                    {bookingStatus.origin} → {bookingStatus.destination} · {bookingStatus.date}
                                </p>
                            </div>
                            {currentStep < 5 && (
                                <button
                                    onClick={() => { setBookingStatus(null); setCurrentStep(0); }}
                                    className="px-3 py-1 rounded-lg text-xs border font-medium"
                                    style={{ color: THEME.colors.riskHigh, borderColor: THEME.colors.riskHigh }}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                        <StatusTimeline currentStep={currentStep} />
                        <div className="mt-6 flex gap-3 justify-end">
                            {currentStep < BOOKING_STATES.length - 1 && (
                                <button
                                    onClick={() => setCurrentStep(s => s + 1)}
                                    className="px-4 py-2 rounded-lg text-sm font-bold text-white"
                                    style={{ backgroundColor: THEME.colors.primary }}
                                >
                                    Simulate Next Step
                                </button>
                            )}
                            <button
                                onClick={() => { setBookingStatus(null); setCurrentStep(0); }}
                                className="px-4 py-2 rounded-lg text-sm border font-medium"
                                style={{ color: THEME.colors.textSecondary, borderColor: THEME.colors.border }}
                            >
                                New Booking
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
