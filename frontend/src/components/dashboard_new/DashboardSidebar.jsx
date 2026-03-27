import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * DashboardSidebar — full-screen slide-in sidebar for the Rythu Mitra dashboard.
 * Opens when the hamburger menu is clicked in DashboardHeader.
 */

const NAV_SECTIONS = [
    {
        label: 'AI Services',
        items: [
            { emoji: '🌱', label: 'Crop Recommendation', path: '/crop',    desc: 'AI crop advisory' },
            { emoji: '🔬', label: 'Disease Detection',   path: '/disease', desc: 'Photo scan & diagnosis' },
            { emoji: '📊', label: 'Market Prices',       path: '/market',  desc: 'Live APMC prices' },
            { emoji: '🌤️', label: 'Weather Forecast',   path: '/weather', desc: '7-day farming forecast' },
        ],
    },
    {
        label: 'Services',
        items: [
            { emoji: '📋', label: 'Booking System', path: '/booking', desc: 'Equipment, experts, supplies' },
        ],
    },
    {
        label: 'Schemes & Account',
        items: [
            { emoji: '🏛️', label: 'Govt Schemes', path: '/governance', desc: 'Subsidies & schemes' },
            { emoji: '👤', label: 'My Profile',   path: '/profile',    desc: 'Your farm profile' },
            { emoji: '⚙️', label: 'Settings',     path: '/settings',   desc: 'App preferences' },
        ],
    },
];

export default function DashboardSidebar({ isOpen, onClose }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const farmerName = user?.name || user?.full_name || user?.first_name || user?.username || 'Farmer';
    const farmerEmail = user?.email || '';

    function handleNav(path) {
        navigate(path);
        onClose();
    }

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    onClick={onClose}
                    style={{
                        position:   'fixed',
                        inset:      0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex:     100,
                        backdropFilter: 'blur(2px)',
                    }}
                />
            )}

            {/* Sidebar panel */}
            <div style={{
                position:   'fixed',
                top:        0,
                left:       0,
                bottom:     0,
                width:      280,
                background: '#ffffff',
                zIndex:     101,
                overflowY:  'auto',
                transform:  isOpen ? 'translateX(0)' : 'translateX(-100%)',
                transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
                boxShadow:  isOpen ? '4px 0 32px rgba(0,0,0,0.12)' : 'none',
                display:    'flex',
                flexDirection: 'column',
            }}>
                {/* Header */}
                <div style={{
                    background:  'linear-gradient(135deg, #15803d, #16a34a)',
                    padding:     '28px 20px 24px',
                    color:       '#ffffff',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <span style={{ fontSize: 22 }}>🌾</span>
                                <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.2px' }}>
                                    Rythu Mitra
                                </span>
                            </div>
                            <div style={{
                                width:        40, height: 40, borderRadius: '50%',
                                background:   'rgba(255,255,255,0.25)',
                                display:      'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize:     18, fontWeight: 700, marginBottom: 8,
                            }}>
                                {farmerName[0]?.toUpperCase() || 'F'}
                            </div>
                            <p style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{farmerName}</p>
                            {farmerEmail && (
                                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', margin: '2px 0 0' }}>
                                    {farmerEmail}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                background:   'rgba(255,255,255,0.2)',
                                border:       '1px solid rgba(255,255,255,0.3)',
                                borderRadius: 8,
                                color:        '#ffffff',
                                width:        32, height: 32,
                                display:      'flex', alignItems: 'center', justifyContent: 'center',
                                cursor:       'pointer', fontSize: 16, flexShrink: 0,
                            }}
                        >
                            ✕
                        </button>
                    </div>

                    {/* Dashboard shortcut */}
                    <button
                        onClick={() => handleNav('/dashboard')}
                        style={{
                            marginTop:    12,
                            background:   'rgba(255,255,255,0.15)',
                            border:       '1px solid rgba(255,255,255,0.25)',
                            borderRadius: 10,
                            color:        '#ffffff',
                            padding:      '8px 14px',
                            fontSize:     13,
                            fontWeight:   600,
                            cursor:       'pointer',
                            width:        '100%',
                            textAlign:    'left',
                            display:      'flex',
                            alignItems:   'center',
                            gap:          8,
                        }}
                    >
                        <span>📊</span> Go to Dashboard
                    </button>
                </div>

                {/* Nav sections */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 24px' }}>
                    {NAV_SECTIONS.map((section) => (
                        <div key={section.label} style={{ marginBottom: 8 }}>
                            <p style={{
                                fontSize:      10,
                                fontWeight:    700,
                                color:         '#9ca3af',
                                letterSpacing: '0.08em',
                                padding:       '8px 8px 4px',
                                margin:        0,
                            }}>
                                {section.label.toUpperCase()}
                            </p>
                            {section.items.map((item) => {
                                const isActive = location.pathname.startsWith(item.path);
                                return (
                                    <button
                                        key={item.path}
                                        onClick={() => handleNav(item.path)}
                                        style={{
                                            width:            '100%',
                                            display:          'flex',
                                            alignItems:       'center',
                                            gap:              12,
                                            padding:          '10px 10px',
                                            borderRadius:     10,
                                            border:           'none',
                                            background:       isActive ? '#f0fdf4' : 'transparent',
                                            cursor:           'pointer',
                                            textAlign:        'left',
                                            transition:       'background 0.15s',
                                            borderLeft:       isActive ? '3px solid #16a34a' : '3px solid transparent',
                                            marginBottom:     2,
                                        }}
                                        onMouseEnter={e => {
                                            if (!isActive) e.currentTarget.style.background = '#f9fafb';
                                        }}
                                        onMouseLeave={e => {
                                            if (!isActive) e.currentTarget.style.background = 'transparent';
                                        }}
                                    >
                                        <span style={{
                                            fontSize:   20,
                                            width:      32,
                                            height:     32,
                                            display:    'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: isActive ? '#dcfce7' : '#f3f4f6',
                                            borderRadius: 8,
                                            flexShrink: 0,
                                        }}>
                                            {item.emoji}
                                        </span>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{
                                                fontSize:   13,
                                                fontWeight: isActive ? 700 : 600,
                                                color:      isActive ? '#15803d' : '#111827',
                                                margin:     0,
                                            }}>
                                                {item.label}
                                            </p>
                                            <p style={{
                                                fontSize:  11,
                                                color:     '#9ca3af',
                                                margin:    '1px 0 0',
                                                overflow:  'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}>
                                                {item.desc}
                                            </p>
                                        </div>
                                        {isActive && (
                                            <span style={{ fontSize: 10, color: '#16a34a', fontWeight: 700 }}>
                                                ●
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div style={{
                    borderTop: '1px solid #f3f4f6',
                    padding:   '14px 16px',
                }}>
                    <button
                        onClick={() => { logout(); }}
                        style={{
                            width:        '100%',
                            background:   '#fef2f2',
                            border:       '1px solid #fecaca',
                            borderRadius: 10,
                            color:        '#dc2626',
                            padding:      '10px 14px',
                            fontSize:     13,
                            fontWeight:   600,
                            cursor:       'pointer',
                            display:      'flex',
                            alignItems:   'center',
                            gap:          8,
                        }}
                    >
                        <span>🚪</span> Logout
                    </button>
                    <p style={{
                        textAlign: 'center',
                        fontSize:  10,
                        color:     '#9ca3af',
                        marginTop: 10,
                        marginBottom: 0,
                    }}>
                        Rythu Mitra v2.0 · Built for Indian Farmers
                    </p>
                </div>
            </div>
        </>
    );
}
