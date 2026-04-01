import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getWeatherEmoji } from '../../utils/openWeather';
import { getCachedWeather, getFarmerCity } from '../../utils/locationService';
import { supabase } from '../../utils/supabaseClient';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
    { label: 'Home',    path: '/dashboard' },
    { label: 'Crops',   path: '/crop' },
    { label: 'Disease', path: '/disease' },
    { label: 'Market',  path: '/market' },
    { label: 'Weather', path: '/weather' },
    { label: 'Work',    path: '/work' },
    { label: 'Profile', path: '/profile' },
];

export default function DashboardHeader({ onMenuClick, owWeather, displayLocation }) {
    const location = useLocation();
    const navigate  = useNavigate();
    const { user }  = useAuth();

    const weatherData = owWeather || getCachedWeather();
    const cityName    = displayLocation || getFarmerCity() || '';

    // User greeting & initial
    const farmerName =
        user?.user_metadata?.full_name ||
        user?.user_metadata?.name ||
        user?.name ||
        user?.full_name ||
        user?.first_name ||
        user?.username ||
        'Farmer';
    const initial = farmerName.charAt(0).toUpperCase();

    function getGreeting() {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 17) return 'Good afternoon';
        return 'Good evening';
    }

    // Active detection
    const isActive = (path) =>
        location.pathname === path ||
        location.pathname.startsWith(path + '/');

    // ── Notifications ──────────────────────────────────────────────
    const [showNotif, setShowNotif] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const notifRef = useRef(null);

    // Fetch recent notifications from Supabase on mount
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // Try job_applications status changes first (selection events)
                const { data: apps } = await supabase
                    .from('job_applications')
                    .select('id, status, applied_at, job_post_id')
                    .eq('supplier_id', user.id)
                    .in('status', ['hired', 'rejected'])
                    .order('applied_at', { ascending: false })
                    .limit(10);

                if (apps && apps.length > 0) {
                    const notifs = apps.map(a => ({
                        id: a.id,
                        title: a.status === 'rejected'
                            ? `Application not selected`
                            : `You have been selected for a job!`,
                        subtitle: '',
                        type: a.status === 'hired' ? 'success' : 'info',
                        time: a.applied_at,
                    }));
                    setNotifications(notifs);
                    setUnreadCount(notifs.length);
                } else {
                    setNotifications([]);
                    setUnreadCount(0);
                }
            } catch (e) {
                console.error('Notification fetch failed:', e);
            }
        };

        fetchNotifications();
    }, []);

    // Close on outside click
    useEffect(() => {
        const handleOutside = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setShowNotif(false);
            }
        };
        if (showNotif) document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, [showNotif]);

    const handleBellClick = () => {
        setShowNotif(v => !v);
        // Mark as read when opening
        if (!showNotif) setUnreadCount(0);
    };

    const timeAgo = (ts) => {
        const diff = Date.now() - new Date(ts).getTime();
        const h = Math.floor(diff / 3600000);
        if (h < 1) return 'Just now';
        if (h < 24) return `${h}h ago`;
        return `${Math.floor(h / 24)}d ago`;
    };
    // ──────────────────────────────────────────────────────────────

    return (
        <>
            {/* ── GREEN TOP HEADER BAR ─────────────────────────── */}
            <header className="sticky top-0 z-30 bg-green-700 w-full px-4 py-3 flex items-center justify-between">
                {/* LEFT: Logo + Title */}
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-base flex-shrink-0">
                        🌿
                    </div>
                    <div>
                        <p className="text-white font-semibold text-base leading-tight">Rythu Mitra</p>
                        <p className="text-green-200 text-xs">{getGreeting()}, {farmerName.split(' ')[0]}</p>
                    </div>
                </div>

                {/* RIGHT: Weather + Bell + Avatar */}
                <div className="flex items-center gap-2">
                    {/* Weather pill */}
                    <div className="bg-white/15 rounded-full px-3 py-1 flex items-center gap-1.5">
                        <span className="text-base leading-none">
                            {getWeatherEmoji(weatherData?.condition)}
                        </span>
                        <span className="text-white text-sm font-medium">
                            {weatherData?.temperature != null
                                ? `${Math.round(weatherData.temperature)}°C`
                                : '—°C'}
                        </span>
                    </div>

                    {/* Notification Bell */}
                    <div className="relative" ref={notifRef}>
                        <button
                            onClick={handleBellClick}
                            className="w-8 h-8 bg-white/15 rounded-full flex items-center justify-center relative"
                            aria-label="Notifications"
                        >
                            <Bell className="w-4 h-4 text-white" />
                            {unreadCount > 0 && (
                                <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-red-500 text-[10px] text-white font-bold flex items-center justify-center">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {showNotif && (
                            <div className="absolute right-0 top-[44px] w-80 max-w-[calc(100vw-2rem)] bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-50"
                                style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
                                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                                    <h5 className="text-sm font-bold text-gray-800">Notifications</h5>
                                    {notifications.length > 0 && (
                                        <button
                                            onClick={() => setNotifications([])}
                                            className="text-sm text-green-700 hover:underline"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                </div>
                                {notifications.length > 0 ? notifications.map(n => (
                                    <div key={n.id} className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                                        <div className="flex items-start gap-3">
                                            <span className="text-lg mt-0.5">
                                                {n.type === 'success' ? '✅' : 'ℹ️'}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-800 font-medium leading-snug">{n.title}</p>
                                                {n.subtitle && (
                                                    <p className="text-sm text-gray-500 mt-0.5">{n.subtitle}</p>
                                                )}
                                                <p className="text-sm text-gray-400 mt-1">{timeAgo(n.time)}</p>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="px-4 py-8 text-center">
                                        <div className="text-3xl mb-2">🔔</div>
                                        <p className="text-sm text-gray-500">No new notifications</p>
                                        <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {initial}
                    </div>
                </div>
            </header>

            {/* ── FLOATING PILL NAV BAR ────────────────────────── */}
            <div className="bg-green-50 px-4 py-2.5 border-b border-green-100 sticky top-[52px] z-20">
                <div className="flex items-center gap-1 bg-green-100/60 p-1 rounded-full overflow-x-auto scrollbar-hide max-w-fit mx-auto">
                    {NAV_ITEMS.map(item => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                                isActive(item.path)
                                    ? 'bg-green-700 text-white shadow-sm'
                                    : 'text-green-800 hover:bg-green-200/60'
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}


