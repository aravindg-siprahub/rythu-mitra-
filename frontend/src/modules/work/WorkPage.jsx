import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../utils/supabaseClient';
import { getFarmerCity } from '../../utils/locationService';

// ── Haversine distance helper ──────────────────────────────────────────────
const haversineDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

// ── Auto-title generator ───────────────────────────────────────────────────
const generateJobTitle = (wType, crop, workers, location, date) => {
  const workerText = parseInt(workers) > 1 ? `${workers} workers` : '1 worker';
  const dateStr = date
    ? new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : '';
  const parts = [crop, wType, '—', workerText, 'needed'];
  if (location) parts.push('·', location);
  if (dateStr) parts.push('·', dateStr);
  return parts.join(' ').replace(/\s+/g, ' ').trim();
};

const API_BASE = '/api/v1/work';

const getSafeName = (name, isSelected) => {
  if (!name) return 'Farmer';
  if (name.includes('@')) return 'Farmer'; // Privacy: Never show email
  if (isSelected) return name;
  return name.split(' ')[0];
};

// =============================================================================
//  WORK MODULE — UNIFIED EXPERIENCE
// =============================================================================

export default function WorkPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState(localStorage.getItem('rm_role'));
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [needsRegistration, setNeedsRegistration] = useState(false);

    useEffect(() => {
        const handleForceEdit = () => setNeedsRegistration(true);
        window.addEventListener('editSupplierProfile', handleForceEdit);
        return () => window.removeEventListener('editSupplierProfile', handleForceEdit);
    }, []);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('rythu_user') || localStorage.getItem('user') || 'null');
    if (storedUser) {
      console.log('WorkPage: Loaded user from storage:', storedUser);
      setUser(storedUser);
    } else {
      navigate('/login');
      return;
    }

    const checkRoleAndRegistration = async () => {
      // 1. Check profiles table for role
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_role')
        .eq('id', storedUser.id)
        .single();

      if (profile?.user_role) {
        setRole(profile.user_role);
        localStorage.setItem('rm_role', profile.user_role);

        // 2. If supplier, check if they need registration
        if (profile.user_role === 'supplier') {
          const { data: supplierProfile } = await supabase
            .from('supplier_profiles')
            .select('id')
            .eq('user_id', storedUser.id)
            .single();

          if (!supplierProfile) {
            setNeedsRegistration(true);
          }
        }
      } else {
        // Fall back to stored role from localStorage if profile row is missing user_role
        const storedRole = localStorage.getItem('rm_role') || 'farmer';
        setRole(storedRole);
      }
      setLoading(false);
    };

    checkRoleAndRegistration();
  }, [navigate]);

  if (loading) return <LoadingSpinner />;

  if (role === 'supplier' && needsRegistration) {
    return <SupplierRegistrationForm user={user} onComplete={() => setNeedsRegistration(false)} />;
  }

  return (
    <div className="min-h-screen pb-20 relative overflow-hidden" 
      style={{
        background: 'radial-gradient(circle at top right, #F0FDF4 0%, #F8FAFC 40%)'
      }}>
      {/* Premium background mesh or subtle ornament could go here */}
      {role === 'farmer' ? <FarmerView user={user} /> : <SupplierView user={user} />}
    </div>
  );
}

// ─── COMPONENTS ─────────────────────────────────────────────────────────────

function LoadingSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-[100]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
        <p className="text-green-800 font-bold">Loading...</p>
      </div>
    </div>
  );
}

// ─── FARMER VIEW ────────────────────────────────────────────────────────────

