import React, { useState } from 'react';
import { THEME } from '../../styles/theme';
import SeasonBanner from '../../components/ui/SeasonBanner';

const TASK_TYPES = [
    { key: 'plowing', label: 'Plowing', icon: '🚜' },
    { key: 'sowing', label: 'Sowing', icon: '🌱' },
    { key: 'harvesting', label: 'Harvesting', icon: '🌾' },
    { key: 'spraying', label: 'Spraying', icon: '💊' },
    { key: 'other', label: 'Other', icon: '📦' },
];

const DURATIONS = ['Half Day', 'Full Day', 'Multiple Days'];

const BOOKING_STATES = [
    'Request Created',
    'Offers Received',
    'Offer Accepted',
    'Confirmed',
    'In Progress',
    'Completed',
];

// ── Status timeline ────────────────────────────────────────────────────────────
function StatusTimeline({ currentStep }) {
    return (
        <div className="flex items-center gap-0 overflow-x-auto pb-2">
            {BOOKING_STATES.map((state, i) => {
                const isComplete = i < currentStep;
                const isCurrent = i === currentStep;
                return (
                    <React.Fragment key={state}>
                        <div className="flex flex-col items-center min-w-[80px]">
                            <div
                                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black"
                                style={{
                                    backgroundColor: isComplete
                                        ? THEME.colors.riskLow
                                        : isCurrent
                                            ? THEME.colors.primary
                                            : '#E8F5E9',
                                    color: isComplete || isCurrent ? '#fff' : THEME.colors.textMuted,
                                    animation: isCurrent ? 'pulse 2s infinite' : 'none',
                                    boxShadow: isCurrent ? `0 0 0 4px ${THEME.colors.primary}22` : 'none',
                                }}
                            >
                                {isComplete ? '✓' : i + 1}
                            </div>
                            <span
                                className="text-[9px] font-medium mt-1 text-center leading-tight max-w-[72px]"
                                style={{
                                    color: isCurrent ? THEME.colors.primary : isComplete ? THEME.colors.riskLow : THEME.colors.textMuted,
                                }}
                            >
                                {state}
                            </span>
                        </div>
                        {i < BOOKING_STATES.length - 1 && (
                            <div
                                className="h-0.5 flex-1 min-w-[12px]"
                                style={{
                                    backgroundColor: i < currentStep ? THEME.colors.riskLow : THEME.colors.border,
                                }}
                            />
                        )}
                    </React.Fragment>
                );
            })}
            <style>{`@keyframes pulse { 0%,100%{box-shadow:0 0 0 4px ${THEME.colors.primary}22} 50%{box-shadow:0 0 0 8px ${THEME.colors.primary}11} }`}</style>
        </div>
    );
}

const DISTRICTS = ['Warangal', 'Karimnagar', 'Nizamabad', 'Khammam', 'Nalgonda'];

