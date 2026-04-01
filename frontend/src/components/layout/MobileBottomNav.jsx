import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
    { icon: '📊', label: 'Home', path: '/dashboard' },
    { icon: '🌾', label: 'Crops', path: '/crop' },
    { icon: '🔬', label: 'Disease', path: '/disease' },
    { icon: '📈', label: 'Market', path: '/market' },
    { icon: '☁️', label: 'Weather', path: '/weather' },
    { icon: '📋', label: 'Work', path: '/work' },
    { icon: '👤', label: 'Profile', path: '/profile' }
];

export default function MobileBottomNav() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50 min-h-[64px] flex items-center px-2 overflow-x-auto no-scrollbar md:hidden" style={{ WebkitOverflowScrolling: 'touch' }}>
            {NAV_ITEMS.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                    <button
                        key={item.label}
                        onClick={() => navigate(item.path)}
                        aria-label={item.label}
                        className={`flex flex-col flex-1 items-center justify-center py-2 h-full min-h-[64px] min-w-[62px] relative transition-colors ${isActive ? 'text-[#15803d]' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <span className="text-2xl mt-1 leading-none flex items-center justify-center h-7" aria-hidden="true">{item.icon}</span>
                        <span className="text-[11px] font-medium mt-1 w-full text-center tracking-tight truncate px-0.5">
                            {item.label}
                        </span>
                        {isActive && (
                            <motion.div
                                layoutId="bottomNavIndicator"
                                className="absolute top-0 w-8 h-[3px] bg-[#15803d] rounded-b-full"
                            />
                        )}
                    </button>
                );
            })}
        </nav>
    );
}