function FarmerView({ user }) {
  const [activeTab, setActiveTab] = useState('post');

  return (
    <div>
      <div className="sticky top-0 bg-white/80 backdrop-blur-md shadow-sm z-30 p-3">
        <div className="max-w-md mx-auto bg-gray-100 p-1 rounded-xl flex relative">
          {/* Sliding indicator */}
          <motion.div
            layoutId="activeTab"
            className="absolute inset-y-1 bg-white rounded-lg shadow-sm z-0"
            style={{ width: 'calc(50% - 4px)' }}
            animate={{ x: activeTab === 'post' ? 0 : '100%' }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
          />
          <button 
            onClick={() => setActiveTab('post')}
            className={`flex-1 py-2.5 text-center font-bold text-sm z-10 transition-colors ${activeTab === 'post' ? 'text-green-700' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Need Workers
          </button>
          <button 
            onClick={() => setActiveTab('my_posts')}
            className={`flex-1 py-2.5 text-center font-bold text-sm z-10 transition-colors ${activeTab === 'my_posts' ? 'text-green-700' : 'text-gray-500 hover:text-gray-700'}`}
          >
            My Posts
          </button>
        </div>
      </div>

      <div className="p-4">
        {activeTab === 'post' ? <PostJobForm user={user} onDone={() => setActiveTab('my_posts')} /> : <MyPosts farmerId={user?.id} user={user} />}
      </div>
    </div>
  );
}

const JOB_CATEGORIES = [
  {
    id: 'worker',
    label: 'Farm Worker',
    emoji: '👨\u200d🌾',
    color: '#166534',
    bg: '#f0fdf4',
    border: '#86efac',
    description: 'Hire daily wage workers for harvesting, planting, weeding and general farm tasks.',
    typical_rate: '₹400–700/day',
    typical_need: '1–20 workers',
    popular_for: ['Harvesting', 'Planting', 'Weeding', 'Spraying'],
  },
  {
    id: 'transport',
    label: 'Transport / Vehicle',
    emoji: '🚛',
    color: '#1d4ed8',
    bg: '#eff6ff',
    border: '#bfdbfe',
    description: 'Hire lorries, tractors, and transport vehicles for carrying produce to mandi or materials to farm.',
    typical_rate: '₹800–2000/trip',
    typical_need: '1–3 vehicles',
    popular_for: ['Lorry to mandi', 'Tractor ploughing', 'Sand/gravel transport', 'Produce delivery'],
  },
  {
    id: 'sprayer',
    label: 'Sprayer / Equipment',
    emoji: '🔧',
    color: '#92400e',
    bg: '#fffbeb',
    border: '#fcd34d',
    description: 'Hire sprayer machines, pump sets, and farm equipment operators for pesticide and irrigation work.',
    typical_rate: '₹300–600/day',
    typical_need: '1–2 units',
    popular_for: ['Pesticide spraying', 'Pump set rental', 'Power tiller', 'Harvester machine'],
  },
  {
    id: 'equipment',
    label: 'Heavy Equipment',
    emoji: '🏗️',
    color: '#6b21a8',
    bg: '#f5f3ff',
    border: '#c4b5fd',
    description: 'Hire JCB, excavators, levelling machines and heavy equipment for land preparation and construction.',
    typical_rate: '₹1500–4000/day',
    typical_need: '1 unit',
    popular_for: ['JCB / excavator', 'Land levelling', 'Borewell drilling', 'Farm pond digging'],
  },
];

const WORK_TYPES_BY_CATEGORY = {
  worker:    ['Harvesting', 'Planting', 'Spraying', 'Weeding', 'Loading', 'Other'],
  transport: ['Lorry to mandi', 'Tractor ploughing', 'Produce delivery', 'Sand transport', 'Other'],
  sprayer:   ['Pesticide spraying', 'Pump set rental', 'Power tiller', 'Drone spraying', 'Other'],
  equipment: ['JCB / Excavator', 'Land levelling', 'Borewell drilling', 'Farm pond', 'Other'],
};

const DISTRICTS = ['Annamayya (Madanapalle)', 'Chittoor', 'Tirupati', 'Anantapur', 'Kadapa', 'SPSR Nellore'];
const SKILLS = ['Harvesting', 'Ploughing', 'Seeding', 'Pesticide Spray', 'General Labor'];

function PostJobForm({ user, onDone }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', scheduled_date: '', duration: 'full_day',
    urgency: 'normal', service_type: 'worker', units: 1,
    pay_amount: '', pay_unit: 'day', location: getFarmerCity() || ''
  });
  // Structured fields
  const [workType, setWorkType] = useState('Harvesting');
  const [cropType, setCropType] = useState('Rice (Paddy)');
  const [jobDuration, setJobDuration] = useState('1 day');
  const [submitting, setSubmitting] = useState(false);
  const [error, setFormError] = useState('');
  const [success, setSuccess] = useState(false);

  // When category changes, reset work type to first option of new category
  const handleSelectCategory = (cat) => {
    if (selectedCategory?.id === cat.id) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(cat);
      setFormData(prev => ({ ...prev, service_type: cat.id }));
      const types = WORK_TYPES_BY_CATEGORY[cat.id] || WORK_TYPES_BY_CATEGORY.worker;
      setWorkType(types[0]);
    }
  };

  const currentWorkTypes = WORK_TYPES_BY_CATEGORY[selectedCategory?.id] || WORK_TYPES_BY_CATEGORY.worker;

  // Defensive user detection
  const uid = user?.id || user?.user_id || user?.uid;
  const uname = user?.full_name || user?.profile?.full_name || 'Farmer';
  const uphone = user?.phone || user?.profile?.phone || '9999999999';
  const udist = user?.district || user?.profile?.district || 'Annamayya';

  // Fix 3 — Auto-fill location from farmer profile
  const farmerLocation = user?.profile?.location || user?.profile?.village || '';
  useEffect(() => {
    if (farmerLocation) {
      setFormData(prev => ({ ...prev, location: farmerLocation }));
    }
  }, [farmerLocation]);

  const handleSubmit = async () => {
    setFormError('');
    if (!formData.scheduled_date) {
      setFormError('Please select a date for the work.');
      return;
    }

    if (!uid) {
      setFormError('User session expired. Please refresh or login again.');
      return;
    }

    // Fix 1a — Add pay_rate validation
    if (formData.pay_amount && formData.pay_amount > 9999 && formData.pay_unit === 'day') {
      setFormError('Pay rate cannot exceed ₹9,999 per day. For higher amounts, select "fixed total".');
      return;
    }

    setSubmitting(true);
    let response = null;
    try {
      // Phase 3 — get GPS coords from localStorage
      let gpsLat = null;
      let gpsLng = null;
      try {
        const raw = localStorage.getItem('rm_farmer_location');
        if (raw) { const g = JSON.parse(raw); gpsLat = g.lat || null; gpsLng = g.lon || null; }
      } catch (_) {}

      const autoTitle = generateJobTitle(
        workType,
        cropType,
        formData.units,
        formData.location || getFarmerCity() || 'your area',
        formData.scheduled_date
      );
      const finalTitle = formData.title && formData.title.trim()
        ? formData.title.trim()
        : autoTitle;

      const payload = {
        ...formData,
        title: finalTitle,
        farmer_id: uid,
        farmer_name: uname,
        farmer_phone: uphone,
        farmer_district: udist,
        daily_rate: formData.pay_amount ? parseInt(formData.pay_amount) : null,
        pay_unit: formData.pay_unit,
        // Phase 3 structured fields
        work_type: workType,
        crop: cropType,
        auto_title: autoTitle,
        lat: gpsLat,
        lng: gpsLng,
      };

      // Map units to the correct needed field for backend
      const count = parseInt(formData.units) || 1;
      if (formData.service_type === 'worker') payload.workers_needed = count;
      if (formData.service_type === 'tractor') payload.tractors_needed = count;
      if (formData.service_type === 'transport') payload.transport_needed = count;
      if (formData.service_type === 'sprayer') payload.sprayers_needed = count;

      console.log('Posting job with payload:', payload);

      response = await fetch(`${API_BASE}/create/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      // Fix 2b — Safe parse — handle both JSON and non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server error (Non-JSON). Please try again.');
      }

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        throw new Error(data.error || 'Failed to post job.');
      }
    } catch (e) { 
      console.error('Submit Error:', e);
      // Fix 2c — Fix error message shown to farmer
      if (e.message.includes('constraint')) {
        setFormError('Job could not be posted. Check your entered values.');
      } else if (response?.status === 500) {
        setFormError('Server error. Please try again in a moment.');
      } else if (!navigator.onLine) {
        setFormError('No internet connection. Please check your network.');
      } else {
        setFormError(e.message || 'Could not post job. Try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (success) return (
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#E8F5E9] p-8 rounded-2xl text-center shadow-lg border-2 border-green-200">
      <div className="text-6xl mb-4">🚀</div>
      <h2 className="text-2xl font-bold text-green-900 mb-2">Job Posted!</h2>
      <p className="text-green-700 mb-6">Notification sent to workers locally.</p>
      <button onClick={onDone} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-md shadow-green-200">
        View My Posts →
      </button>
    </motion.div>
  );

  return (
    <div className="max-w-md mx-auto">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Category + Form ── */}
      <div style={{ padding: '0 0 24px' }}>

        {/* Page header */}
        <div style={{ padding: '16px 16px 12px', textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 500, color: '#111827', marginBottom: 4 }}>
            What do you need?
          </div>
          <div style={{ fontSize: 13, color: '#6B7280' }}>
            Select a category to post your requirement
          </div>
        </div>

        {/* Two-column layout */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

          {/* LEFT — Category selector */}
          <div style={{ padding: '0 16px' }}>

            {/* 2×2 grid of category cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {JOB_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat)}
                  style={{
                    background: selectedCategory?.id === cat.id ? cat.bg : '#fff',
                    border: `${selectedCategory?.id === cat.id ? '2px' : '0.5px'} solid ${
                      selectedCategory?.id === cat.id ? cat.border : '#E5E7EB'}`,
                    borderRadius: 14,
                    padding: '16px 12px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                    transform: selectedCategory?.id === cat.id ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{cat.emoji}</div>
                  <div style={{
                    fontSize: 13, fontWeight: 600,
                    color: selectedCategory?.id === cat.id ? cat.color : '#111827',
                    marginBottom: 4, lineHeight: 1.3
                  }}>{cat.label}</div>
                  <div style={{
                    fontSize: 11,
                    color: selectedCategory?.id === cat.id ? cat.color : '#6B7280',
                    lineHeight: 1.4
                  }}>{cat.typical_rate}</div>
                </button>
              ))}
            </div>

            {/* Info panel — shows when category selected */}
            {selectedCategory && (
              <div style={{
                background: selectedCategory.bg,
                border: `0.5px solid ${selectedCategory.border}`,
                borderRadius: 14, padding: '16px', marginBottom: 16,
                animation: 'fadeIn 0.2s ease'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 24 }}>{selectedCategory.emoji}</span>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: selectedCategory.color }}>
                      {selectedCategory.label}
                    </div>
                    <div style={{ fontSize: 11, color: selectedCategory.color, opacity: 0.8 }}>
                      Typical: {selectedCategory.typical_rate} · {selectedCategory.typical_need}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, marginBottom: 12 }}>
                  {selectedCategory.description}
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', letterSpacing: '0.04em', marginBottom: 8 }}>POPULAR FOR</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {selectedCategory.popular_for.map(item => (
                    <span key={item} style={{
                      background: '#fff',
                      border: `0.5px solid ${selectedCategory.border}`,
                      color: selectedCategory.color,
                      borderRadius: 20, padding: '4px 10px',
                      fontSize: 12, fontWeight: 500
                    }}>{item}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT / BOTTOM — Booking form */}
          {selectedCategory ? (
            <div style={{ padding: '0 16px', animation: 'slideUp 0.25s ease' }}>

              {/* Form header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 500, color: '#111827' }}>Post your requirement</div>
                  <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                    {selectedCategory.emoji} {selectedCategory.label}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCategory(null)}
                  style={{
                    background: '#F9FAFB', border: '0.5px solid #E5E7EB',
                    borderRadius: 20, padding: '4px 12px', fontSize: 12,
                    cursor: 'pointer', color: '#6B7280'
                  }}
                >✕ Cancel</button>
              </div>

              {/* Typical rate banner */}
              <div style={{
                background: '#F9FAFB', borderRadius: 8, padding: '8px 12px',
                marginBottom: 16, fontSize: 12, color: '#6B7280',
                display: 'flex', alignItems: 'center', gap: 6
              }}>
                💡 Typical rate for <strong style={{ fontWeight: 500, color: '#111827' }}>{selectedCategory.label}</strong> in your area:&nbsp;
                <strong style={{ fontWeight: 600, color: selectedCategory.color }}>{selectedCategory.typical_rate}</strong>
              </div>

              {/* ── EXISTING FORM ── */}
              <div className="space-y-4">

          {/* ── Structured fields ── */}
          <div style={{ marginBottom: 4 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', letterSpacing: '0.05em', marginBottom: 6 }}>WORK TYPE</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              {currentWorkTypes.map(type => (
                <button key={type} type="button" onClick={() => setWorkType(type)}
                  style={{
                    padding: '6px 14px', borderRadius: 20, fontSize: 12,
                    fontWeight: workType === type ? 600 : 400,
                    background: workType === type ? '#166534' : '#F9FAFB',
                    color: workType === type ? '#fff' : '#6B7280',
                    border: workType === type ? 'none' : '0.5px solid #E5E7EB',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}>{type}</button>
              ))}
            </div>

            <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', letterSpacing: '0.05em', marginBottom: 6 }}>CROP (optional)</div>
            <select value={cropType} onChange={e => setCropType(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8,
                border: '0.5px solid #E5E7EB', background: '#fff', color: '#111827',
                fontSize: 13, marginBottom: 12, cursor: 'pointer' }}>
              {['Rice (Paddy)', 'Wheat', 'Maize', 'Groundnut', 'Tomato', 'Onion',
                'Cotton', 'Sugarcane', 'Soybean', 'Turmeric', 'Chilli', 'Banana',
                'Mango', 'Vegetables', 'Other'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', letterSpacing: '0.05em', marginBottom: 6 }}>DURATION</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              {['1 day', '2–3 days', '1 week', 'Full season'].map(d => (
                <button key={d} type="button" onClick={() => setJobDuration(d)}
                  style={{
                    padding: '6px 14px', borderRadius: 20, fontSize: 12,
                    fontWeight: jobDuration === d ? 600 : 400,
                    background: jobDuration === d ? '#1d4ed8' : '#F9FAFB',
                    color: jobDuration === d ? '#fff' : '#6B7280',
                    border: jobDuration === d ? 'none' : '0.5px solid #E5E7EB',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}>{d}</button>
              ))}
            </div>

            {/* Auto-generated title preview */}
            <div style={{ background: '#f0fdf4', border: '0.5px solid #86efac', borderRadius: 8, padding: '8px 12px', marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: '#166534', marginBottom: 3, fontWeight: 500 }}>📋 Auto-generated title:</div>
              <div style={{ fontSize: 13, color: '#166534', fontWeight: 500 }}>
                {generateJobTitle(workType, cropType, formData.units || 1,
                  formData.location || getFarmerCity() || 'your area', formData.scheduled_date || '')}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const auto = generateJobTitle(
                  workType,
                  cropType,
                  formData.units || 1,
                  formData.location || getFarmerCity() || 'your area',
                  formData.scheduled_date || ''
                );
                setFormData(prev => ({ ...prev, title: auto }));
              }}
              style={{
                fontSize: 11,
                color: '#166534',
                fontWeight: 500,
                textDecoration: 'underline',
                background: 'transparent',
                border: 'none',
                padding: 0,
                marginBottom: 8,
                cursor: 'pointer'
              }}
            >
              Use this title
            </button>
          </div>

          <input
            type="text" placeholder="Custom title (optional — leave blank for auto)"
            className="w-full h-14 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none text-slate-900 font-medium"
            value={formData.title}
            onChange={e => setFormData(prev => ({...prev, title: e.target.value}))}
          />
          <textarea
            placeholder="Details (Optional)"
            className="w-full h-24 p-4 rounded-xl border border-gray-200 outline-none text-slate-900 font-medium"
            value={formData.description}
            onChange={e => setFormData(prev => ({...prev, description: e.target.value}))}
          />
          <input
            type="date"
            className="w-full h-14 px-4 rounded-xl border border-gray-200 outline-none text-slate-900"
            value={formData.scheduled_date}
            onChange={e => setFormData(prev => ({...prev, scheduled_date: e.target.value}))}
          />

          {/* Fix 3 — Location field with auto-fill */}
          <div>
            <input
              type="text" placeholder="Village / Location"
              className="w-full h-14 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none text-slate-900 font-medium"
              value={formData.location}
              onChange={e => setFormData(prev => ({...prev, location: e.target.value}))}
            />
            {farmerLocation && formData.location === farmerLocation && (
              <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4, paddingLeft: 4 }}>(from your profile)</p>
            )}
          </div>

          <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-gray-100">
            <label className="pl-3 text-sm font-bold text-gray-400 whitespace-nowrap">How many?</label>
            <input
              type="number" min="1"
              className="w-full h-12 bg-gray-50 rounded-lg px-4 font-bold text-green-700 outline-none"
              value={formData.units}
              onChange={e => setFormData(prev => ({...prev, units: e.target.value}))}
            />
          </div>

          {/* Fix 2 — Pay rate field */}
          <div>
            <label style={{ fontSize: 12, color: '#6B7280', display: 'block', marginBottom: 6, fontWeight: 500 }}>Pay Rate</label>
            <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3" style={{ height: 52 }}>
              <span style={{ fontSize: 13, color: '#9CA3AF', flexShrink: 0 }}>₹</span>
              <input
                type="number" min="0" placeholder="e.g. 500"
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, color: '#111827', background: 'transparent', fontWeight: 500 }}
                value={formData.pay_amount}
                onChange={e => setFormData(prev => ({...prev, pay_amount: e.target.value}))}
              />
              <select
                style={{ border: 'none', outline: 'none', fontSize: 13, color: '#6B7280', background: 'transparent', cursor: 'pointer' }}
                value={formData.pay_unit}
                onChange={e => setFormData(prev => ({...prev, pay_unit: e.target.value}))}
              >
                <option value="day">/day</option>
                <option value="hour">/hour</option>
                <option value="fixed">fixed total</option>
              </select>
            </div>
            <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4, paddingLeft: 4, fontStyle: 'italic' }}>Leave blank to show as Negotiable</p>
          </div>

          <div className="flex gap-2">
            {['half_day', 'full_day', 'many_days'].map(d => (
              <button key={d} type="button" onClick={() => setFormData(prev => ({...prev, duration: d}))}
                className={`flex-1 py-3 rounded-xl border font-bold transition-all ${formData.duration === d ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-500 border-gray-200'}`}>
                {d === 'half_day' ? 'Half Day' : d === 'full_day' ? 'Full Day' : 'Many Days'}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {['urgent', 'normal', 'flexible'].map(u => (
              <button key={u} type="button" onClick={() => setFormData(prev => ({...prev, urgency: u}))}
                className={`flex-1 py-3 rounded-xl border font-bold transition-all ${formData.urgency === u ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-500 border-gray-200'}`}>
                {u === 'urgent' ? '🔴 Urgent' : u === 'normal' ? '🟡 Normal' : '🟢 Flexible'}
              </button>
            ))}
          </div>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold text-center">
              ⚠️ {error}
            </div>
          )}

              <button
                disabled={submitting}
                onClick={handleSubmit}
                className={`w-full h-16 rounded-2xl font-black text-xl mt-4 flex items-center justify-center gap-2 transition-all ${submitting ? 'bg-gray-400' : 'bg-green-600 text-white shadow-xl shadow-green-100 active:scale-95'}`}>
                {submitting ? 'Posting...' : 'Post Now 🚀'}
              </button>

              </div>
            </div>
          ) : (
            /* Empty state when no category selected */
            <div style={{ padding: '24px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>☝️</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#6B7280', marginBottom: 6 }}>
                Select a category above
              </div>
              <div style={{ fontSize: 12, color: '#9CA3AF', lineHeight: 1.6 }}>
                Choose what you need and the posting form will appear
              </div>
            </div>
          )}

        </div>{/* end two-column layout */}
      </div>{/* end outer wrapper */}
    </div>
  );
}