export default function WorkerBooking() {
    const [taskType, setTaskType] = useState('');
    const [date, setDate] = useState('');
    const [district, setDistrict] = useState('Warangal');
    const [duration, setDuration] = useState('Full Day');
    const [workers, setWorkers] = useState(1);
    const [requirements, setRequirements] = useState('');
    const [bookingStatus, setBookingStatus] = useState(null); // null = not submitted
    const [currentStep, setCurrentStep] = useState(0);

    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 1);
    const minDateStr = minDate.toISOString().split('T')[0];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!taskType || !date) {
            alert('Please select a task type and date.');
            return;
        }
        // Simulate booking creation (backend endpoint to be connected when available)
        setBookingStatus({ id: `WB${Date.now().toString().slice(-6)}`, taskType, date, district });
        setCurrentStep(0);
    };

    return (
        <div style={{ backgroundColor: THEME.colors.background, minHeight: '100vh' }}>
            <SeasonBanner />
            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-black" style={{ color: THEME.colors.textPrimary }}>
                        👷 Find Agricultural Workers
                    </h1>
                    <p className="text-sm mt-1" style={{ color: THEME.colors.textSecondary }}>
                        Connect with skilled workers in your area
                    </p>
                </div>

                {!bookingStatus ? (
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Task type cards */}
                        <div
                            className="rounded-xl p-5 shadow-sm"
                            style={{ backgroundColor: THEME.colors.surface, border: `1px solid ${THEME.colors.border}` }}
                        >
                            <h2 className="font-bold text-sm mb-3" style={{ color: THEME.colors.textPrimary }}>
                                What work do you need?
                            </h2>
                            <div className="flex flex-wrap gap-3">
                                {TASK_TYPES.map(({ key, label, icon }) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setTaskType(key)}
                                        className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl border font-semibold text-sm transition-all"
                                        style={{
                                            backgroundColor: taskType === key ? THEME.colors.primary : THEME.colors.surface,
                                            color: taskType === key ? '#fff' : THEME.colors.textPrimary,
                                            borderColor: taskType === key ? THEME.colors.primary : THEME.colors.border,
                                        }}
                                    >
                                        <span className="text-2xl">{icon}</span>
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Date, District, Duration */}
                        <div
                            className="rounded-xl p-5 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4"
                            style={{ backgroundColor: THEME.colors.surface, border: `1px solid ${THEME.colors.border}` }}
                        >
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

                            <div>
                                <label className="text-xs font-semibold block mb-1" style={{ color: THEME.colors.textSecondary }}>
                                    📍 District
                                </label>
                                <select
                                    value={district}
                                    onChange={(e) => setDistrict(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border text-sm"
                                    style={{ borderColor: THEME.colors.border, color: THEME.colors.textPrimary }}
                                >
                                    {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-semibold block mb-2" style={{ color: THEME.colors.textSecondary }}>
                                    ⏱️ Duration
                                </label>
                                <div className="flex gap-2">
                                    {DURATIONS.map((d) => (
                                        <button
                                            key={d}
                                            type="button"
                                            onClick={() => setDuration(d)}
                                            className="flex-1 py-2 rounded-lg text-xs font-bold border"
                                            style={{
                                                backgroundColor: duration === d ? THEME.colors.primary : THEME.colors.surface,
                                                color: duration === d ? '#fff' : THEME.colors.textSecondary,
                                                borderColor: duration === d ? THEME.colors.primary : THEME.colors.border,
                                            }}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold block mb-1" style={{ color: THEME.colors.textSecondary }}>
                                    👷 Workers Needed (1–10)
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    max={10}
                                    value={workers}
                                    onChange={(e) => setWorkers(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border text-sm"
                                    style={{ borderColor: THEME.colors.border, color: THEME.colors.textPrimary }}
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="text-xs font-semibold block mb-1" style={{ color: THEME.colors.textSecondary }}>
                                    📝 Special Requirements (optional)
                                </label>
                                <textarea
                                    rows={2}
                                    value={requirements}
                                    onChange={(e) => setRequirements(e.target.value)}
                                    placeholder="Any specific skills or equipment needed?"
                                    className="w-full px-3 py-2 rounded-lg border text-sm resize-none"
                                    style={{ borderColor: THEME.colors.border, color: THEME.colors.textPrimary }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 rounded-xl font-bold text-white text-sm"
                            style={{ backgroundColor: THEME.colors.primary }}
                        >
                            👷 Find Workers
                        </button>
                    </form>

                ) : (
                    /* ── Booking status tracker ──────────── */
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
                                    {TASK_TYPES.find(t => t.key === bookingStatus.taskType)?.icon}{' '}
                                    {TASK_TYPES.find(t => t.key === bookingStatus.taskType)?.label} ·{' '}
                                    {bookingStatus.date} · {bookingStatus.district}
                                </p>
                            </div>
                            {currentStep < 5 && (
                                <button
                                    onClick={() => { setBookingStatus(null); setCurrentStep(0); }}
                                    className="px-3 py-1 rounded-lg text-xs border font-medium"
                                    style={{ color: THEME.colors.riskHigh, borderColor: THEME.colors.riskHigh }}
                                >
                                    Cancel Booking
                                </button>
                            )}
                        </div>

                        <StatusTimeline currentStep={currentStep} />

                        {/* Demo progression buttons */}
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
