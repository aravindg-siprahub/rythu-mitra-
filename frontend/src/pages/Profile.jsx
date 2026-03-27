import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabaseClient';
import {
    getFarmerCity,
    getFarmerDistrict,
    getFarmerState
} from '../utils/locationService';

/**
 * Premium Profile Page for Rythu Mitra
 * Designed with a focus on modern UX, performance, and accessibility.
 */
export default function Profile() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('farm');
    const [isEditing, setIsEditing] = useState(false);
    const [memberSince, setMemberSince] = useState('');
    const [role, setRole] = useState('Farmer');
    const [autoFilledLocation, setAutoFilledLocation] = useState(false);
    const [farmSize, setFarmSize] = useState('');
    const [primaryCrops, setPrimaryCrops] = useState([]);
    const [farmingYears, setFarmingYears] = useState('');
    const [userRole, setUserRole] = useState('farmer'); // farmer | worker | both
    const [savedCropReports, setSavedCropReports] = useState([]);
    const [savedDiseaseReports, setSavedDiseaseReports] = useState([]);
    const [cropReportCount, setCropReportCount] = useState(0);
    const [diseaseReportCount, setDiseaseReportCount] = useState(0);

    // Form states
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        location: '',
        district: '',
        farm_size: '',
        primary_crops: ''
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        async function fetchProfile() {
            try {
                const { data: sessionData } = await supabase.auth.getSession();
                const sessionUser = sessionData?.session?.user;
                if (!sessionUser) {
                    setLoading(false);
                    return;
                }

                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', sessionUser.id)
                    .maybeSingle();

                if (error) {
                    console.error('[Profile] fetch failed:', error);
                    setLoading(false);
                    return;
                }

                let profile = data;
                if (!profile) {
                    const { data: created, error: createError } = await supabase
                        .from('profiles')
                        .insert({
                            id: sessionUser.id,
                            email: sessionUser.email,
                            created_at: new Date().toISOString(),
                        })
                        .select('*')
                        .single();

                    if (createError) {
                        console.error('[Profile] create failed:', createError);
                        setLoading(false);
                        return;
                    }
                    profile = created;
                }

                setProfileData(profile || {});
                const gpsCity = getFarmerCity() || '';
                const gpsDistrict = getFarmerDistrict() || '';
                const gpsState = getFarmerState() || '';

                const resolvedLocation =
                    profile?.location ||
                    profile?.city ||
                    profile?.village ||
                    gpsCity ||
                    '';
                const resolvedDistrict =
                    profile?.district ||
                    profile?.district_name ||
                    gpsDistrict ||
                    '';

                setFormData({
                    full_name: profile?.full_name || profile?.name || profile?.farmer_name || sessionUser.user_metadata?.full_name || '',
                    phone: profile?.phone || profile?.phone_number || profile?.mobile || '',
                    location: resolvedLocation,
                    district: resolvedDistrict,
                    farm_size: profile?.farm_size || profile?.farm_size_acres || '',
                    primary_crops: profile?.primary_crops || '',
                });
                setFarmSize((profile?.farm_size || profile?.farm_size_acres || '').toString());
                const cropsRaw = profile?.primary_crops || [];
                setPrimaryCrops(Array.isArray(cropsRaw) ? cropsRaw : String(cropsRaw).split(',').map((c) => c.trim()).filter(Boolean));
                setFarmingYears((profile?.farming_years || '').toString());
                setUserRole((profile?.user_role || 'farmer').toLowerCase());

                if (!profile?.location && !profile?.city && !profile?.village && gpsCity) {
                    setAutoFilledLocation(true);
                } else {
                    setAutoFilledLocation(false);
                }

                const rawRole = (profile?.user_role || 'farmer').toString();
                setRole(rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase());
                setMemberSince(
                    profile?.created_at
                        ? new Date(profile.created_at).getFullYear().toString()
                        : new Date().getFullYear().toString()
                );
            } catch (err) {
                console.error('[Profile] Load failed:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchProfile();
    }, [user, navigate]);

    useEffect(() => {
        try {
            const crops = JSON.parse(localStorage.getItem('rm_crop_reports') || '[]');
            setCropReportCount(Array.isArray(crops) ? crops.length : 0);
            setSavedCropReports(Array.isArray(crops) ? crops.slice(0, 3) : []);

            const diseases = JSON.parse(localStorage.getItem('rm_disease_history') || '[]');
            setDiseaseReportCount(Array.isArray(diseases) ? diseases.length : 0);
            setSavedDiseaseReports(Array.isArray(diseases) ? diseases.slice(0, 3) : []);
        } catch (e) {
            console.error('Failed to load reports:', e);
        }
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    ...formData,
                    farm_size_acres: farmSize ? Number(farmSize) : null,
                    primary_crops: primaryCrops,
                    farming_years: farmingYears ? Number(farmingYears) : null,
                    user_role: userRole,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', user.id);

            if (error) {
                console.error('[Profile] save error:', error);
            } else {
                setProfileData({ ...profileData, ...formData });
                setIsEditing(false);
            }
        } catch (err) {
            console.error('[Profile] update failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const getProfileCompletion = () => {
        const fields = [
            { key: 'name', value: formData.full_name, label: 'Full name', impact: 'Show your name to farmers/workers' },
            { key: 'phone', value: formData.phone, label: 'Phone number', impact: 'Required for Call + WhatsApp contact' },
            { key: 'location', value: formData.location, label: 'Village/City', impact: 'Helps match nearby jobs' },
            { key: 'district', value: formData.district, label: 'District', impact: 'Required for market price auto-fill' },
            { key: 'farmSize', value: formData.farm_size, label: 'Farm size', impact: 'Personalizes income estimates' },
        ];

        const filled = fields.filter((f) => f.value && f.value.toString().trim() !== '');
        const missing = fields.filter((f) => !f.value || f.value.toString().trim() === '');
        const percent = Math.round((filled.length / fields.length) * 100);

        return { percent, missing, filled };
    };

    if (loading && !profileData) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#020617] text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-emerald-500" />
                    <p className="text-sm font-medium text-slate-400">Loading your profile...</p>
                </div>
            </div>
        );
    }

    const initials = (
        formData.full_name ||
        user?.user_metadata?.full_name ||
        user?.email ||
        'F'
    )
        .charAt(0)
        .toUpperCase();

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-24 font-sans selection:bg-emerald-100 selection:text-emerald-900">
            {/* Header / Banner Area */}
            <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 md:h-64">
                <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '24px 24px'
                }}></div>
                <div className="absolute bottom-0 left-0 h-32 w-full bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>

            {/* Profile Content Container */}
            <div className="relative -mt-16 px-4 md:container md:mx-auto md:max-w-4xl md:px-0">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-200/50"
                >
                    {(() => {
                        const { percent, missing } = getProfileCompletion();
                        if (percent === 100) return null;

                        return (
                            <div
                                className="mx-4 mb-6 mt-6 rounded-xl border px-4 py-3 sm:mx-6 md:mx-8 md:mt-8 md:mb-8"
                                style={{
                                    background: percent >= 80 ? '#f0fdf4' : '#fffbeb',
                                    borderColor: percent >= 80 ? '#86efac' : '#fcd34d'
                                }}
                            >
                                <div className="mb-2 flex items-center gap-3">
                                    <div className="h-1.5 flex-1 overflow-hidden rounded bg-slate-200">
                                        <div
                                            className="h-full rounded transition-all duration-500"
                                            style={{
                                                width: `${percent}%`,
                                                background: percent >= 80 ? '#16a34a' : '#f59e0b',
                                            }}
                                        />
                                    </div>
                                    <span
                                        className="text-xs font-bold"
                                        style={{ color: percent >= 80 ? '#166534' : '#92400e' }}
                                    >
                                        {percent}%
                                    </span>
                                </div>

                                {missing.length > 0 && (
                                    <div
                                        className="text-xs"
                                        style={{ color: percent >= 80 ? '#166534' : '#92400e' }}
                                    >
                                        Add <strong>{missing[0].label}</strong> → {missing[0].impact}
                                    </div>
                                )}
                            </div>
                        );
                    })()}

                    {/* Upper Profile Section — avatar uses mt-0 so it never overlaps the completion bar above */}
                    <div className="flex flex-col items-center gap-4 px-6 pb-6 pt-6 sm:px-8 sm:pb-8 sm:pt-8 md:flex-row md:items-center md:gap-8 md:px-10 md:pb-10">
                        {/* Avatar */}
                        <div className="relative mt-0 flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-white shadow-lg sm:h-28 sm:w-28 md:h-36 md:w-36">
                            <div className="flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 text-3xl font-black text-emerald-700 sm:text-4xl md:text-5xl">
                                {initials}
                            </div>
                            <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full border-4 border-white bg-emerald-500 shadow-md"></div>
                        </div>

                        {/* Identity Info */}
                        <div className="mt-4 flex-1 text-center md:mt-0 md:text-left">
                            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
                                {formData.full_name || 'Farmer Friend'}
                            </h1>
                            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:justify-start">
                                <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
                                    {role || 'Farmer'}
                                </span>
                                <span className="inline-flex items-center text-xs font-medium text-slate-500 sm:text-sm">
                                    <span className="mr-1.5 opacity-60">📍</span> {formData.location || 'Location not set'}
                                </span>
                            </div>
                            <div className="mt-1 text-xs font-medium text-slate-500 sm:mt-2 sm:text-sm">
                                {role || 'Farmer'} · Member since {memberSince || new Date().getFullYear()}
                            </div>
                        </div>

                        {/* Action Bar */}
                        <div className="mt-3 flex w-full gap-2 sm:gap-3 md:mt-0 md:w-auto md:shrink-0">
                            {!isEditing ? (
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className="flex-1 rounded-2xl bg-slate-100 px-4 py-3 text-xs font-bold text-slate-700 transition-all hover:bg-slate-200 sm:px-6 sm:py-3.5 sm:text-sm md:flex-none"
                                >
                                    Edit Profile
                                </button>
                            ) : (
                                <>
                                    <button 
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 rounded-2xl bg-slate-100 px-4 py-3 text-xs font-bold text-slate-700 sm:px-6 sm:py-3.5 sm:text-sm md:flex-none"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleSave}
                                        className="flex-1 rounded-2xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 hover:shadow-emerald-300 sm:px-6 sm:py-3.5 sm:text-sm md:flex-none"
                                    >
                                        Save Changes
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Tabs / Navigation */}
                    <div className="flex border-b border-slate-100 bg-slate-50/50 px-6">
                        {['info', 'farm', 'activity'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`relative py-5 px-4 text-sm font-bold tracking-tight transition-all ${
                                    activeTab === tab ? 'text-emerald-700' : 'text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                {tab === 'info' ? 'My Details' : tab === 'farm' ? 'Farm Intelligence' : 'Recent Activity'}
                                {activeTab === tab && (
                                    <motion.div layoutId="tabIndicator" className="absolute bottom-0 left-0 h-0.5 w-full bg-emerald-600"></motion.div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Content Section */}
                    <div className="p-6 sm:p-8 md:p-10">
                        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                            {[
                                { label: 'Crop scans', value: cropReportCount, icon: '🌾' },
                                { label: 'Disease scans', value: diseaseReportCount, icon: '🦠' },
                                { label: 'Reports saved', value: cropReportCount + diseaseReportCount, icon: '📋' },
                            ].map((stat) => (
                                <div key={stat.label} className="rounded-xl bg-slate-50 px-3 py-3 text-center">
                                    <div className="mb-1 text-lg">{stat.icon}</div>
                                    <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                                    <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            {activeTab === 'info' && (
                                <motion.div 
                                    key="info"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="grid gap-8 md:grid-cols-2"
                                >
                                    <div className="space-y-6">
                                        <div className="group">
                                            <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">Full Name</label>
                                            <input 
                                                disabled={!isEditing}
                                                type="text"
                                                value={formData.full_name}
                                                onChange={e => setFormData({...formData, full_name: e.target.value})}
                                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-sm font-bold text-slate-800 transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 md:text-base"
                                                placeholder="Enter full name"
                                            />
                                        </div>
                                        <div className="group">
                                            <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">Phone Number</label>
                                            <input 
                                                disabled={!isEditing}
                                                type="tel"
                                                value={formData.phone}
                                                onChange={e => setFormData({...formData, phone: e.target.value})}
                                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 font-bold text-slate-800 transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                                                placeholder="+91 00000 00000"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="group">
                                            <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">Email Address (Read-only)</label>
                                            <div className="rounded-2xl border border-slate-100 bg-slate-50/30 p-4 font-bold text-slate-400">
                                                {user.email}
                                            </div>
                                        </div>
                                        <div className="group">
                                            <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">Default Location</label>
                                            <input 
                                                disabled={!isEditing}
                                                type="text"
                                                value={formData.location}
                                                onChange={e => setFormData({...formData, location: e.target.value})}
                                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 font-bold text-slate-800 transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                                                placeholder="e.g. Madanapalle, Andhra Pradesh"
                                            />
                                            {autoFilledLocation && (
                                                <div className="mt-1 text-xs font-medium text-sky-700">
                                                    📍 Auto-filled from GPS · Tap Edit to confirm
                                                </div>
                                            )}
                                        </div>
                                        <div className="group">
                                            <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">District</label>
                                            <input
                                                disabled={!isEditing}
                                                type="text"
                                                value={formData.district}
                                                onChange={e => setFormData({ ...formData, district: e.target.value })}
                                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 font-bold text-slate-800 transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                                                placeholder="e.g. Chittoor"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'farm' && (
                                <motion.div 
                                    key="farm"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="grid gap-6 md:grid-cols-2"
                                >
                                    <p className="text-sm leading-relaxed text-slate-600 md:col-span-2">
                                        Add your farm details below. Values save when you tap <strong>Save Changes</strong>.
                                    </p>

                                    <div className="space-y-6">
                                        <div className="group">
                                            <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">Total Farm Size (Acres)</label>
                                            <input 
                                                disabled={!isEditing}
                                                type="number"
                                                value={farmSize}
                                                onChange={e => {
                                                    setFarmSize(e.target.value);
                                                    setFormData({ ...formData, farm_size: e.target.value });
                                                }}
                                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 font-bold text-slate-800 transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                                                placeholder="e.g. 5"
                                            />
                                        </div>
                                        <div className="group">
                                            <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">Farming Experience (Years)</label>
                                            <input
                                                disabled={!isEditing}
                                                type="number"
                                                value={farmingYears}
                                                onChange={e => setFarmingYears(e.target.value)}
                                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 font-bold text-slate-800 transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                                                placeholder="e.g. 10"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="group">
                                            <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">Primary Crops Grown</label>
                                            <input 
                                                disabled={!isEditing}
                                                type="text"
                                                value={primaryCrops.join(', ')}
                                                onChange={e => {
                                                    const next = e.target.value
                                                        .split(',')
                                                        .map((c) => c.trim())
                                                        .filter(Boolean);
                                                    setPrimaryCrops(next);
                                                    setFormData({ ...formData, primary_crops: e.target.value });
                                                }}
                                                className="w-full min-h-[120px] rounded-2xl border border-slate-200 bg-slate-50/50 p-4 font-bold text-slate-800 transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                                                placeholder="e.g. Rice, Tomatoes, Sugarcane"
                                            />
                                            {primaryCrops.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {primaryCrops.map((crop) => (
                                                        <span key={crop} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                                            {crop}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <div className="mb-3 text-xs font-black uppercase tracking-widest text-slate-500">I am a</div>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                            {[
                                                { key: 'farmer', label: 'Farmer', desc: 'I own or manage a farm' },
                                                { key: 'worker', label: 'Worker', desc: 'I look for farm work' },
                                                { key: 'both', label: 'Both', desc: 'Farmer and worker' },
                                            ].map((r) => (
                                                <button
                                                    key={r.key}
                                                    type="button"
                                                    disabled={!isEditing}
                                                    onClick={() => {
                                                        setUserRole(r.key);
                                                        setRole(r.label);
                                                    }}
                                                    className={`min-h-[88px] rounded-xl border-2 px-4 py-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${userRole === r.key ? 'border-emerald-600 bg-emerald-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'} ${!isEditing ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
                                                >
                                                    <div className={`text-sm font-bold ${userRole === r.key ? 'text-emerald-900' : 'text-slate-900'}`}>
                                                        {r.label}
                                                    </div>
                                                    <div className="mt-0.5 text-xs leading-relaxed text-slate-600 md:text-sm">
                                                        {r.desc}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {(savedCropReports.length > 0 || savedDiseaseReports.length > 0) && (
                                        <div className="md:col-span-2">
                                            <div className="my-4 h-px bg-slate-200" />
                                            <div className="mb-4 text-xs font-black uppercase tracking-widest text-slate-500">
                                                My Saved Reports
                                            </div>

                                            {savedCropReports.map((report, i) => (
                                                <div
                                                    key={`crop-${i}`}
                                                    className="mb-2 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                                                >
                                                    <div>
                                                        <div className="text-sm font-semibold text-slate-800">
                                                            🌾 {report?.crop_name || 'Crop recommendation'}
                                                        </div>
                                                        <div className="mt-0.5 text-xs text-slate-500">
                                                            {report?.farm_acres || '—'} acre ·{' '}
                                                            {report?.saved_at
                                                                ? new Date(report.saved_at).toLocaleDateString('en-IN')
                                                                : 'Recently'}
                                                        </div>
                                                    </div>
                                                    <div className="text-xs font-semibold text-emerald-700">
                                                        {report?.confidence ? `${report.confidence}% AI` : 'AI'}
                                                    </div>
                                                </div>
                                            ))}

                                            {savedDiseaseReports.map((report, i) => (
                                                <div
                                                    key={`disease-${i}`}
                                                    className="mb-2 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                                                >
                                                    <div>
                                                        <div className="text-sm font-semibold text-slate-800">
                                                            🦠 {report?.disease_name || 'Disease detection'}
                                                        </div>
                                                        <div className="mt-0.5 text-xs text-slate-500">
                                                            {report?.crop || 'Crop'} ·{' '}
                                                            {report?.saved_at
                                                                ? new Date(report.saved_at).toLocaleDateString('en-IN')
                                                                : 'Recently'}
                                                        </div>
                                                    </div>
                                                    <div
                                                        className={`text-xs font-semibold ${report?.spread_risk === 'High' ? 'text-red-700' : 'text-amber-700'}`}
                                                    >
                                                        {report?.spread_risk || 'Medium'} risk
                                                    </div>
                                                </div>
                                            ))}

                                            <button
                                                type="button"
                                                onClick={() => navigate('/crop')}
                                                className="mt-1 text-sm font-semibold text-blue-700 hover:underline"
                                            >
                                                View all saved reports →
                                            </button>
                                        </div>
                                    )}

                                    {/* Stats Grid */}
                                    <div className="mt-2 grid grid-cols-2 gap-3 md:col-span-2">
                                        <div className="rounded-2xl bg-emerald-50 p-5 text-center shadow-sm">
                                            <div className="mb-2 text-3xl font-black tabular-nums text-emerald-800 md:text-4xl">{cropReportCount}</div>
                                            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700/80">Crop reports saved</div>
                                        </div>
                                        <div className="rounded-2xl bg-teal-50 p-5 text-center shadow-sm">
                                            <div className="mb-2 text-3xl font-black tabular-nums text-teal-900 md:text-4xl">{getProfileCompletion().percent}%</div>
                                            <div className="text-[11px] font-bold uppercase tracking-wider text-teal-800/80">Profile completion</div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            
                            {activeTab === 'activity' && (
                                <motion.div 
                                    key="activity"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="flex flex-col items-center justify-center py-12 text-center"
                                >
                                    <div className="text-4xl">🌱</div>
                                    <p className="mt-4 font-bold text-slate-900">Your farm journey begins!</p>
                                    <p className="text-sm text-slate-400">Complete tasks and hire workers to see your activity here.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer / Logout */}
                    <div className="border-t border-slate-100 p-8 md:p-10">
                        <button 
                            onClick={logout}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50/30 px-6 py-4 text-sm font-black uppercase tracking-widest text-red-500 transition-all hover:bg-red-50"
                        >
                            <span aria-hidden>🚪</span> Sign out
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
