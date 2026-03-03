import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const leafSVG = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
);

const eyeIcon = (show) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {show
            ? <>
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
            </>
            : <>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
            </>
        }
    </svg>
);

export default function Login() {
    const navigate = useNavigate();
    const { login, loading } = useAuth();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!username.trim()) {
            setError('Please enter your username');
            return;
        }
        if (!password) {
            setError('Please enter your password');
            return;
        }

        setSubmitting(true);
        const result = await login(username.trim(), password);
        setSubmitting(false);

        if (result.success) {
            navigate('/dashboard', { replace: true });
        } else {
            setError(result.error || 'Login failed. Check your credentials.');
        }
    };

    return (
        <div style={styles.page}>
            {/* Background decoration */}
            <div style={styles.bgCircle1} />
            <div style={styles.bgCircle2} />

            <div style={styles.card}>
                {/* Brand */}
                <div style={styles.brand}>
                    <div style={styles.brandIcon}>{leafSVG}</div>
                    <div>
                        <div style={styles.brandName}>Rythu Mitra</div>
                        <div style={styles.brandSub}>AI-Powered Farmer Intelligence</div>
                    </div>
                </div>

                <h1 style={styles.heading}>Welcome Back 👋</h1>
                <p style={styles.sub}>Login to your farmer dashboard</p>

                <form onSubmit={handleSubmit} style={styles.form} noValidate>
                    {/* Username */}
                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Username</label>
                        <div style={styles.inputWrap}>
                            <span style={styles.inputIcon}>👤</span>
                            <input
                                id="login-username"
                                type="text"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={styles.input}
                                autoComplete="username"
                                autoFocus
                                disabled={submitting}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Password</label>
                        <div style={styles.inputWrap}>
                            <span style={styles.inputIcon}>🔒</span>
                            <input
                                id="login-password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ ...styles.input, paddingRight: 44 }}
                                autoComplete="current-password"
                                disabled={submitting}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={styles.eyeBtn}
                                tabIndex={-1}
                            >
                                {eyeIcon(showPassword)}
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
                            cursor: submitting ? 'not-allowed' : 'pointer'
                        }}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <span style={styles.spinner} />
                        ) : null}
                        {submitting ? 'Logging in...' : 'Login to Dashboard'}
                    </button>
                </form>

                <p style={styles.footerText}>
                    New farmer?{' '}
                    <Link to="/register" style={styles.link}>
                        Register Free →
                    </Link>
                </p>
            </div>

            <style>{`
        input:focus { outline: none; border-color: #16a34a !important; box-shadow: 0 0 0 3px rgba(22,163,74,0.15) !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
}

const styles = {
    page: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #f0fdf4 100%)',
        padding: '24px 16px',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Inter', -apple-system, sans-serif"
    },
    bgCircle1: {
        position: 'absolute',
        top: -100,
        right: -100,
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'rgba(22,163,74,0.06)',
        pointerEvents: 'none'
    },
    bgCircle2: {
        position: 'absolute',
        bottom: -80,
        left: -80,
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: 'rgba(22,163,74,0.04)',
        pointerEvents: 'none'
    },
    card: {
        background: '#ffffff',
        borderRadius: 20,
        padding: '40px 36px',
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
        position: 'relative',
        zIndex: 1
    },
    brand: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 28
    },
    brandIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        background: 'linear-gradient(135deg, #16a34a, #14532d)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        flexShrink: 0
    },
    brandName: {
        fontWeight: 700,
        fontSize: 16,
        color: '#14532d',
        lineHeight: 1.2
    },
    brandSub: {
        fontSize: 10,
        color: '#6b7280',
        lineHeight: 1.2
    },
    heading: {
        fontSize: 24,
        fontWeight: 700,
        color: '#111827',
        margin: '0 0 6px 0'
    },
    sub: {
        fontSize: 14,
        color: '#6b7280',
        margin: '0 0 28px 0'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: 18
    },
    fieldGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: 6
    },
    label: {
        fontSize: 13,
        fontWeight: 600,
        color: '#374151'
    },
    inputWrap: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
    },
    inputIcon: {
        position: 'absolute',
        left: 12,
        fontSize: 16,
        pointerEvents: 'none',
        zIndex: 1
    },
    input: {
        width: '100%',
        padding: '11px 14px 11px 40px',
        border: '1.5px solid #e5e7eb',
        borderRadius: 10,
        fontSize: 14,
        color: '#111827',
        background: '#fafafa',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s'
    },
    eyeBtn: {
        position: 'absolute',
        right: 12,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#9ca3af',
        display: 'flex',
        alignItems: 'center',
        padding: 0
    },
    errorBox: {
        background: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: 8,
        padding: '10px 14px',
        fontSize: 13,
        color: '#dc2626',
        display: 'flex',
        alignItems: 'center',
        gap: 6
    },
    btn: {
        background: 'linear-gradient(135deg, #16a34a, #15803d)',
        color: '#ffffff',
        border: 'none',
        borderRadius: 10,
        padding: '13px 20px',
        fontSize: 15,
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 4,
        transition: 'opacity 0.2s'
    },
    spinner: {
        width: 18,
        height: 18,
        border: '2px solid rgba(255,255,255,0.4)',
        borderTopColor: '#fff',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        display: 'inline-block'
    },
    footerText: {
        textAlign: 'center',
        fontSize: 13,
        color: '#6b7280',
        marginTop: 24,
        marginBottom: 0
    },
    link: {
        color: '#16a34a',
        fontWeight: 600,
        textDecoration: 'none'
    }
};