function MyPosts({ farmerId, user }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingApplicants, setViewingApplicants] = useState(null);
  // Phase 7 — mark complete state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [completingJob, setCompletingJob] = useState(null);
  const [completionRating, setCompletionRating] = useState(5);
  const [completionComment, setCompletionComment] = useState('');
  const [completingSaving, setCompletingSaving] = useState(false);

  const fetchPosts = () => {
    fetch(`${API_BASE}/farmer/${farmerId}/posts/`)
      .then(res => res.json())
      .then(data => { setPosts(data.posts || []); setLoading(false); });
  };

  useEffect(() => { fetchPosts(); }, [farmerId]);

  const handleToggleStatus = (jobId, newStatus) => {
    setPosts(prev => prev.map(p => p.id === jobId ? { ...p, status: newStatus } : p));
  };

  const handleMarkComplete = async () => {
    if (!completingJob) return;
    setCompletingSaving(true);
    try {
      await supabase.from('job_posts').update({
        is_completed: true, completed_at: new Date().toISOString()
      }).eq('id', completingJob.id);

      // Update all hired applications
      const { data: hiredApps } = await supabase
        .from('job_applications')
        .select('id, supplier_id, supplier_name')
        .eq('job_post_id', completingJob.id)
        .eq('status', 'hired');

      if (hiredApps && hiredApps.length > 0) {
        await supabase.from('job_applications').update({
          is_completed: true, completed_at: new Date().toISOString(),
          rating: completionRating, rating_comment: completionComment
        }).eq('job_post_id', completingJob.id).eq('status', 'hired');

        const totalAmount = (completingJob.daily_rate || 0) * (completingJob.workers_needed || 1);
        const wageRows = hiredApps.map(a => ({
          job_id: completingJob.id,
          farmer_id: farmerId,
          worker_id: a.supplier_id,
          worker_name: a.supplier_name,
          amount_per_day: completingJob.daily_rate || 0,
          workers_count: completingJob.workers_needed || 1,
          total_amount: totalAmount,
          is_paid: false,
        }));
        await supabase.from('wage_records').insert(wageRows);
      }

      setPosts(prev => prev.map(p => p.id === completingJob.id ? { ...p, is_completed: true } : p));
      setShowRatingModal(false);
      setCompletingJob(null);
      alert('✅ Job marked complete! Wage record saved.');
    } catch (e) {
      console.error('Mark complete failed:', e);
      alert('Failed to mark complete. Please try again.');
    } finally {
      setCompletingSaving(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Loading your posts...</div>;

  return (
    <div className="space-y-4">
      {posts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-slate-400 font-bold">You haven't posted any jobs yet.</p>
        </div>
      ) : (
        posts.map(p => (
          <JobCard
            key={p.id}
            job={p}
            isFarmer
            user={user}
            onViewApplicants={() => setViewingApplicants(p)}
            onToggleStatus={handleToggleStatus}
            onMarkComplete={job => { setCompletingJob(job); setShowRatingModal(true); }}
          />
        ))
      )}

      {viewingApplicants && (
        <ApplicantsModal
          job={viewingApplicants}
          onClose={() => setViewingApplicants(null)}
          farmerId={farmerId}
        />
      )}

      {/* Phase 7 — Rating / Complete Modal */}
      {showRatingModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 16
        }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 380 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 6 }}>Mark Job Complete</div>
            <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>Rate the worker(s) performance</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, justifyContent: 'center' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} onClick={() => setCompletionRating(star)}
                  style={{ background: 'none', border: 'none', fontSize: 28, cursor: 'pointer', opacity: star <= completionRating ? 1 : 0.3, transition: 'opacity 0.15s' }}>⭐</button>
              ))}
            </div>
            <textarea placeholder="Any comments? (optional)" value={completionComment}
              onChange={e => setCompletionComment(e.target.value)} rows={3}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: 13,
                border: '0.5px solid #E5E7EB', background: '#F9FAFB', color: '#111827',
                resize: 'none', marginBottom: 14, boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowRatingModal(false)}
                style={{ flex: 1, background: 'transparent', border: '0.5px solid #E5E7EB', borderRadius: 8, padding: '10px', fontSize: 13, cursor: 'pointer', color: '#111827' }}>Cancel</button>
              <button onClick={handleMarkComplete} disabled={completingSaving}
                style={{ flex: 2, background: '#166534', color: '#fff', border: 'none', borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                {completingSaving ? 'Saving...' : '✓ Confirm Complete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ApplicantsModal({ job, onClose, farmerId }) {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplicantsWithProfiles = async (jobId) => {
    setLoading(true);
    try {
      const { data: apps } = await supabase
        .from('job_applications')
        .select('*')
        .eq('job_post_id', jobId)
        .order('created_at', { ascending: false });

      if (!apps?.length) { setApplicants([]); setLoading(false); return; }

      const workerIds = apps.map(a => a.supplier_id).filter(Boolean);
      const { data: profiles } = await supabase
        .from('supplier_profiles')
        .select('id, full_name, phone, rating, location, completed_jobs')
        .in('id', workerIds);

      const merged = apps.map(app => ({
        ...app,
        profile: profiles?.find(p => p.id === app.supplier_id) || null
      }));
      setApplicants(merged);
    } catch (e) {
      console.error('Failed to fetch applicants:', e);
      setApplicants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicantsWithProfiles(job.id);
  }, [job.id]);

  const handleApplicantAction = async (applicationId, action) => {
    const newStatus = action === 'select' ? 'hired'
                    : action === 'reject' ? 'rejected'
                    : 'applied'; // undo → back to applied
    try {
      const res = await fetch(`${API_BASE}/application/${applicationId}/status/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmer_id: farmerId, status: newStatus })
      });
      if (res.ok) {
        setApplicants(prev => prev.map(a =>
          a.id === applicationId ? { ...a, status: newStatus } : a
        ));
      }
    } catch (e) {
      console.error('Status update failed:', e);
      alert('Failed to update. Please try again.');
    }
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'flex-end',
        justifyContent: 'center', zIndex: 1000
      }}
    >
      <div style={{
        background: '#fff',
        borderRadius: '20px 20px 0 0',
        width: '100%', maxWidth: 520,
        maxHeight: '85vh', overflow: 'hidden',
        display: 'flex', flexDirection: 'column'
      }}>

        {/* Modal header */}
        <div style={{
          padding: '16px 20px 12px',
          borderBottom: '0.5px solid #F3F4F6',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>👥 Applicants</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
              {job.auto_title || job.title || 'Job posting'}{' · '}
              {applicants.length} applicant{applicants.length !== 1 ? 's' : ''}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#F3F4F6', border: 'none', borderRadius: '50%',
              width: 32, height: 32, fontSize: 16, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#6B7280'
            }}
          >✕</button>
        </div>

        {/* Content */}
        <div style={{ overflowY: 'auto', padding: '12px 16px', flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <div className="h-8 w-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" />
              <div style={{ fontSize: 13, color: '#9CA3AF' }}>Loading applicants...</div>
            </div>
          ) : applicants.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
              <div style={{ fontSize: 14, color: '#6B7280' }}>No applications yet</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>Share your job post to get more visibility</div>
            </div>
          ) : (
            applicants.map((app) => {
              const profile = app.profile;
              const isHired    = (app.status || '').toLowerCase() === 'hired' || (app.status || '').toLowerCase() === 'selected';
              const isRejected = (app.status || '').toLowerCase() === 'rejected';
              const isPending  = !isHired && !isRejected;
              const completedJobs = profile?.completed_jobs || 0;
              const workerName = profile?.full_name || app.supplier_name || 'Worker';

              return (
                <div
                  key={app.id}
                  style={{
                    background: isHired ? '#f0fdf4' : isRejected ? '#fef2f2' : '#F9FAFB',
                    border: `0.5px solid ${isHired ? '#86efac' : isRejected ? '#fca5a5' : '#E5E7EB'}`,
                    borderRadius: 12, padding: '14px', marginBottom: 10
                  }}
                >
                  {/* Top row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 42, height: 42, borderRadius: '50%',
                        background: isHired ? '#166534' : isRejected ? '#b91c1c' : '#1d4ed8',
                        color: '#fff', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: 16, fontWeight: 600, flexShrink: 0
                      }}>
                        {workerName[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{workerName}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
                          {profile?.rating ? (
                            <span style={{ fontSize: 12, color: '#92400e', background: '#fffbeb', padding: '2px 7px', borderRadius: 10, fontWeight: 500 }}>
                              ⭐ {profile.rating}
                            </span>
                          ) : null}
                          <span style={{
                            fontSize: 11,
                            background: completedJobs === 0 ? '#f3f4f6' : '#e0f2fe',
                            color: completedJobs === 0 ? '#6b7280' : '#0369a1',
                            padding: '2px 7px', borderRadius: 10, fontWeight: 500
                          }}>
                            {completedJobs === 0 ? '🆕 New worker' : `✅ ${completedJobs} jobs done`}
                          </span>
                          {profile?.location && (
                            <span style={{ fontSize: 11, color: '#9CA3AF' }}>📍 {profile.location}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20,
                      background: isHired ? '#166534' : isRejected ? '#b91c1c' : '#f3f4f6',
                      color: isHired ? '#fff' : isRejected ? '#fff' : '#6b7280'
                    }}>
                      {isHired ? '✓ Selected' : isRejected ? '✗ Rejected' : '⏳ Pending'}
                    </span>
                  </div>

                  {/* Applied date */}
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 12 }}>
                    Applied {app.created_at
                      ? new Date(app.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                      : 'recently'}
                  </div>

                  {/* Actions */}
                  {isPending ? (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => handleApplicantAction(app.id, 'select')}
                        style={{ flex: 2, background: '#166534', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 12px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                      >✓ Select this worker</button>
                      <button
                        onClick={() => handleApplicantAction(app.id, 'reject')}
                        style={{ flex: 1, background: 'transparent', border: '0.5px solid #fca5a5', borderRadius: 8, padding: '9px 12px', fontSize: 13, cursor: 'pointer', color: '#b91c1c' }}
                      >✗ Reject</button>
                    </div>
                  ) : isHired ? (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => { if (profile?.phone) window.location.href = `tel:${profile.phone}`; }}
                        style={{ flex: 1, background: '#166534', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 12px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
                      >📞 Call Worker</button>
                      <button
                        onClick={() => {
                          if (profile?.phone) {
                            const ph = profile.phone.replace(/\D/g, '');
                            const full = ph.startsWith('91') ? ph : `91${ph}`;
                            const title = job.auto_title || job.title || 'farm job';
                            const msg = encodeURIComponent(`Hi ${workerName}, I selected you for "${title}" on Rythu Mitra. Please confirm your availability.`);
                            window.open(`https://wa.me/${full}?text=${msg}`, '_blank');
                          }
                        }}
                        style={{ flex: 1, background: '#25D366', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 12px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
                      >💬 WhatsApp</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleApplicantAction(app.id, 'undo')}
                      style={{ background: 'transparent', border: '0.5px solid #E5E7EB', borderRadius: 8, padding: '7px 14px', fontSize: 12, cursor: 'pointer', color: '#6B7280', width: '100%' }}
                    >↩ Undo rejection</button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal footer */}
        {!loading && applicants.length > 0 && (
          <div style={{
            padding: '12px 16px',
            borderTop: '0.5px solid #F3F4F6',
            background: '#F9FAFB',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div style={{ fontSize: 12, color: '#6B7280' }}>
              {applicants.filter(a => ['hired','selected'].includes((a.status||'').toLowerCase())).length} selected ·{' '}
              {applicants.filter(a => !a.status || (a.status||'').toLowerCase() === 'applied').length} pending
            </div>
            <button
              onClick={onClose}
              style={{ background: 'transparent', border: '0.5px solid #E5E7EB', borderRadius: 8, padding: '7px 16px', fontSize: 13, cursor: 'pointer', color: '#111827' }}
            >Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

function JobCard({ job, isFarmer, user, onViewApplicants, onToggleStatus, onMarkComplete }) {
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);

  const isOpen = job.status === 'open';
  // Fix 1 — green left border for open, gray for closed
  const leftBorderColor = isOpen ? '#166534' : '#D1D5DB';

  const handleApply = async () => {
    if (!user) return;
    setApplying(true);
    try {
      const { data: profile } = await supabase
        .from('supplier_profiles')
        .select('id')
        .eq('user_id', user.id || user.user_id)
        .single();

      if (!profile) {
        alert('Please complete your worker profile first!');
        return;
      }

      const res = await fetch(`${API_BASE}/${job.id}/apply/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplier_profile_id: profile.id })
      });

      if (res.ok) {
        setApplied(true);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to apply');
      }
    } catch (e) {
      alert('Error applying to job');
    } finally {
      setApplying(false);
    }
  };

  // Fix 7 — close/reopen handler
  const handleToggleStatus = async () => {
    if (!onToggleStatus) return;
    setTogglingStatus(true);
    const newStatus = isOpen ? 'closed' : 'open';
    try {
      await fetch(`${API_BASE}/${job.id}/status/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      onToggleStatus(job.id, newStatus);
    } catch (e) {
      // Optimistic update even if API not yet wired
      onToggleStatus(job.id, newStatus);
    } finally {
      setTogglingStatus(false);
    }
  };

  // Farmer card
  if (isFarmer) {
    const appCount = job.job_applications_count || 0;
    const payDisplay = job.daily_rate
      ? `₹${job.daily_rate}/${job.pay_unit || 'day'}`
      : 'Negotiable';
    const typeIcon = getJobIcon ? getJobIcon(job.service_type) : '🌾';
    const displayTitle = job.auto_title || job.title || 'Farm job';
    const leftBar = job.is_completed ? '#9ca3af'
                  : job.status === 'closed' ? '#ef4444'
                  : appCount > 0 ? '#f59e0b'
                  : '#16a34a';

    const dateLabel = (() => {
      const d = job.scheduled_date || job.date_required;
      if (!d) return null;
      const dt = new Date(d);
      const isPast = dt < new Date();
      return { text: isPast ? 'Date passed' : dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), isPast };
    })();

    const handleShare = () => {
      const text = `🌾 Farm Job Available!\n${displayTitle}\n📍 ${job.farmer_district || job.location || ''}\n💰 ${payDisplay}\n👥 ${job.workers_needed || 1} needed\n\nApply on Rythu Mitra app`;
      if (navigator.share) { navigator.share({ title: 'Farm Job', text }); }
      else { navigator.clipboard.writeText(text).then(() => alert('Job details copied! Share on WhatsApp.')); }
    };

    return (
      <div style={{
        background: '#fff',
        borderRadius: 16,
        border: '0.5px solid #E5E7EB',
        borderLeft: `4px solid ${leftBar}`,
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        marginBottom: 12,
        transition: 'box-shadow 0.15s'
      }}>
        <div style={{ padding: '14px 16px' }}>
          {/* TOP ROW */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flex: 1, minWidth: 0 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 6, background: '#DCFCE7',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, flexShrink: 0
              }}>{typeIcon}</div>
              <div style={{ minWidth: 0 }}>
                <h4 style={{ fontSize: 14, fontWeight: 500, color: '#111827', margin: 0, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {displayTitle}
                </h4>
                {/* Phase 3 — work_type + crop badges */}
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 3 }}>
                  {job.work_type && <span style={{ fontSize: 10, background: '#e0f2fe', color: '#0369a1', borderRadius: 12, padding: '1px 7px', fontWeight: 500 }}>{job.work_type}</span>}
                  {job.crop && <span style={{ fontSize: 10, background: '#f0fdf4', color: '#166534', borderRadius: 12, padding: '1px 7px', fontWeight: 500 }}>{job.crop}</span>}
                </div>
                <p style={{ fontSize: 12, color: '#6B7280', margin: '2px 0 0' }}>{getSafeName(job.farmer_name, false)}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0, marginLeft: 8 }}>
              {job.urgency === 'urgent' && (
                <span style={{ background: '#FEE2E2', color: '#991B1B', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' }}>Urgent</span>
              )}
              <span style={{
                background: isOpen ? '#DCFCE7' : '#F3F4F6',
                color: isOpen ? '#166534' : '#6B7280',
                fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999, textTransform: 'uppercase'
              }}>{isOpen ? 'Open' : 'Closed'}</span>
            </div>
          </div>

          {/* DETAILS ROW — Fix 4 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: '#6B7280' }}>📅 {new Date(job.scheduled_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            <span style={{ fontSize: 12, color: '#6B7280' }}>📍 {job.farmer_district || job.location || '—'}</span>
            <span style={{ fontSize: 12, color: '#6B7280' }}>💰 {payDisplay}</span>
            <span style={{ fontSize: 12, color: '#6B7280' }}>👥 {job.workers_needed || job.units || 1} needed</span>
          </div>

          {/* STATS ROW */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F3F4F6', paddingTop: 8, marginTop: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#9CA3AF', flexWrap: 'wrap' }}>
              <span>👁 {job.views_count || job.view_count || 0} {(job.views_count || job.view_count || 0) === 1 ? 'view' : 'views'}</span>
              <span>·</span>
              <span style={{ color: appCount > 0 ? '#166534' : '#9CA3AF', fontWeight: appCount > 0 ? 600 : 400 }}>
                👥 {appCount} {appCount === 1 ? 'application' : 'applications'}
              </span>
              {dateLabel && (
                <>
                  <span>·</span>
                  <span style={{ color: dateLabel.isPast ? '#b91c1c' : '#9CA3AF' }}>📅 {dateLabel.text}</span>
                </>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Share button */}
              <button
                onClick={handleShare}
                style={{
                  background: '#25D366', color: '#fff',
                  border: 'none', borderRadius: 8,
                  padding: '4px 10px', fontSize: 11,
                  fontWeight: 500, cursor: 'pointer'
                }}
              >💬 Share</button>
              {/* Mark Complete button */}
              {job.is_completed ? (
                <span style={{ fontSize: 12, color: '#166534', fontWeight: 500 }}>✅ Completed</span>
              ) : (
                onMarkComplete && !isOpen && (
                  <button onClick={() => onMarkComplete(job)}
                    style={{ background: '#166534', color: '#fff', border: 'none', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 500, cursor: 'pointer' }}>
                    ✓ Mark Complete
                  </button>
                )
              )}
              {/* Fix 7 — Close / Reopen button */}
              <button
                onClick={handleToggleStatus}
                disabled={togglingStatus}
                style={{
                  fontSize: 11, fontWeight: 600, padding: '3px 10px',
                  borderRadius: 6, cursor: 'pointer',
                  background: 'transparent', transition: 'all 0.15s',
                  border: isOpen ? '1px solid #EF4444' : '1px solid #166534',
                  color: isOpen ? '#EF4444' : '#166534',
                }}>
                {togglingStatus ? '...' : isOpen ? 'Close Job' : 'Reopen'}
              </button>
              <button
                onClick={onViewApplicants}
                style={{ fontSize: 12, color: '#166534', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                View All ▼
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Worker (supplier) card — unchanged
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 mb-4 transition-all hover:shadow-md">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h4 className="text-lg font-bold text-gray-800 leading-tight">{job.title}</h4>
            <p className="text-xs text-green-600 font-bold mt-1 uppercase tracking-wider">{getSafeName(job.farmer_name, false)}</p>
          </div>
          <span className={`text-[10px] px-2 py-1 rounded-full font-black uppercase ${isOpen ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
            {job.status}
          </span>
        </div>

        {job.description && (
          <p className="text-sm text-slate-600 mb-4 line-clamp-2">{job.description}</p>
        )}

        <div className="flex flex-wrap gap-y-2 gap-x-4 mb-4">
          <div className="flex items-center gap-1.5 text-[13px] text-slate-500 font-medium">
            <span className="text-base">📅</span> {new Date(job.scheduled_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </div>
          <div className="flex items-center gap-1.5 text-[13px] text-slate-500 font-medium">
            <span className="text-base">📍</span> {job.farmer_district}
          </div>
          <div className="flex items-center gap-1.5 text-[13px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-md">
            #{job.service_type}
          </div>
        </div>

        <div className="border-t border-slate-50 pt-4">
          {applied ? (
            <div className="w-full bg-slate-50 text-slate-400 h-12 rounded-xl font-bold flex items-center justify-center gap-2 border border-slate-100">
              ✅ Application Sent
            </div>
          ) : (
            <button
              disabled={applying}
              onClick={handleApply}
              className="w-full bg-green-600 hover:bg-green-700 text-white h-12 rounded-xl font-black shadow-lg shadow-green-100 active:scale-95 transition-all flex items-center justify-center">
              {applying ? 'Sending...' : 'Apply Now ✓'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SUPPLIER VIEW ──────────────────────────────────────────────────────────

const JOB_ICONS = {
  worker: '👷', labour: '👷', tractor: '🚜',
  transport: '🚛', sprayer: '💧', equipment: '🔧',
};
const getJobIcon = (type) => JOB_ICONS[(type || '').toLowerCase()] || '🌾';

function SupplierView({ user }) {
  const [activeTab, setActiveTab] = useState('browse');
  const [posts, setPosts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [apps, setApps] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/feed/`)
      .then(res => res.json())
      .then(data => setPosts(data.posts || []));

    if (user) {
      supabase.from('supplier_profiles').select('*').eq('user_id', user.id || user.user_id).single()
        .then(({data}) => {
          if (data) {
             setProfile(data);
             fetch(`${API_BASE}/supplier/${data.id}/applications/`)
               .then(res => res.json())
               .then(appData => {
                 setApps(appData.applications || []);
                 setAppliedJobs((appData.applications || []).map(a => a.job_posts?.id || a.job_id));
               });
          }
        });
    }
  }, [user]);

  // Filters
  const [filterTypes, setFilterTypes] = useState([]);
  const [filterLocation, setFilterLocation] = useState('');
  const [nearMe, setNearMe] = useState(false);
  const [filterDate, setFilterDate] = useState('any');
  const [filterPay, setFilterPay] = useState('any');
  const [sortOrder, setSortOrder] = useState('Latest');

  const [selectedJob, setSelectedJob] = useState(null);
  const [farmerProfile, setFarmerProfile] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const fetchFarmerProfile = async (farmerId) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, name, phone, location, rating, created_at')
        .eq('id', farmerId)
        .single();
      setFarmerProfile(data);
    } catch (e) {
      console.error('Farmer profile fetch failed:', e);
      setFarmerProfile(null);
    }
  };

  // Notifications
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const newJobs = posts.filter(j => Date.now() - new Date(j.created_at).getTime() < 86400000);
  const notifications = newJobs.slice(0, 5);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const notifRef = React.useRef(null);
  React.useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
    };
    if (showNotifDropdown) document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showNotifDropdown]);

  // Phase 6 — Worker GPS location from localStorage
  const workerLocation = useMemo(() => {
    try {
      const raw = localStorage.getItem('rm_farmer_location');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return { lat: parsed.lat, lon: parsed.lon };
    } catch { return null; }
  }, []);

  const getApplicationStatus = (jobId) => {
    if (!jobId) return null; // Prevent matching on undefined IDs

    const application = apps.find(a => {
      const match = String(a.job_posts?.id) === String(jobId) ||
                    String(a.job_id) === String(jobId) ||
                    String(a.job_post_id) === String(jobId) ||
                    String(a.job?.id) === String(jobId);
      return match;
    });

    if (!application) return null;
    
    const status = (application.status || '').toLowerCase().trim();
    // Normalise any unexpected statuses (e.g. 'select', 'SELECTED') to standard formats
    return status;
  };

  const handleApply = (jobId) => {
    if (!appliedJobs.includes(jobId)) {
        setAppliedJobs(prev => [...prev, jobId]);
        const job = posts.find(p => p.id === jobId);
        if (job) {
            setApps(prev => [...prev, { id: Date.now(), job_posts: job, status: 'applied', created_at: new Date().toISOString() }]);
        }
    }
  };

  const clearFilters = () => {
    setFilterTypes([]);
    setFilterLocation('');
    setNearMe(false);
    setFilterDate('any');
    setFilterPay('any');
  };

  const filteredPosts = posts.filter(p => {
    if (filterTypes.length > 0 && filterTypes[0] !== 'all' && !filterTypes.includes(p.service_type)) return false;
    if (filterLocation) {
        if (!p.farmer_district.toLowerCase().includes(filterLocation.toLowerCase()) &&
            !(p.farmer_name && p.farmer_name.toLowerCase().includes(filterLocation.toLowerCase()))) {
            return false;
        }
    }
    if (filterDate === 'today') {
        const diff = new Date(p.scheduled_date) - new Date();
        if (diff > 86400000 || diff < 0) return false;
    } else if (filterDate === 'week') {
        const diff = new Date(p.scheduled_date) - new Date();
        if (diff > 7 * 86400000 || diff < 0) return false;
    } else if (filterDate === 'month') {
        const diff = new Date(p.scheduled_date) - new Date();
        if (diff > 30 * 86400000 || diff < 0) return false;
    }
    if (filterPay !== 'any') {
       const pay = p.daily_rate || 0;
       if (filterPay === '300-500' && (pay < 300 || pay > 500)) return false;
       if (filterPay === '500-800' && (pay < 500 || pay > 800)) return false;
       if (filterPay === '800+' && pay < 800) return false;
    }
    return true;
  }).sort((a, b) => {
      if (sortOrder === 'Latest') return new Date(b.created_at) - new Date(a.created_at);
      if (sortOrder === 'Pay: High to Low') return (b.daily_rate || 0) - (a.daily_rate || 0);
      if (sortOrder === 'Closest' && workerLocation) {
        const distA = haversineDistanceKm(workerLocation.lat, workerLocation.lon, a.lat, a.lng) ?? 9999;
        const distB = haversineDistanceKm(workerLocation.lat, workerLocation.lon, b.lat, b.lng) ?? 9999;
        return distA - distB;
      }
      return 0;
  });

  const getInitials = (name) => {
      if (!name) return 'W';
      return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="max-w-[1280px] mx-auto min-h-[calc(100vh-64px)] w-full flex flex-col md:flex-row bg-[#F8FAFC]">
      {/* LEFT SIDEBAR */}
      <div className={`fixed inset-0 z-50 bg-white p-4 overflow-y-auto md:static md:block md:w-[280px] md:flex-shrink-0 md:bg-transparent md:border-r border-gray-200 md:z-0 transition-transform ${showMobileFilters ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}`}>
         <div className="flex justify-between items-center md:hidden mb-4">
            <h2 className="text-lg font-bold">Filters</h2>
            <button onClick={() => setShowMobileFilters(false)} className="text-2xl">&times;</button>
         </div>

         {/* Worker Profile Card */}
         <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mb-6 hidden md:block">
            <div className="flex items-center gap-3 mb-3">
               <div className="w-11 h-11 rounded-full bg-[#166534] text-white flex items-center justify-center font-bold text-lg">
                  {getInitials(profile?.full_name || user?.full_name)}
               </div>
               <div>
                  <h3 className="text-[15px] font-medium text-gray-900 leading-tight">{profile?.full_name || user?.full_name || 'Worker Name'}</h3>
                  <p className="text-[12px] text-gray-500">{profile?.district || 'Location not set'}</p>
               </div>
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
               {(profile?.skills || ['Farm Labour']).map(s => (
                   <span key={s} className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full border border-gray-200">{s}</span>
               ))}
            </div>
            <div className="flex items-center gap-1 mb-1 mt-1">
               <span className="text-yellow-400 text-sm">★★★★★</span>
               <span className="text-[12px] text-gray-600">(4.8 · 23 reviews)</span>
            </div>
            <div className="text-[11px] text-gray-500 mb-4 border-b border-gray-100 pb-3 mt-1">
               Jobs applied: {appliedJobs.length} &nbsp;|&nbsp; Completed: {profile?.completed_jobs || 0}
            </div>
            <button className="w-full border border-gray-300 rounded-md py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => window.dispatchEvent(new CustomEvent('editSupplierProfile'))}>
               Edit Profile
            </button>
         </div>

         {/* Filters Section */}
         <div className="bg-white md:bg-transparent rounded-xl md:rounded-none border md:border-0 border-gray-200 p-4 md:p-0">
             <div className="flex justify-between items-center mb-4 mt-2">
                 <h4 className="text-[12px] font-medium text-gray-500 uppercase tracking-wider">Filter Jobs</h4>
                 <button onClick={clearFilters} className="text-[12px] text-[#166534] hover:underline">Clear all</button>
             </div>
             <div className="mb-5">
                 <label className="text-xs font-bold text-gray-700 block mb-2">Job Type</label>
                 <div className="flex flex-wrap gap-2">
                     {['all', 'worker', 'tractor', 'transport', 'sprayer', 'equipment'].map(type => (
                         <button key={type} onClick={() => setFilterTypes(type === 'all' ? [] : [type])}
                            className={`px-3 py-1 rounded-md text-[13px] border transition-colors ${(filterTypes.length === 0 && type === 'all') || filterTypes.includes(type) ? 'bg-[#166534] text-white border-[#166534]' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                         </button>
                     ))}
                 </div>
             </div>
             <div className="mb-5">
                 <label className="text-xs font-bold text-gray-700 block mb-2">Location</label>
                 <input type="text" placeholder="Search village or district..." value={filterLocation} onChange={e => setFilterLocation(e.target.value)}
                    className="w-full text-[13px] border border-[1.5px] border-gray-300 rounded-md py-2 px-3 mb-2 outline-none focus:border-[#166534] bg-white text-gray-900" style={{ boxShadow: 'none' }} />
                 <label className="flex items-center gap-2 cursor-pointer mt-2 w-max">
                    <input type="checkbox" checked={nearMe} onChange={e => setNearMe(e.target.checked)} className="accent-[#166534] w-4 h-4 cursor-pointer" />
                    <span className="text-[13px] text-gray-700">Near me</span>
                 </label>
             </div>
             <div className="mb-5">
                 <label className="text-xs font-bold text-gray-700 block mb-2">Date Required</label>
                 <div className="flex flex-wrap gap-2">
                     {['any', 'today', 'week', 'month'].map(d => (
                         <button key={d} onClick={() => setFilterDate(d)}
                            className={`px-3 py-1 rounded-md text-[13px] border transition-colors ${filterDate === d ? 'bg-[#166534] text-white border-[#166534]' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>
                            {d === 'any' ? 'Any date' : d === 'today' ? 'Today' : d === 'week' ? 'This week' : 'This month'}
                         </button>
                     ))}
                 </div>
             </div>
             <div className="mb-5">
                 <label className="text-xs font-bold text-gray-700 block mb-2">Pay Rate</label>
                 <div className="flex flex-wrap gap-2">
                     {['any', '300-500', '500-800', '800+'].map(p => (
                         <button key={p} onClick={() => setFilterPay(p)}
                            className={`px-3 py-1 rounded-md text-[13px] border transition-colors ${filterPay === p ? 'bg-[#166534] text-white border-[#166534]' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>
                            {p === 'any' ? 'Any' : p === '800+' ? '₹800+/day' : `₹${p}/day`}
                         </button>
                     ))}
                 </div>
             </div>
             <button onClick={() => setShowMobileFilters(false)} className="md:hidden w-full bg-[#166534] text-white py-3 rounded-lg font-bold mt-4">
                Show {filteredPosts.length} results
             </button>
         </div>
      </div>

      {/* CENTER FEED */}
      <div className="flex-1 flex flex-col max-w-full md:max-w-[600px] border-r border-gray-200 min-h-screen bg-white md:bg-transparent">
          <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
              <div className="flex items-center justify-between px-4">
                  <div className="flex">
                      <button onClick={() => { setActiveTab('browse'); setSelectedJob(null); }}
                          className={`py-4 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'browse' ? 'border-[#166534] text-[#166534]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                          Browse Jobs
                      </button>
                      <button onClick={() => { setActiveTab('my_apps'); setSelectedJob(null); }}
                          className={`py-4 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'my_apps' ? 'border-[#166534] text-[#166534]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                          My Applications <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-[10px]">{appliedJobs.length}</span>
                      </button>
                  </div>
                  <div className="relative flex items-center gap-3" ref={notifRef}>
                      <button onClick={() => setShowNotifDropdown(!showNotifDropdown)} className="relative p-2 text-gray-500 hover:text-gray-700 appearance-none bg-transparent border-none w-8">
                          <span className="text-lg leading-none">🔔</span>
                          {newJobs.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>}
                      </button>
                      {showNotifDropdown && (
                          <div className="absolute right-0 top-12 w-72 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                              <h5 className="px-4 py-2 text-xs font-bold text-gray-800 border-b border-gray-100">Notifications</h5>
                              {notifications.length > 0 ? notifications.map(n => (
                                  <div key={n.id} className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer" onClick={() => { setSelectedJob(n); setShowNotifDropdown(false); }}>
                                     <p className="text-[13px] text-gray-800 font-medium truncate">{n.title}</p>
                                     <p className="text-[11px] text-gray-500">New job in {n.farmer_district}</p>
                                  </div>
                              )) : (
                                  <div className="px-4 py-4 text-[13px] text-gray-500 text-center">No new notifications</div>
                              )}
                              <button className="w-full text-center py-2 text-[12px] text-[#166534] hover:bg-gray-50">Mark all as read</button>
                          </div>
                      )}
                  </div>
              </div>

              {activeTab === 'browse' && (
                  <div className="px-4 py-3 flex items-center justify-between bg-gray-50/50">
                      <div className="flex items-center gap-2">
                          <button onClick={() => setShowMobileFilters(true)} className="md:hidden text-gray-500 border border-gray-300 rounded px-2 py-1 text-xs">Filters</button>
                          <h2 className="text-[16px] font-medium text-gray-900 hidden md:block">Farm Jobs Near You</h2>
                      </div>
                      <div className="flex items-center gap-3">
                          <span className="text-[12px] text-gray-500 whitespace-nowrap">{filteredPosts.length} jobs</span>
                          <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}
                             className="text-[12px] bg-transparent border-none text-gray-600 font-medium outline-none cursor-pointer w-[120px] truncate text-right">
                              <option>Latest</option>
                              <option>Pay: High to Low</option>
                              <option>Closest</option>
                          </select>
                      </div>
                  </div>
              )}
          </div>

          {activeTab === 'browse' && newJobs.length > 0 && !bannerDismissed && (
             <div className="bg-amber-50 border-b border-amber-100 w-full px-4 py-2 flex items-center justify-between cursor-pointer" onClick={() => setBannerDismissed(true)}>
                 <span className="text-[13px] text-amber-800 font-medium">{newJobs.length} new jobs posted in your area — tap to refresh</span>
                 <button className="text-amber-600 hover:text-amber-800 text-lg">&times;</button>
             </div>
          )}

          <div className="p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto">
             {activeTab === 'browse' ? (
                 filteredPosts.length === 0 ? (
                     <div className="flex flex-col items-center justify-center py-20 text-center">
                         <div className="text-6xl mb-4">🌾</div>
                         <h3 className="text-[16px] font-medium text-gray-900 mb-1">No jobs found in this area</h3>
                         <p className="text-[13px] text-gray-500 mb-6 max-w-[250px]">Try removing some filters or check back tomorrow.</p>
                         <button onClick={clearFilters} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">Clear filters</button>
                     </div>
                 ) : (
                     <div className="flex flex-col gap-4">
                         {filteredPosts.map(job => (
                             <JobCardSupplier key={job.id} job={job} 
                                workerLocation={workerLocation}
                                isSelected={selectedJob?.id === job.id} 
                                onClick={() => {
                                  setSelectedJob(job);
                                  if (job.user_id || job.farmer_id) fetchFarmerProfile(job.user_id || job.farmer_id);
                                }}
                                isApplied={appliedJobs.includes(job.id)}
                                onApply={() => handleApply(job.id)} />
                         ))}
                     </div>
                 )
             ) : (
                 apps.length === 0 ? (
                     <div className="flex flex-col items-center justify-center py-20 text-center">
                         <div className="text-6xl mb-4">📝</div>
                         <h3 className="text-[16px] font-medium text-gray-900 mb-1">You haven't applied to any jobs yet</h3>
                         <p className="text-[13px] text-gray-500 mb-6">Browse jobs and tap Apply Now to get started.</p>
                         <button onClick={() => setActiveTab('browse')} className="bg-[#166534] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-green-800 shadow-sm">Browse Jobs</button>
                     </div>
                 ) : (
                     <div className="flex flex-col gap-4">
                         {apps.map(app => (
                             <AppliedJobCard key={app.id} app={app} onClick={() => {
                                 const jobData = { ...(app.job_posts || app.job || {}) };
                                 if (!jobData.id) jobData.id = app.job_id || app.job_post_id || app.jobposts_id;
                                 setSelectedJob(jobData);
                                 
                                 const fId = jobData.user_id || jobData.farmer_id || jobData.farmerId;
                                 if (fId) fetchFarmerProfile(fId);
                             }} />
                         ))}
                     </div>
                 )
             )}
          </div>
      </div>

      {/* RIGHT PANEL */}
      {(selectedJob && activeTab === 'browse') && (
          <div className="fixed inset-0 z-50 bg-white md:static md:flex-1 md:block overflow-y-auto w-full md:w-auto md:min-w-[300px]">
              <JobDetailPanel 
                job={selectedJob} 
                farmerProfile={farmerProfile}
                onClose={() => setSelectedJob(null)} 
                isApplied={appliedJobs.includes(selectedJob.id)} 
                onApply={() => handleApply(selectedJob.id)} 
                status={getApplicationStatus(selectedJob.id)} 
              />
          </div>
      )}
      {(selectedJob && activeTab === 'my_apps') && (
          <div className="fixed inset-0 z-50 bg-white md:static md:flex-1 md:block overflow-y-auto w-full md:w-auto md:min-w-[300px]">
              <JobDetailPanel 
                job={selectedJob} 
                farmerProfile={farmerProfile}
                onClose={() => setSelectedJob(null)} 
                isApplied={true} 
                status={getApplicationStatus(selectedJob.id)} 
              />
          </div>
      )}
      {(!selectedJob && window.innerWidth >= 768) && (
          <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50/30 border-l border-gray-200">
             <div className="text-center w-full px-4">
                 <div className="text-4xl mb-3 text-gray-300">📄</div>
                 <p className="text-gray-400 text-sm font-medium">Select a job to view details</p>
             </div>
          </div>
      )}
    </div>
  );
}

function JobCardSupplier({ job, isSelected, onClick, isApplied, onApply, workerLocation }) {
    const isUrgent = job.urgency === 'urgent';
    const postDate = new Date(job.created_at || Date.now());
    const timeAgoMs = Date.now() - postDate.getTime();
    const hoursAgo = Math.max(0, Math.floor(timeAgoMs / 3600000));
    const timeStr = hoursAgo < 1 ? 'Just now' : hoursAgo < 24 ? `${hoursAgo} hours ago` : `${Math.floor(hoursAgo/24)} days ago`;
    const icon = getJobIcon(job.service_type || job.type || job.category);

    return (
        <div className={`bg-white rounded-xl p-4 cursor-pointer transition-colors border ${isSelected ? 'border-gray-400 bg-gray-50/50' : 'border-gray-200 hover:border-gray-300'} ${isApplied ? 'border-l-[3px] border-l-[#166534]' : ''}`}
           onClick={onClick} style={{ borderWidth: isApplied ? '0.5px 0.5px 0.5px 3px' : '0.5px' }}>
            <div className="flex justify-between items-start mb-2">
                <div className="flex gap-3">
                    <div className="w-[32px] h-[32px] rounded-md bg-gray-100 flex items-center justify-center text-lg">{icon}</div>
                    <div>
                        <h4 className="text-[15px] font-medium text-gray-900 leading-snug">{job.auto_title || job.title || 'Farm job'}</h4>
                        {(job.work_type || job.crop) && (
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 2 }}>
                            {job.work_type && <span style={{ fontSize: 10, background: '#e0f2fe', color: '#0369a1', borderRadius: 10, padding: '1px 7px', fontWeight: 500 }}>{job.work_type}</span>}
                            {job.crop && <span style={{ fontSize: 10, background: '#f0fdf4', color: '#166534', borderRadius: 10, padding: '1px 7px', fontWeight: 500 }}>{job.crop}</span>}
                          </div>
                        )}
                        <p className="text-[12px] text-gray-500">{getSafeName(job.farmer_name, false)} · {job.farmer_district}</p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="text-[11px] text-gray-400">{timeStr}</span>
                    {isUrgent && <span className="bg-[#FEE2E2] text-[#991B1B] text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm">Urgent</span>}
                </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-3 mb-2">
                <div className="text-[13px] text-gray-700 flex items-center gap-1.5">
                  <span className="text-gray-400">📍</span>
                  {(() => {
                    const dist = haversineDistanceKm(
                      workerLocation?.lat, workerLocation?.lon,
                      job.lat, job.lng
                    );
                    return (
                      <span>
                        {job.farmer_district}
                        {dist != null && (
                          <span style={{
                            marginLeft: 6, fontWeight: 500,
                            color: dist <= 10 ? '#166534' : dist <= 30 ? '#92400e' : '#6B7280'
                          }}>
                            · {dist}km away
                            {dist <= 10 && ' 🟢'}
                            {dist > 10 && dist <= 30 && ' 🟡'}
                            {dist > 30 && ' 🔴'}
                          </span>
                        )}
                      </span>
                    );
                  })()}
                </div>
                <div className="text-[13px] text-gray-700 flex items-center gap-1.5"><span className="text-gray-400">📅</span> {new Date(job.scheduled_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                <div className="text-[13px] text-gray-700 flex items-center gap-1.5"><span className="text-gray-400">👥</span> {job.workers_needed || job.units || 1} needed</div>
                <div className="text-[13px] text-gray-700 flex items-center gap-1.5 font-medium"><span className="text-gray-400">💰</span> {job.daily_rate || job.pay_rate || job.salary || job.wage ? `₹${job.daily_rate || job.pay_rate || job.salary || job.wage}/day` : 'Pay: Negotiable'}</div>
            </div>
            {job.description && (
                <p className="text-[13px] text-gray-500 line-clamp-2 mt-2 leading-relaxed">
                   {job.description} <span className="text-[#166534] hover:underline cursor-pointer">...read more</span>
                </p>
            )}
            <div className="flex flex-wrap gap-1.5 mt-3">
                {['Tractor driving', 'Heavy lifting'].map((s, i) => (
                    <span key={i} className="px-2 py-0.5 border border-gray-200 text-gray-600 rounded-md text-[11px] bg-gray-50">{s}</span>
                ))}
            </div>
            <div className="flex justify-between items-center border-t border-gray-100 pt-3 mt-3">
                <div className="text-[12px] text-gray-500">⭐ 4.6 farmer</div>
                <div className="flex gap-2">
                    <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50" onClick={(e) => e.stopPropagation()}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                    </button>
                    {isApplied ? (
                        <button className="h-8 px-4 rounded-md border border-[#166534] text-[#166534] text-[13px] font-medium bg-green-50/50 cursor-default flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            Applied ✓
                        </button>
                    ) : (
                        <button className="h-8 px-4 rounded-md bg-[#166534] text-white text-[13px] font-medium hover:bg-green-800 transition-colors shadow-sm" onClick={(e) => { e.stopPropagation(); onApply(); }}>
                            Apply Now
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function AppliedJobCard({ app, onClick }) {
    const job = app.job_posts || app.job || app;
    const applicationStatus = (app.status || 'applied').toLowerCase();
    const isSelected = ['selected', 'accepted', 'hired'].includes(applicationStatus);
    
    // Privacy labels
    const displayPartner = getSafeName(job.farmer_name, isSelected);
    const displayPlace = isSelected ? job.farmer_district : `${job.farmer_district} area`;

    const statusMap = {
        'applied': { label: 'Pending', bg: 'bg-amber-100 text-amber-800 border-amber-200' },
        'hired': { label: 'Selected', bg: 'bg-green-100 text-green-800 border-green-200' },
        'selected': { label: 'Selected', bg: 'bg-green-100 text-green-800 border-green-200' },
        'accepted': { label: 'Selected', bg: 'bg-green-100 text-green-800 border-green-200' },
        'rejected': { label: 'Not selected', bg: 'bg-gray-100 text-gray-500 border-gray-200' },
        'shortlisted': { label: 'Shortlisted', bg: 'bg-blue-100 text-blue-800 border-blue-200' }
    };
    const s = statusMap[applicationStatus] || statusMap['applied'];

    return (
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-3 w-full">
            <div className="min-w-0 pr-4">
                <h4 className="text-[15px] font-medium text-gray-900 leading-tight truncate">{job.title}</h4>
                <p className="text-[12px] text-gray-500 mt-1 truncate">
                    {displayPartner} · {displayPlace} · Applied on {new Date(app.created_at || Date.now()).toLocaleDateString()}
                </p>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0">
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${s.bg}`}>{s.label}</span>
                <button onClick={onClick} className="text-[#166534] text-[13px] font-medium hover:underline px-3 py-1.5 border border-gray-200 rounded-md bg-white hover:bg-gray-50">
                    View Job
                </button>
            </div>
        </div>
    );
}

function JobDetailPanel({ job, onClose, isApplied, onApply, status, farmerProfile }) {
    if (!job) return null;
    const isUrgent = job.urgency === 'urgent';
    const postDate = new Date(job.created_at || Date.now());
    const timeAgoMs = Date.now() - postDate.getTime();
    const hoursAgo = Math.max(0, Math.floor(timeAgoMs / 3600000));
    const timeStr = hoursAgo < 1 ? 'Just now' : hoursAgo < 24 ? `${hoursAgo} hours ago` : `${Math.floor(hoursAgo/24)} days ago`;

    // Privacy logic
    const normalizedStatus = (status || '').toLowerCase();
    const isSelected = ['selected', 'accepted', 'hired', 'approved', 'select'].includes(normalizedStatus);
    
    // Explicitly mask name if it contains email address
    const getSafeInitial = (name, selected) => {
        if (!name) return 'F';
        if (selected && !name.includes('@')) return name.charAt(0).toUpperCase();
        return 'F';
    };

    const displayPartner = getSafeName(job.farmer_name, isSelected);
    const displayLocation = isSelected ? job.farmer_district : `${job.farmer_district} area`;

    return (
        <div className="h-full flex flex-col bg-white">
            <div className="flex items-center gap-3 p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
                <button onClick={onClose} className="md:hidden text-gray-500 hover:bg-gray-100 p-1.5 rounded-full">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                </button>
                <div className="flex-1">
                    <h3 className="text-[16px] font-medium text-gray-900 leading-tight">{job.auto_title || job.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-gray-500">Posted {timeStr}</span>
                        {isUrgent && <span className="bg-[#FEE2E2] text-[#991B1B] text-[10px] uppercase font-bold px-1.5 rounded-sm">Urgent</span>}
                    </div>
                </div>
            </div>
            <div className="p-4 md:p-5 flex-1 overflow-y-auto">
                
                {/* Privacy-Aware Contact Panel */}
                {isSelected ? (
                  /* ── SELECTED: Show full contact ── */
                  <div style={{
                    background: 'var(--color-background-secondary, #f8fafc)',
                    borderRadius: 12, padding: '14px 16px', marginBottom: 24,
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{
                      fontSize: 11, fontWeight: 600,
                      color: 'var(--color-text-secondary, #64748b)',
                      letterSpacing: '0.05em', marginBottom: 10
                    }}>
                      FARMER CONTACT
                    </div>

                    {/* Farmer avatar + name + location */}
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      gap: 10, marginBottom: 12
                    }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%',
                        background: '#1d4ed8', color: '#fff',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 16, fontWeight: 600, flexShrink: 0
                      }}>
                        {getSafeName(farmerProfile?.name || job.farmer_name, isSelected).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{
                          fontSize: 14, fontWeight: 500,
                          color: 'var(--color-text-primary, #0f172a)'
                        }}>
                          {getSafeName(farmerProfile?.name || job.farmer_name, isSelected)}
                        </div>
                        <div style={{
                          fontSize: 12, color: 'var(--color-text-secondary, #64748b)'
                        }}>
                          {farmerProfile?.location || job.farmer_district || ''}
                          {farmerProfile?.rating && ` · ⭐ ${farmerProfile.rating}`}
                        </div>
                      </div>
                    </div>

                    {/* Selection confirmation banner */}
                    <div style={{
                      background: '#f0fdf4', border: '0.5px solid #86efac',
                      borderRadius: 8, padding: '8px 12px', marginBottom: 12
                    }}>
                      <div style={{
                        fontSize: 13, color: '#166534', fontWeight: 500
                      }}>
                        ✓ You have been selected!
                      </div>
                      <div style={{ fontSize: 12, color: '#166534', marginTop: 2 }}>
                        The farmer wants to hire you. Contact them now.
                      </div>
                    </div>

                    {/* Call + WhatsApp buttons — NO email ever */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                      <button
                        onClick={() => {
                          const phone = farmerProfile?.phone || job.farmer_phone;
                          if (phone) {
                            window.location.href = `tel:${phone}`;
                          } else {
                            alert('Phone number not available.');
                          }
                        }}
                        style={{
                          flex: 1, background: '#166534', color: '#fff',
                          border: 'none', borderRadius: 8,
                          padding: '10px 12px', fontSize: 13,
                          fontWeight: 500, cursor: 'pointer',
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'center', gap: 6
                        }}
                      >
                        📞 Call Farmer
                      </button>

                      <button
                        onClick={() => {
                          const phone = farmerProfile?.phone || job.farmer_phone;
                          if (!phone) {
                            alert('Phone number not available.');
                            return;
                          }
                          const cleaned = phone.replace(/\D/g, '');
                          const full = cleaned.startsWith('91') ? cleaned : `91${cleaned}`;
                          const jobTitle = job.auto_title || job.title || 'your job posting';
                          const msg = encodeURIComponent(
                            `Hi, I saw your job "${jobTitle}" on Rythu Mitra. ` +
                            `I have been selected and am available. ` +
                            `Please let me know when to arrive and any other details. Thank you.`
                          );
                          window.open(`https://wa.me/${full}?text=${msg}`, '_blank');
                        }}
                        style={{
                          flex: 1, background: '#25D366', color: '#fff',
                          border: 'none', borderRadius: 8,
                          padding: '10px 12px', fontSize: 13,
                          fontWeight: 500, cursor: 'pointer',
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'center', gap: 6
                        }}
                      >
                        💬 WhatsApp
                      </button>
                    </div>

                    {/* Verified badge — no email shown */}
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      gap: 6, fontSize: 12, color: '#166534'
                    }}>
                      <span>✓ Phone verified</span>
                      {farmerProfile?.created_at && (
                        <span style={{ color: 'var(--color-text-tertiary, #94a3b8)' }}>
                          · Member since {new Date(farmerProfile.created_at).getFullYear()}
                        </span>
                      )}
                      {farmerProfile?.rating && (
                        <span style={{ color: 'var(--color-text-tertiary, #94a3b8)' }}>
                          · ⭐ {farmerProfile.rating} rating
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  /* ── NOT SELECTED: Show locked panel ── */
                  (() => {
                    const isRejectedStatus = ['rejected', 'closed', 'not selected'].includes(normalizedStatus);
                    const isPendingStatus = ['pending', 'applied', 'review'].includes(normalizedStatus);
                    const hasAppliedStatus = isSelected || isRejectedStatus || isPendingStatus;

                    return (
                      <div style={{
                        background: 'var(--color-background-secondary, #f8fafc)',
                        border: `0.5px solid ${isRejectedStatus
                          ? '#fca5a5'
                          : '#e2e8f0'}`,
                        borderRadius: 12, padding: '20px 16px',
                        marginBottom: 24, textAlign: 'center'
                      }}>
                        <div style={{ fontSize: 24, marginBottom: 8 }}>
                          {isRejectedStatus ? '❌' : '🔒'}
                        </div>

                        <div style={{
                          fontSize: 13, fontWeight: 500,
                          color: 'var(--color-text-primary, #0f172a)', marginBottom: 6
                        }}>
                          {isRejectedStatus
                            ? 'Application not selected'
                            : 'Farmer contact is private'}
                        </div>

                        <div style={{
                          fontSize: 12, color: 'var(--color-text-secondary, #64748b)',
                          lineHeight: 1.6, marginBottom: 16
                        }}>
                          {isRejectedStatus
                            ? 'The farmer has filled this position. Keep applying to other jobs.'
                            : hasAppliedStatus && isPendingStatus
                            ? 'Your application is under review. Contact details are shared only after the farmer selects you.'
                            : 'Apply for this job to get started. Contact details are shared only after selection.'}
                        </div>

                        {/* Status pill or Apply logic */}
                        {!hasAppliedStatus ? (
                            <button className="w-full bg-[#166534] text-white py-2 rounded-md font-medium text-[13px] hover:bg-green-800 transition-colors mb-2" onClick={onApply}>
                                Apply to see contact details
                            </button>
                        ) : (
                            <div style={{
                              display: 'inline-block',
                              fontSize: 12, fontWeight: 500,
                              padding: '5px 14px', borderRadius: 20,
                              background: isRejectedStatus ? '#fef2f2'
                                        : isPendingStatus ? '#fffbeb'
                                        : '#f1f5f9',
                              color: isRejectedStatus ? '#b91c1c'
                                   : isPendingStatus ? '#92400e'
                                   : '#64748b',
                              border: `1px solid ${isRejectedStatus ? '#fca5a5'
                                                    : isPendingStatus ? '#fcd34d'
                                                    : '#cbd5e1'}`
                            }}>
                              {isRejectedStatus ? '❌ Not selected'
                               : isPendingStatus ? '⏳ Application pending'
                               : '→ Apply to see contact'}
                            </div>
                        )}
                      </div>
                    );
                  })()
                )}

                <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-6 bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                    <div><p className="text-[11px] text-gray-500 mb-0.5">Job Type</p><p className="text-[13px] font-medium text-gray-900 capitalize">{job.service_type || 'Worker'}</p></div>
                    <div><p className="text-[11px] text-gray-500 mb-0.5">Date Required</p><p className="text-[13px] font-medium text-gray-900">{new Date(job.scheduled_date).toLocaleDateString()}</p></div>
                    <div><p className="text-[11px] text-gray-500 mb-0.5">Workers Need</p><p className="text-[13px] font-medium text-gray-900">{job.workers_needed || job.units || 1}</p></div>
                    <div><p className="text-[11px] text-gray-500 mb-0.5">Pay Per Day</p><p className="text-[13px] font-medium text-gray-900">{job.daily_rate ? `₹${job.daily_rate}` : 'Negotiable'}</p></div>
                    <div><p className="text-[11px] text-gray-500 mb-0.5">Location</p><p className="text-[13px] font-medium text-gray-900 truncate pr-2" title={job.farmer_district}>{job.farmer_district}</p></div>
                    <div><p className="text-[11px] text-gray-500 mb-0.5">Posted</p><p className="text-[13px] font-medium text-gray-900">{timeStr}</p></div>
                </div>
                <div className="mb-6">
                    <h5 className="text-[12px] font-medium text-gray-500 uppercase tracking-wider mb-2">About this job</h5>
                    <p className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap">{job.description || 'No additional description provided by the farmer. Contact the farmer for more details regarding the exact nature of the work.'}</p>
                </div>
                <div className="mb-6">
                    <h5 className="text-[12px] font-medium text-gray-500 uppercase tracking-wider mb-2">What you need</h5>
                    <ul className="list-disc pl-4 text-[13px] text-gray-700 space-y-1 marker:text-gray-400">
                        <li>Relevant experience in {job.service_type || 'farm labor'}</li>
                        <li>Availability on the specified date</li>
                        <li>Ability to perform sustained physical work in fields</li>
                    </ul>
                </div>
            </div>
            <div className="p-4 border-t border-gray-200 bg-white sticky bottom-0">
                {isApplied ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex gap-3">
                        <div className="bg-white rounded-full w-6 h-6 flex items-center justify-center text-green-600 border border-green-200 shrink-0">✓</div>
                        <div>
                            <p className="text-[13px] font-medium text-green-800">Application sent</p>
                            <p className="text-[12px] text-green-700 mt-0.5">The farmer will contact you if selected.</p>
                            <p className="text-[11px] text-green-600/70 mt-1">Applied on {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <button className="w-full bg-[#166534] text-white h-[44px] rounded-lg font-medium text-[15px] hover:bg-green-800 shadow-sm transition-colors flex items-center justify-center gap-2" onClick={onApply}>
                            Apply Now <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                        </button>
                        <p className="text-[11px] text-gray-400 text-center mt-2 font-medium">Your profile will be shared with the farmer</p>
                    </>
                )}
            </div>
        </div>
    );
}


// ─── SUPPLIER REGISTRATION FORM ──────────────────────────────────────────────

function SupplierRegistrationForm({ user, onComplete }) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: '',
    whatsapp: '',
    same_as_phone: false,
    district: 'Annamayya',
    state: 'Andhra Pradesh',
    service_type: 'worker',
    skills: [],
    daily_rate: '',
    experience: '',
    bio: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/supplier/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          user_id: user.id,
          whatsapp: formData.same_as_phone ? formData.phone : formData.whatsapp
        })
      });
      if (res.ok) setStep(3); // Show success screen
    } catch (err) {
      alert('Error submitting registration');
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 3) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="text-8xl mb-6">✅</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration submitted!</h2>
      <p className="text-gray-500 mb-8">Your profile is pending admin approval. You can start browsing jobs shortly.</p>
      <button onClick={() => window.location.href = '/'} className="w-full max-w-xs bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg">
        Go to Home
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white p-6 pb-20 overflow-y-auto">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-black text-gray-900 mb-2">Complete Profile</h2>
        <p className="text-gray-500 mb-8">Tell us about your services</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="text" placeholder="Full Name (As per Aadhar)" required
            className="w-full h-14 px-4 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all text-slate-900 font-medium placeholder:text-slate-400"
            value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />

          <input type="tel" placeholder="Phone Number (+91)" required
            className="w-full h-14 px-4 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-green-500 outline-none text-slate-900 font-medium placeholder:text-slate-400"
            value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />

          <div className="flex items-center gap-2 px-1">
            <input type="checkbox" id="whatsapp-check" checked={formData.same_as_phone}
              onChange={e => setFormData({...formData, same_as_phone: e.target.checked})} />
            <label htmlFor="whatsapp-check" className="text-sm font-medium text-gray-600">WhatsApp same as phone</label>
          </div>

          {!formData.same_as_phone && (
            <input type="tel" placeholder="WhatsApp Number"
              className="w-full h-14 px-4 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-green-500 outline-none text-slate-900 font-medium placeholder:text-slate-400"
              value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
          )}

          <div className="grid grid-cols-2 gap-4">
            <select className="h-14 px-4 rounded-xl border border-gray-200 bg-white outline-none text-slate-900 font-medium"
              value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} required>
              <option value="">Select District</option>
              {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <input type="text" value="Andhra Pradesh" disabled className="h-14 px-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-400 font-bold" />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-700">Service Type</label>
            <div className="grid grid-cols-2 gap-2">
              {SERVICES.map(s => (
                <button type="button" key={s.id} onClick={() => setFormData({...formData, service_type: s.id})}
                  className={`py-3 rounded-xl border font-black transition-all ${formData.service_type === s.id ? 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-100' : 'bg-white text-gray-500 border-gray-200 hover:border-green-300'}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {formData.service_type === 'worker' && (
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700">Skills</label>
              <div className="flex flex-wrap gap-2">
                {SKILLS.map(s => (
                  <button type="button" key={s} onClick={() => {
                    const exists = formData.skills.includes(s);
                    setFormData({...formData, skills: exists ? formData.skills.filter(i => i !== s) : [...formData.skills, s]});
                  }} className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${formData.skills.includes(s) ? 'bg-green-100 border-green-600 text-green-700' : 'bg-white border-gray-200 text-gray-500'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <input type="number" placeholder="Daily Rate (₹)" required
              className="h-14 px-4 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-green-500 outline-none text-slate-900 font-medium placeholder:text-slate-400"
              value={formData.daily_rate} onChange={e => setFormData({...formData, daily_rate: e.target.value})} />
            <input type="number" placeholder="Exp. (Years)"
              className="h-14 px-4 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-green-500 outline-none text-slate-900 font-medium placeholder:text-slate-400"
              value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} />
          </div>

          <textarea placeholder="Tell farmers about your experience (Optional)"
            className="w-full h-24 p-4 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-green-500 outline-none text-slate-900 font-medium placeholder:text-slate-400"
            value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />

          <button type="submit" disabled={submitting}
            className="w-full h-16 bg-green-600 text-white rounded-2xl font-black text-xl shadow-xl shadow-green-100 flex items-center justify-center gap-2">
            {submitting ? 'Submitting...' : 'Register as Supplier ✓'}
          </button>
        </form>
      </div>
    </div>
  );
}
