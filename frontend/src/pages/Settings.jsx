import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';

const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'kn', label: 'ಕನ್ನಡ' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'mr', label: 'मराठी' },
];

const NOTIFICATION_TYPES = [
    { key: 'market_prices',     label: 'Market Price Alerts',  desc: 'When prices rise or fall significantly',  icon: '📊' },
    { key: 'weather_alerts',    label: 'Weather Alerts',        desc: 'Storms, heavy rain, frost warnings',       icon: '🌤️' },
    { key: 'crop_advisory',     label: 'Crop Advisory',         desc: 'Seasonal tips & pest alerts',              icon: '🌾' },
    { key: 'disease_alerts',    label: 'Disease Alerts',        desc: 'Regional disease outbreak notifications',  icon: '🔬' },
    { key: 'scheme_updates',    label: 'Scheme Updates',        desc: 'New govt schemes & deadlines',             icon: '🏛️' },
    { key: 'worker_updates',    label: 'Worker / Job Updates',  desc: 'Job applications & bookings',              icon: '👷' },
];

export default function Settings() {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const [language,       setLanguage]       = useState(localStorage.getItem('rm_lang') || 'en');
    const [notifications,  setNotifications]  = useState(() => {
        try { return JSON.parse(localStorage.getItem('rm_notifications') || '{}'); } catch { return {}; }
    });
    const [units,          setUnits]          = useState(localStorage.getItem('rm_units') || 'metric');
    const [saving,         setSaving]         = useState(false);
    const [saveMsg,        setSaveMsg]        = useState('');
    const [deleteConfirm,  setDeleteConfirm]  = useState(false);

    const toggleNotif = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveMsg('');
        try {
            localStorage.setItem('rm_lang',          language);
            localStorage.setItem('rm_notifications', JSON.stringify(notifications));
            localStorage.setItem('rm_units',         units);

            // Try to persist to Supabase profile
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    await supabase.from('profiles').upsert({
                        id:            session.user.id,
                        preferred_language: language,
                        notification_prefs: notifications,
                        updated_at:    new Date().toISOString(),
                    }, { onConflict: 'id' });
                }
            } catch { /* non-fatal — localStorage persisted */ }

            setSaveMsg('✓ Settings saved!');
            setTimeout(() => setSaveMsg(''), 3000);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!deleteConfirm) { setDeleteConfirm(true); return; }
        // Clear all local state
        ['rythu_token','rythu_refresh','rythu_user','rm_role','rm_farmer_location',
         'rm_weather_cache','rm_lang','rm_notifications','rm_units',
         'rm_crop_reports','rm_disease_history'].forEach(k => localStorage.removeItem(k));
        try { await supabase.auth.signOut(); } catch {}
        navigate('/register', { replace: true });
    };

    const Section = ({ title, children }) => (
        <div style={{
            background: '#fff', borderRadius: 16, padding: '20px',
            border: '1px solid #e5e7eb', marginBottom: 14,
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        }}>
            <p style={{
                fontSize: 11, fontWeight: 700, color: '#9ca3af',
                letterSpacing: '0.08em', margin: '0 0 14px',
            }}>
                {title.toUpperCase()}
            </p>
            {children}
        </div>
    );

    return (
        <div style={{
            minHeight: '100vh', background: '#f8fafc',
            paddingBottom: 80,
            fontFamily: "'Inter', 'DM Sans', -apple-system, sans-serif",
        }}>
            {/* Header */}
            <div style={{
                background: '#fff', borderBottom: '1px solid #e5e7eb',
                padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: 12,
                position: 'sticky', top: 0, zIndex: 10,
            }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        background: '#f3f4f6', border: 'none', borderRadius: 8,
                        width: 36, height: 36, cursor: 'pointer', fontSize: 16,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >
                    ←
                </button>
                <div>
                    <h1 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: 0 }}>Settings</h1>
                    <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>App preferences & notifications</p>
                </div>
            </div>

            <div style={{ maxWidth: 560, margin: '20px auto', padding: '0 16px' }}>

                {/* Language */}
                <Section title="Language">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                        {LANGUAGES.map(l => (
                            <button
                                key={l.code}
                                onClick={() => setLanguage(l.code)}
                                style={{
                                    padding: '10px 8px', borderRadius: 10, cursor: 'pointer',
                                    border:      `1.5px solid ${language === l.code ? '#16a34a' : '#e5e7eb'}`,
                                    background:  language === l.code ? '#f0fdf4' : '#fafafa',
                                    color:       language === l.code ? '#15803d' : '#374151',
                                    fontSize: 13, fontWeight: language === l.code ? 700 : 500,
                                    textAlign: 'center',
                                }}
                            >
                                {l.label}
                            </button>
                        ))}
                    </div>
                </Section>

                {/* Units */}
                <Section title="Measurement Units">
                    <div style={{ display: 'flex', gap: 10 }}>
                        {[
                            { key: 'metric',   label: 'Metric (kg, °C, km)' },
                            { key: 'imperial', label: 'Imperial (lb, °F, mi)' },
                        ].map(u => (
                            <button
                                key={u.key}
                                onClick={() => setUnits(u.key)}
                                style={{
                                    flex: 1, padding: '10px 8px', borderRadius: 10, cursor: 'pointer',
                                    border:     `1.5px solid ${units === u.key ? '#16a34a' : '#e5e7eb'}`,
                                    background: units === u.key ? '#f0fdf4' : '#fafafa',
                                    color:      units === u.key ? '#15803d' : '#374151',
                                    fontSize: 13, fontWeight: units === u.key ? 700 : 500,
                                }}
                            >
                                {u.label}
                            </button>
                        ))}
                    </div>
                </Section>

                {/* Notifications */}
                <Section title="Notifications">
                    {NOTIFICATION_TYPES.map(n => (
                        <div key={n.key} style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '12px 0', borderBottom: '1px solid #f3f4f6',
                        }}>
                            <span style={{ fontSize: 20, width: 28, textAlign: 'center', flexShrink: 0 }}>{n.icon}</span>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0 }}>{n.label}</p>
                                <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0' }}>{n.desc}</p>
                            </div>
                            {/* Toggle switch */}
                            <button
                                onClick={() => toggleNotif(n.key)}
                                style={{
                                    width: 44, height: 24, borderRadius: 12, border: 'none',
                                    background: notifications[n.key] ? '#16a34a' : '#d1d5db',
                                    cursor: 'pointer', position: 'relative', flexShrink: 0,
                                    transition: 'background 0.2s',
                                }}
                            >
                                <div style={{
                                    position: 'absolute', top: 3,
                                    left: notifications[n.key] ? 23 : 3,
                                    width: 18, height: 18, borderRadius: '50%',
                                    background: '#fff', transition: 'left 0.2s',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                }} />
                            </button>
                        </div>
                    ))}
                </Section>

                {/* Save */}
                {saveMsg && (
                    <div style={{
                        background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10,
                        padding: '10px 14px', fontSize: 13, color: '#15803d',
                        fontWeight: 600, textAlign: 'center', marginBottom: 12,
                    }}>
                        {saveMsg}
                    </div>
                )}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                        width: '100%', background: 'linear-gradient(135deg,#16a34a,#15803d)',
                        color: '#fff', border: 'none', borderRadius: 12,
                        padding: '14px', fontSize: 15, fontWeight: 600,
                        cursor: saving ? 'not-allowed' : 'pointer',
                        marginBottom: 12, opacity: saving ? 0.7 : 1,
                    }}
                >
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>

                {/* Danger zone */}
                <Section title="Account">
                    <button
                        onClick={() => { logout(); }}
                        style={{
                            width: '100%', background: '#fff', border: '1px solid #e5e7eb',
                            borderRadius: 10, padding: '11px', fontSize: 14,
                            fontWeight: 600, color: '#374151', cursor: 'pointer', marginBottom: 10,
                        }}
                    >
                        🚪 Log Out
                    </button>
                    <button
                        onClick={handleDeleteAccount}
                        style={{
                            width: '100%', background: '#fef2f2', border: '1px solid #fecaca',
                            borderRadius: 10, padding: '11px', fontSize: 13,
                            fontWeight: 600, color: '#dc2626', cursor: 'pointer',
                        }}
                    >
                        {deleteConfirm ? '⚠️ Tap again to confirm delete' : 'Delete Account'}
                    </button>
                </Section>

                <p style={{
                    textAlign: 'center', fontSize: 11, color: '#9ca3af', marginTop: 16,
                }}>
                    Rythu Mitra v2.0 · Made with ❤️ for Indian Farmers
                </p>
            </div>
        </div>
    );
}
