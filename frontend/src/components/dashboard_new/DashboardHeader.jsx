import React, { useState, useEffect, useRef } from 'react';
import { Menu, Search, Bell, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { getWeatherEmoji } from '../../utils/openWeather';
import { getCachedWeather, getFarmerCity } from '../../utils/locationService';
import { supabase } from '../../utils/supabaseClient';

export default function DashboardHeader({ onMenuClick, owWeather, displayLocation }) {
    const location = useLocation();

    // Logic for dynamic title
    const isBookingPage = location.pathname.startsWith('/booking');
    const title = isBookingPage ? 'Booking System' : 'Overview';
    const subtitle = isBookingPage ? 'Equipment, Expert & Supply Bookings' : 'Dashboard › Overview';

    const weatherData = owWeather || getCachedWeather();
    const cityName    = displayLocation || getFarmerCity() || '';

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
                    .select('id, status, created_at, job_post_id')
                    .eq('supplier_id', user.id)
                    .in('status', ['hired', 'rejected'])
                    .order('created_at', { ascending: false })
                    .limit(10);

                if (apps && apps.length > 0) {
                    const notifs = apps.map(a => ({
                        id: a.id,
                        title: a.status === 'rejected'
                            ? `Application not selected`
                            : `You have been selected for a job!`,
                        subtitle: '',
                        type: a.status === 'hired' ? 'success' : 'info',
                        time: a.created_at,
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
            {/* Header */}
            <header className="sticky top-0 z-30 border-b border-border" style={{
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 1px 20px rgba(0,0,0,0.06)',
                height: 72,
            }}>
                <div className="flex items-center h-full px-6 gap-4">
                    <button
                        onClick={onMenuClick}
                        style={{
                            width: 44, height: 44, borderRadius: 8, flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'transparent', border: 'none', cursor: 'pointer',
                        }}
                        className="hover:bg-gray-100 transition-colors"
                        aria-label="Open menu"
                    >
                        <Menu className="w-5 h-5 text-foreground" />
                    </button>

                    <div className="hidden md:block">
                        <h2 className="text-xl font-bold text-foreground tracking-tight">{title}</h2>
                        <p className="text-[13px] text-muted-foreground">{subtitle}</p>
                    </div>

                    {/* Search */}
                    <div className="flex-1 max-w-[360px] mx-auto">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search crops, markets, weather..."
                                className="farm-input pl-10 py-2 text-sm rounded-[10px] bg-gray-100 border-gray-200"
                            />
                        </div>
                    </div>

                    {/* Right items */}
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium" style={{
                            background: 'hsl(138 76% 97%)',
                            border: '1px solid hsl(141 84% 93%)',
                            color: 'hsl(142 72% 36%)',
                        }}>
                            <span style={{ fontSize: 16 }}>
                                {getWeatherEmoji(weatherData?.condition)}
                            </span>
                            <span>
                                {weatherData?.temperature != null
                                ? `${Math.round(weatherData.temperature)}°C`
                                : '—°C'}
                                {' '}
                                {cityName.split(',')[0]}
                            </span>
                        </div>

                        {/* ── Notification Bell ── */}
                        <div className="relative" ref={notifRef}>
                            <button
                                onClick={handleBellClick}
                                className="relative w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                                aria-label="Notifications"
                            >
                                <Bell className="w-5 h-5 text-gray-600" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] text-white font-bold flex items-center justify-center">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {showNotif && (
                                <div className="absolute right-0 top-[52px] w-80 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-50"
                                    style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
                                    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                                        <h5 className="text-[13px] font-bold text-gray-800">Notifications</h5>
                                        {notifications.length > 0 && (
                                            <button
                                                onClick={() => setNotifications([])}
                                                className="text-[11px] text-green-700 hover:underline"
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
                                                    <p className="text-[13px] text-gray-800 font-medium leading-snug">{n.title}</p>
                                                    {n.subtitle && (
                                                        <p className="text-[11px] text-gray-500 mt-0.5">{n.subtitle}</p>
                                                    )}
                                                    <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.time)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="px-4 py-8 text-center">
                                            <div className="text-3xl mb-2">🔔</div>
                                            <p className="text-[13px] text-gray-500">No new notifications</p>
                                            <p className="text-[11px] text-gray-400 mt-1">You're all caught up!</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {/* ──────────────────────── */}

                        <button className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-sm" style={{
                            background: 'linear-gradient(135deg, #d97706, #f59e0b)',
                        }}>
                            R
                        </button>
                    </div>
                </div>
            </header>
        </>
    );
}


