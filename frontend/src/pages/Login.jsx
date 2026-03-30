import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    mapSupabaseUserToAppUser,
    persistAppUserSnapshot,
    getHomePathForRole,
} from '../utils/mapSupabaseUser';


export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email,      setEmail]      = useState('');
    const [password,   setPassword]   = useState('');
    const [error,      setError]      = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showPwd,    setShowPwd]    = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email.trim()) { setError('Please enter your email'); return; }
        if (!password)     { setError('Please enter your password'); return; }

        setSubmitting(true);
        const result = await login(email.trim(), password);
        setSubmitting(false);

        if (result.success) {
            if (result.user) {
                const appUser = mapSupabaseUserToAppUser(result.user);
                persistAppUserSnapshot(appUser);
                // Note: hydrateLaborRoleFromProfile is already fired non-blocking inside AuthContext.login()
                // Give it a small moment to write to localStorage before we read it
                await new Promise(r => setTimeout(r, 200));
            }
            const role = localStorage.getItem('rm_role');
            navigate(getHomePathForRole(role || ''), { replace: true });
        } else {
            setError(result.error || 'Login failed. Check your credentials.');
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.bgCircle1} />
            <div style={styles.bgCircle2} />

            <div style={styles.card}>
                {/* Brand */}
                <div style={styles.brand}>
                    <div style={styles.brandIcon}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
                            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                        </svg>
                    </div>
                    <div>
                        <div style={styles.brandName}>Rythu Mitra</div>
                        <div style={styles.brandSub}>Your AI Farming Partner 🌾</div>
                    </div>
                </div>

                <h1 style={styles.heading}>Welcome back</h1>
                <p style={styles.sub}>Sign in to your farmer account</p>

                <form onSubmit={handleSubmit} style={styles.form} noValidate>
                    {/* Email */}
                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Email <span style={{ color: '#ef4444' }}>*</span></label>
                        <div style={styles.inputWrap}>
                            <span style={styles.icon}>✉️</span>
                            <input
                                id="login-email"
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                style={inputStyle(false)}
                                autoComplete="email"
                                autoFocus
                                disabled={submitting}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Password <span style={{ color: '#ef4444' }}>*</span></label>
                        <div style={styles.inputWrap}>
                            <span style={styles.icon}>🔒</span>
                            <input
                                id="login-password"
                                type={showPwd ? 'text' : 'password'}
                                placeholder="Your password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                style={{ ...inputStyle(false), paddingRight: 44 }}
                                autoComplete="current-password"
                                disabled={submitting}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPwd(v => !v)}
                                style={styles.eyeBtn}
                                tabIndex={-1}
                            >
                                {showPwd ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={styles.errorBox}>
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        id="login-submit"
                        type="submit"
                        style={{
                            ...styles.btn,
                            opacity: submitting ? 0.7 : 1,
                            cursor:  submitting ? 'not-allowed' : 'pointer',
                        }}
                        disabled={submitting}
                    >
                        {submitting && <span style={styles.spinner} />}
                        {submitting ? 'Signing in...' : 'Sign in 🌾'}
                    </button>
                </form>

                <p style={styles.footerText}>
                    Don't have an account?{' '}
                    <Link to="/register" style={styles.link}>Create free account →</Link>
                </p>
            </div>

            <style>{`
                input:focus { outline: none; border-color: #16a34a !important; box-shadow: 0 0 0 3px rgba(22,163,74,0.15) !important; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}

const inputStyle = (hasError) => ({
    width:        '100%',
    padding:      '11px 14px 11px 40px',
    border:       `1.5px solid ${hasError ? '#f87171' : '#e5e7eb'}`,
    borderRadius: 10,
    fontSize:     14,
    color:        '#111827',
    background:   hasError ? '#fef2f2' : '#fafafa',
    boxSizing:    'border-box',
    transition:   'border-color 0.2s',
});

const styles = {
    page: {
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #f0fdf4 100%)',
        padding: '32px 16px', position: 'relative', overflow: 'hidden',
        fontFamily: "'Inter', -apple-system, sans-serif",
    },
    bgCircle1: {
        position: 'fixed', top: -120, right: -120, width: 450, height: 450,
        borderRadius: '50%', background: 'rgba(22,163,74,0.06)', pointerEvents: 'none',
    },
    bgCircle2: {
        position: 'fixed', bottom: -100, left: -100, width: 350, height: 350,
        borderRadius: '50%', background: 'rgba(22,163,74,0.04)', pointerEvents: 'none',
    },
    card: {
        background: '#ffffff', borderRadius: 20, padding: '40px 36px',
        width: '100%', maxWidth: 440,
        boxShadow: '0 8px 40px rgba(0,0,0,0.10)', position: 'relative', zIndex: 1,
    },
    brand:     { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 },
    brandIcon: {
        width: 40, height: 40, borderRadius: 10,
        background: 'linear-gradient(135deg, #16a34a, #14532d)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#ffffff', flexShrink: 0,
    },
    brandName: { fontWeight: 700, fontSize: 16, color: '#14532d', lineHeight: 1.2 },
    brandSub:  { fontSize: 10, color: '#6b7280', lineHeight: 1.2 },
    heading:   { fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 4px 0' },
    sub:       { fontSize: 13, color: '#6b7280', margin: '0 0 24px 0' },
    form:      { display: 'flex', flexDirection: 'column', gap: 16 },
    fieldGroup:{ display: 'flex', flexDirection: 'column', gap: 5 },
    label:     { fontSize: 13, fontWeight: 600, color: '#374151' },
    inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
    icon:      { position: 'absolute', left: 12, fontSize: 14, pointerEvents: 'none', zIndex: 1 },
    eyeBtn:    {
        position: 'absolute', right: 12, background: 'none', border: 'none',
        cursor: 'pointer', color: '#9ca3af', fontSize: 16, padding: 0,
    },
    errorBox: {
        background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8,
        padding: '10px 14px', fontSize: 13, color: '#dc2626',
        display: 'flex', alignItems: 'center', gap: 6,
    },
    btn: {
        background: 'linear-gradient(135deg, #16a34a, #15803d)',
        color: '#ffffff', border: 'none', borderRadius: 10, padding: '13px 20px',
        fontSize: 15, fontWeight: 600, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 8, marginTop: 8, transition: 'opacity 0.2s',
    },
    spinner: {
        width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)',
        borderTopColor: '#fff', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite', display: 'inline-block',
    },
    footerText:{ textAlign: 'center', fontSize: 13, color: '#6b7280', marginTop: 24, marginBottom: 0 },
    link:      { color: '#16a34a', fontWeight: 600, textDecoration: 'none' },
};
