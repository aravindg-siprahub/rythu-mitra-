import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
    { icon: '📊', label: 'Home', path: '/dashboard' },
    { icon: '🌾', label: 'Crops', path: '/crop' },
    { icon: '🔬', label: 'Disease', path: '/disease' },
    { icon: '📈', label: 'Market', path: '/market' },
    { icon: '☁️', label: 'Weather', path: '/weather' },
    { icon: '📋', label: 'Booking', path: '/booking' },
    { icon: '👤', label: 'Profile', path: '/profile' }
];

export default function MobileBottomNav() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
            background: 'var(--surface, #ffffff)', borderTop: '1px solid var(--border, #e5e7eb)',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.08)', height: 64,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 8px', overflowX: 'auto', WebkitOverflowScrolling: 'touch'
        }} className="md:hidden"> {/* Only show on md:hidden (mobile) or adjust based on design. Currently visible globally on mobile */}
            {NAV_ITEMS.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                    <button
                        key={item.label}
                        onClick={() => navigate(item.path)}
                        style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            gap: 2, padding: '4px 8px', background: 'transparent', border: 'none',
                            cursor: 'pointer', minWidth: 60, position: 'relative'
                        }}
                    >
                        <span style={{ fontSize: 20 }}>{item.icon}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: isActive ? '#16a34a' : '#64748b' }}>
                            {item.label}
                        </span>
                        {isActive && (
                            <motion.div
                                layoutId="mobileBottomNav"
                                style={{
                                    position: 'absolute', top: -4, width: '40%', height: 3,
                                    background: '#16a34a', borderRadius: '0 0 4px 4px'
                                }}
                            />
                        )}
                    </button>
                );
            })}
        </div>
    );
}
