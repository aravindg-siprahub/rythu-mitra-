import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';

/* ── Constants ── */
const STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
    'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
    'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
    'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
    'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi',
    'Jammu & Kashmir', 'Ladakh', 'Andaman & Nicobar',
    'Chandigarh', 'Dadra & Nagar Haveli', 'Daman & Diu',
    'Lakshadweep', 'Puducherry'
];

const CROPS = [
    'Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Maize',
    'Tomato', 'Onion', 'Potato', 'Soybean', 'Groundnut',
    'Sunflower', 'Jowar', 'Bajra', 'Turmeric', 'Chilli',
    'Banana', 'Mango', 'Grapes', 'Pomegranate', 'Other'
];

/* ── Password strength ── */
function getStrength(password) {
    if (!password) return { score: 0, label: '', color: '#e5e7eb' };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { score, label: 'Very Weak', color: '#ef4444' };
    if (score === 2) return { score, label: 'Weak', color: '#f97316' };
    if (score === 3) return { score, label: 'Fair', color: '#eab308' };
    if (score === 4) return { score, label: 'Strong', color: '#22c55e' };
    return { score, label: 'Very Strong', color: '#16a34a' };
}

/* ── Eye toggle icon ── */
const EyeIcon = ({ open }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {open
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

/* ── Field component ── */
const Field = ({ label, children, error, required }) => (
    <div style={styles.fieldGroup}>
        <label style={styles.label}>
            {label}
            {required && <span style={{ color: '#ef4444' }}> *</span>}
        </label>
        {children}
        {error && <span style={styles.fieldError}>{error}</span>}
    </div>
);

/* ── Main Component ── */
// Add this as the last step of registration form
const RoleSelectionStep = ({ onSelect, submitting, error }) => (
  <div style={{
    background: '#fff', padding: '24px 16px',
    maxWidth: 400, margin: '0 auto'
  }}>
    <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1B5E20',
      textAlign: 'center', marginBottom: 8 }}>
      I am a...
    </h2>
    <p style={{ textAlign: 'center', color: '#666', fontSize: 16,
      marginBottom: 24 }}>
      Choose your role to get started
    </p>

    {/* Farmer Card */}
    <div onClick={() => !submitting && onSelect('farmer')} style={{
      background: '#fff', border: '2px solid #E0E0E0',
      borderRadius: 16, padding: 20, marginBottom: 12,
      cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 16,
      transition: 'border-color 0.2s',
      opacity: submitting ? 0.7 : 1
    }}
    onMouseEnter={e => !submitting && (e.currentTarget.style.borderColor = '#2E7D32')}
    onMouseLeave={e => !submitting && (e.currentTarget.style.borderColor = '#E0E0E0')}>
      <span style={{ fontSize: 48 }}>🌾</span>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#1B5E20' }}>
          Farmer
        </div>
        <div style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
          Post jobs, find workers, tractors & transport
        </div>
      </div>
    </div>

    {/* Supplier Card */}
    <div onClick={() => !submitting && onSelect('supplier')} style={{
      background: '#fff', border: '2px solid #E0E0E0',
      borderRadius: 16, padding: 20, marginBottom: 12,
      cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 16,
      transition: 'border-color 0.2s',
      opacity: submitting ? 0.7 : 1
    }}
    onMouseEnter={e => !submitting && (e.currentTarget.style.borderColor = '#1565C0')}
    onMouseLeave={e => !submitting && (e.currentTarget.style.borderColor = '#E0E0E0')}>
      <span style={{ fontSize: 48 }}>🚜</span>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#1565C0' }}>
          Worker / Vehicle Owner
        </div>
        <div style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
          Browse jobs, apply, earn daily income
        </div>
      </div>
    </div>

    {error && (
        <div style={{ ...styles.errorBox, marginTop: 16 }}>
            <span>⚠️</span> {error}
        </div>
    )}

    {submitting && (
        <div style={{ textAlign: 'center', marginTop: 20, color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <div style={styles.spinner} /> Creating your account...
        </div>
    )}

    <p style={{ textAlign: 'center', fontSize: 13, color: '#999',
      marginTop: 16 }}>
      You can only choose once. Contact support to change.
    </p>
  </div>
);

export default function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [form, setForm] = useState({
        full_name: '',
        username: '',
        email: '',
        password: '',
        confirm_password: '',
        state: '',
        district: '',
        farm_size: '',
        primary_crop: ''
    });

    const [fieldErrors, setFieldErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [serverError, setServerError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [showRoleSelect, setShowRoleSelect] = useState(false);

    const strength = getStrength(form.password);

    const set = (key) => (e) => {
        setForm((prev) => ({ ...prev, [key]: e.target.value }));
        setFieldErrors((prev) => ({ ...prev, [key]: '' }));
        setServerError('');
    };

    const validate = () => {
        const errs = {};
        if (!form.full_name.trim()) errs.full_name = 'Full name is required';
        if (!form.username.trim()) {
            errs.username = 'Username is required';
        } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username)) {
            errs.username = '3-20 chars: letters, numbers, underscore';
        }
        if (!form.email.trim()) {
            errs.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            errs.email = 'Enter a valid email';
        }
        if (!form.password) {
            errs.password = 'Password is required';
        } else if (form.password.length < 8) {
            errs.password = 'Minimum 8 characters';
        }
        if (form.password !== form.confirm_password) {
            errs.confirm_password = 'Passwords do not match';
        }
        if (!form.state) errs.state = 'Please select your state';
        if (!form.district.trim()) errs.district = 'District is required';
        return errs;
    };

    const handleSubmit = async (e, roleOverride) => {
        if (e && e.preventDefault) e.preventDefault();
        setServerError('');

        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setFieldErrors(errs);
            // Scroll to first error
            const firstErr = document.querySelector('[data-field-error]');
            if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        const roleToUse = roleOverride || selectedRole;
        if (!roleToUse && showRoleSelect) {
            setServerError('Please select a role');
            return;
        }

        setSubmitting(true);
        const payload = {
            full_name: form.full_name.trim(),
            username: form.username.trim().toLowerCase(),
            email: form.email.trim().toLowerCase(),
            password: form.password,
            confirm_password: form.confirm_password,
            state: form.state,
            district: form.district.trim(),
            role: roleToUse,
            farm_size: form.farm_size || undefined,
            primary_crop: form.primary_crop || undefined
        };

        const result = await register(payload);
        setSubmitting(false);

        if (result.success) {
            if (!result.token) {
                setServerError('✅ Registration successful! Please check your email to verify your account before logging in.');
            } else {
                localStorage.setItem('rm_role', roleToUse);
                
                if (roleToUse === 'supplier') {
                    navigate('/booking?register=supplier', { replace: true });
                } else {
                    navigate('/dashboard', { replace: true });
                }
            }
        } else {
            if (result.errors) {
                setFieldErrors(result.errors);
            } else {
                setServerError(result.error || 'Registration failed. Please try again.');
            }
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
                        <div style={styles.brandSub}>Join 12.4M Farmers 🌾</div>
                    </div>
                </div>

                <h1 style={styles.heading}>Create Free Account</h1>
                <p style={styles.sub}>Your AI farming partner, forever free</p>

                {showRoleSelect ? (
                  <RoleSelectionStep 
                    onSelect={(role) => {
                      setSelectedRole(role);
                      handleSubmit(null, role); // Pass role directly to avoid state race
                    }} 
                    submitting={submitting}
                    error={serverError}
                  />
                ) : (
                <form onSubmit={(e) => {
                    e.preventDefault();
                    if (Object.keys(validate()).length === 0) {
                      setShowRoleSelect(true);
                    } else {
                      handleSubmit(e);
                    }
                }} style={styles.form} noValidate>
                    {/* ── Account Section ── */}
                    <div style={styles.sectionLabel}>── Account Details ──</div>

                    <Field label="Full Name" required error={fieldErrors.full_name}>
                        <div style={styles.inputWrap}>
                            <span style={styles.icon}>👤</span>
                            <input
                                id="reg-fullname"
                                type="text"
                                placeholder="e.g. Raju Yadav"
                                value={form.full_name}
                                onChange={set('full_name')}
                                style={inputStyle(fieldErrors.full_name)}
                                autoComplete="name"
                                autoFocus
                                disabled={submitting}
                                data-field-error={fieldErrors.full_name ? '1' : undefined}
                            />
                        </div>
                    </Field>

                    <Field label="Username" required error={fieldErrors.username}>
                        <div style={styles.inputWrap}>
                            <span style={styles.icon}>@</span>
                            <input
                                id="reg-username"
                                type="text"
                                placeholder="e.g. rajuyadav"
                                value={form.username}
                                onChange={set('username')}
                                style={inputStyle(fieldErrors.username)}
                                autoComplete="username"
                                disabled={submitting}
                            />
                        </div>
                        <span style={styles.hint}>3-20 chars, letters/numbers/underscore only</span>
                    </Field>

                    <Field label="Email" required error={fieldErrors.email}>
                        <div style={styles.inputWrap}>
                            <span style={styles.icon}>✉️</span>
                            <input
                                id="reg-email"
                                type="email"
                                placeholder="your@email.com"
                                value={form.email}
                                onChange={set('email')}
                                style={inputStyle(fieldErrors.email)}
                                autoComplete="email"
                                disabled={submitting}
                            />
                        </div>
                    </Field>

                    <Field label="Password" required error={fieldErrors.password}>
                        <div style={styles.inputWrap}>
                            <span style={styles.icon}>🔒</span>
                            <input
                                id="reg-password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Minimum 8 characters"
                                value={form.password}
                                onChange={set('password')}
                                style={{ ...inputStyle(fieldErrors.password), paddingRight: 44 }}
                                autoComplete="new-password"
                                disabled={submitting}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={styles.eyeBtn}
                                tabIndex={-1}
                            >
                                <EyeIcon open={showPassword} />
                            </button>
                        </div>
                        {/* Strength bar */}
                        {form.password && (
                            <div>
                                <div style={styles.strengthBar}>
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div
                                            key={i}
                                            style={{
                                                ...styles.strengthSegment,
                                                background: i <= strength.score ? strength.color : '#e5e7eb'
                                            }}
                                        />
                                    ))}
                                </div>
                                <span style={{ fontSize: 11, color: strength.color, fontWeight: 600 }}>
                                    {strength.label}
                                </span>
                            </div>
                        )}
                    </Field>

                    <Field label="Confirm Password" required error={fieldErrors.confirm_password}>
                        <div style={styles.inputWrap}>
                            <span style={styles.icon}>🔒</span>
                            <input
                                id="reg-confirm"
                                type={showConfirm ? 'text' : 'password'}
                                placeholder="Re-enter password"
                                value={form.confirm_password}
                                onChange={set('confirm_password')}
                                style={{ ...inputStyle(fieldErrors.confirm_password), paddingRight: 44 }}
                                autoComplete="new-password"
                                disabled={submitting}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                style={styles.eyeBtn}
                                tabIndex={-1}
                            >
                                <EyeIcon open={showConfirm} />
                            </button>
                        </div>
                        {form.confirm_password && !fieldErrors.confirm_password && form.password === form.confirm_password && (
                            <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 600 }}>✓ Passwords match</span>
                        )}
                    </Field>

                    {/* ── Farm Section ── */}
                    <div style={{ ...styles.sectionLabel, marginTop: 8 }}>── Farm Details ──</div>

                    <Field label="State" required error={fieldErrors.state}>
                        <select
                            id="reg-state"
                            value={form.state}
                            onChange={set('state')}
                            style={selectStyle(fieldErrors.state)}
                            disabled={submitting}
                        >
                            <option value="">Select your state…</option>
                            {STATES.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </Field>

                    <Field label="District" required error={fieldErrors.district}>
                        <div style={styles.inputWrap}>
                            <span style={styles.icon}>🏘️</span>
                            <input
                                id="reg-district"
                                type="text"
                                placeholder="Your district"
                                value={form.district}
                                onChange={set('district')}
                                style={inputStyle(fieldErrors.district)}
                                disabled={submitting}
                            />
                        </div>
                    </Field>

                    <Field label="Farm Size (acres)" error={fieldErrors.farm_size}>
                        <div style={styles.inputWrap}>
                            <span style={styles.icon}>🌾</span>
                            <input
                                id="reg-farmsize"
                                type="number"
                                min="0"
                                step="0.1"
                                placeholder="e.g. 5.5 (optional)"
                                value={form.farm_size}
                                onChange={set('farm_size')}
                                style={inputStyle(false)}
                                disabled={submitting}
                            />
                        </div>
                    </Field>

                    <Field label="Primary Crop" error={fieldErrors.primary_crop}>
                        <select
                            id="reg-crop"
                            value={form.primary_crop}
                            onChange={set('primary_crop')}
                            style={selectStyle(false)}
                            disabled={submitting}
                        >
                            <option value="">Select your main crop (optional)</option>
                            {CROPS.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </Field>

                    {/* Server error */}
                    {serverError && (
                        <div style={styles.errorBox}>
                            <span>⚠️</span> {serverError}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        id="reg-submit"
                        type="submit"
                        style={{
                            ...styles.btn,
                            opacity: submitting ? 0.7 : 1,
                            cursor: submitting ? 'not-allowed' : 'pointer'
                        }}
                        disabled={submitting}
                    >
                        {submitting && <span style={styles.spinner} />}
                        {submitting ? 'Creating Account...' : 'Create Free Account 🌾'}
                    </button>
                </form>
                )}

                <p style={styles.footerText}>
                    Already registered?{' '}
                    <Link to="/login" style={styles.link}>Login →</Link>
                </p>
            </div>

            <style>{`
        input:focus, select:focus { outline: none; border-color: #16a34a !important; box-shadow: 0 0 0 3px rgba(22,163,74,0.15) !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
}

/* ── Per-element style helpers ── */
const inputStyle = (hasError) => ({
    width: '100%',
    padding: '11px 14px 11px 40px',
    border: `1.5px solid ${hasError ? '#f87171' : '#e5e7eb'}`,
    borderRadius: 10,
    fontSize: 14,
    color: '#111827',
    background: hasError ? '#fef2f2' : '#fafafa',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s'
});

const selectStyle = (hasError) => ({
    width: '100%',
    padding: '11px 14px',
    border: `1.5px solid ${hasError ? '#f87171' : '#e5e7eb'}`,
    borderRadius: 10,
    fontSize: 14,
    color: '#111827',
    background: hasError ? '#fef2f2' : '#fafafa',
    boxSizing: 'border-box',
    cursor: 'pointer',
    transition: 'border-color 0.2s'
});

const styles = {
    page: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #f0fdf4 100%)',
        padding: '32px 16px',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Inter', -apple-system, sans-serif"
    },
    bgCircle1: {
        position: 'fixed',
        top: -120,
        right: -120,
        width: 450,
        height: 450,
        borderRadius: '50%',
        background: 'rgba(22,163,74,0.06)',
        pointerEvents: 'none'
    },
    bgCircle2: {
        position: 'fixed',
        bottom: -100,
        left: -100,
        width: 350,
        height: 350,
        borderRadius: '50%',
        background: 'rgba(22,163,74,0.04)',
        pointerEvents: 'none'
    },
    card: {
        background: '#ffffff',
        borderRadius: 20,
        padding: '40px 36px',
        width: '100%',
        maxWidth: 500,
        boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
        position: 'relative',
        zIndex: 1
    },
    brand: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 24
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
        fontSize: 22,
        fontWeight: 700,
        color: '#111827',
        margin: '0 0 4px 0'
    },
    sub: {
        fontSize: 13,
        color: '#6b7280',
        margin: '0 0 24px 0'
    },
    sectionLabel: {
        textAlign: 'center',
        fontSize: 12,
        fontWeight: 600,
        color: '#9ca3af',
        letterSpacing: '0.05em'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: 16
    },
    fieldGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: 5
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
    icon: {
        position: 'absolute',
        left: 12,
        fontSize: 14,
        pointerEvents: 'none',
        zIndex: 1
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
    hint: {
        fontSize: 11,
        color: '#9ca3af'
    },
    fieldError: {
        fontSize: 11,
        color: '#ef4444',
        fontWeight: 500
    },
    strengthBar: {
        display: 'flex',
        gap: 4,
        marginTop: 6,
        marginBottom: 2
    },
    strengthSegment: {
        flex: 1,
        height: 4,
        borderRadius: 2,
        transition: 'background 0.3s'
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
        marginTop: 8,
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
