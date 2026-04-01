import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDashboard } from '../../hooks/useDashboard';
import { cleanLocationName } from '../../utils/locationService';
import { getWeatherEmoji } from '../../utils/openWeather';
import LocationPopup from './LocationPopup';

/**
 * Native helper to format time ago (replaces date-fns)
 */
function formatDistanceToNow(date) {
  if (!date) return 'just now';
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
  return `${Math.floor(minutes / 1440)}d`;
}

// ─── Shared Components ─────────────────────────────────────────

function SectionHeader({ title, sub, onAction, actionLabel }) {
  return (
    <div className="flex justify-between items-end mb-4 px-1">
      <div>
        <p className="text-[10px] font-bold tracking-[1.5px] text-gray-400 uppercase mb-1">
          {title}
        </p>
        {sub && <p className="text-xs text-gray-500">{sub}</p>}
      </div>
      {onAction && (
        <button onClick={onAction} className="text-xs font-semibold text-green-600 hover:underline">
          {actionLabel || 'View all →'}
        </button>
      )}
    </div>
  );
}

function Skeleton({ className }) {
  return <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />;
}

function ErrorSection({ message, onRetry }) {
  return (
    <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
      <p className="text-red-600 text-sm font-medium">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-red-700 text-xs underline mt-2 hover:text-red-800 transition-colors">
          Tap to retry
        </button>
      )}
    </div>
  );
}

// ─── SECTION 1: HERO HEADER ────────────────────────────────────
function HeroSection({ user, location, weather, loading, onChangeLocation }) {
  const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Farmer';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const displayLoc = cleanLocationName(location);

  return (
    <div className="relative h-[260px] overflow-hidden rounded-b-[48px] shadow-2xl">
      <img
        src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1400&q=80"
        alt="Farm Field"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
      <div className="absolute inset-0 p-8 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="max-w-[70%]">
            <p className="text-white/80 text-sm font-medium mb-1 drop-shadow-md">{greeting},</p>
            <h1 className="text-white text-3xl font-bold tracking-tight drop-shadow-lg leading-tight">{name} 👋</h1>
            <div className="flex items-center gap-2 mt-3 group cursor-pointer" onClick={onChangeLocation}>
              <div className="bg-white/20 backdrop-blur-md p-1.5 rounded-full">
                <span className="text-sm">📍</span>
              </div>
              <span className="text-white/95 text-sm font-semibold drop-shadow-md">{displayLoc || 'Detecting Location...'}</span>
              <span className="text-white/50 text-[10px] group-hover:text-white transition-colors">Edit</span>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[30px] p-5 flex flex-col items-center min-w-[110px] shadow-xl">
            {loading ? (
              <div className="flex flex-col items-center gap-2">
                <Skeleton className="w-12 h-12 bg-white/10" />
                <Skeleton className="w-8 h-4 bg-white/10" />
              </div>
            ) : (
              <>
                <span className="text-4xl mb-1 filter drop-shadow-md">{getWeatherEmoji(weather?.condition)}</span>
                <span className="text-white text-3xl font-bold leading-none">{weather?.temperature ?? '—'}°</span>
                <span className="text-white/60 text-[10px] uppercase font-black tracking-[1.5px] mt-1">{weather?.condition || 'Clear'}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <div className="bg-green-500/90 backdrop-blur-md text-white text-[10px] font-black px-4 py-2 rounded-2xl uppercase tracking-[2px] border border-green-400/30 flex items-center gap-2 shadow-lg">
            <span className="animate-pulse">🌾</span> {new Date().getMonth() > 9 || new Date().getMonth() < 2 ? 'Rabi Season' : 'Kharif Season'}
          </div>
          <div className="bg-white/10 backdrop-blur-md text-white text-[10px] font-black px-4 py-2 rounded-2xl uppercase tracking-[2px] border border-white/20 shadow-lg">
            📅 {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SECTION 2: WEATHER ALERT BANNER ───────────────────────────
function WeatherAlerts({ weather }) {
  const alerts = useMemo(() => {
    if (!weather) return [];
    const list = [];
    const temp = weather.temperature;
    const humidity = weather.humidity;
    const wind = weather.wind_speed;

    if (temp > 36) list.push({
      type: 'danger', icon: '🌡️', title: `Heat stress risk — ${temp}°C`, action: 'Irrigate before 7am'
    });
    if (humidity < 30) list.push({
      type: 'warning', icon: '💧', title: 'Low humidity — crops need water', action: 'Check soil moisture today'
    });
    if (wind > 40) list.push({
      type: 'warning', icon: '🌬️', title: `High winds — ${wind} km/h`, action: 'Avoid spraying pesticides'
    });
    if (weather.condition?.toLowerCase().includes('rain')) list.push({
      type: 'info', icon: '🌧️', title: 'Rain expected', action: 'Ensure proper drainage'
    });
    return list;
  }, [weather]);

  if (alerts.length === 0) return null;

  return (
    <div className="px-6 mt-[-30px] relative z-20 space-y-3">
      {alerts.map((alert, i) => (
        <div key={i} className={`flex items-center gap-4 p-5 rounded-[24px] border shadow-xl backdrop-blur-xl transition-all hover:scale-[1.02] ${
          alert.type === 'danger' ? 'bg-red-50/95 border-red-100 text-red-900' : 
          alert.type === 'warning' ? 'bg-amber-50/95 border-amber-100 text-amber-900' : 
          'bg-blue-50/95 border-blue-100 text-blue-900'
        }`}>
          <div className={`p-3 rounded-2xl ${
            alert.type === 'danger' ? 'bg-red-500/10' : 
            alert.type === 'warning' ? 'bg-amber-500/10' : 
            'bg-blue-500/10'
          }`}>
            <span className="text-2xl">{alert.icon}</span>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-black uppercase tracking-tight">{alert.title}</h4>
            <p className="text-xs font-medium opacity-80 mt-0.5">{alert.action}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── SECTION 3: WEATHER STRIP ──────────────────────────────────
function WeatherStrip({ weather, loading, lastUpdated }) {
  if (loading) return (
    <div className="px-6 grid grid-cols-2 gap-4 mt-8">
      <Skeleton className="h-28 w-full shadow-sm" />
      <Skeleton className="h-28 w-full shadow-sm" />
    </div>
  );

  const items = [
    { label: 'Humidity', val: `${weather?.humidity || 0}%`, sub: weather?.humidity > 70 ? '⚠️ High' : '✓ Normal', icon: '💧', color: 'text-blue-600' },
    { label: 'Wind Speed', val: `${weather?.wind_speed || 0} km/h`, sub: weather?.wind_speed > 25 ? '⚠️ No Spray' : '✓ Safe', icon: '🌬️', color: 'text-amber-600' },
    { label: 'Visibility', val: `${weather?.visibility || 0} km`, sub: weather?.visibility > 5 ? '✓ Best' : '⚠️ Low', icon: '👁️', color: 'text-indigo-600' },
    { label: 'Pressure', val: `${weather?.pressure || 0} mb`, sub: 'Atmospheric', icon: '📈', color: 'text-gray-600' },
  ];

  return (
    <div className="px-6 mt-8">
      <SectionHeader 
        title="Current Conditions" 
        sub={`Updated ${lastUpdated ? formatDistanceToNow(new Date(lastUpdated)) : 'refreshing...'} ago`} 
      />
      <div className="bg-white border border-gray-100 rounded-[32px] p-7 shadow-sm grid grid-cols-2 gap-y-8 gap-x-6">
        {items.map(item => (
          <div key={item.label} className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl bg-gray-50 ${item.color}`}>
              <span className="text-xl">{item.icon}</span>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[1.5px] mb-1">{item.label}</p>
              <p className="text-xl font-black text-gray-900 leading-none">{item.val}</p>
              <p className={`text-[10px] font-black uppercase mt-1.5 tracking-wider ${item.sub.includes('⚠️') ? 'text-amber-500' : 'text-green-500'}`}>
                {item.sub}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SECTION 4: MANDI PRICES ───────────────────────────────────
function MandiPrices({ prices, loading, error, onRetry }) {
  if (loading) return (
    <div className="px-6 mt-10 space-y-4">
      <SectionHeader title="Live Mandi Prices" />
      <Skeleton className="h-20 w-full rounded-[24px]" />
      <Skeleton className="h-20 w-full rounded-[24px]" />
    </div>
  );

  if (error) return <div className="px-6 mt-10"><ErrorSection message={error} onRetry={onRetry} /></div>;

  if (prices.length === 0) return null;

  return (
    <div className="px-6 mt-10">
      <SectionHeader title="Live Mandi Prices" actionLabel="Full Market →" />
      <div className="bg-white border border-gray-100 rounded-[32px] shadow-sm overflow-hidden">
        {prices.map((p, i) => (
          <div key={i} className={`flex items-center justify-between p-6 ${i !== prices.length-1 ? 'border-b border-gray-50' : ''}`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-xl">
                {p.commodity === 'Paddy' ? '🌾' : p.commodity === 'Wheat' ? '🌾' : p.commodity === 'Onion' ? '🧅' : '🌱'}
              </div>
              <div>
                <p className="font-black text-gray-900 text-lg leading-tight">{p.commodity}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">📍 {p.market}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex flex-col items-end">
                <span className="text-green-600 font-black text-xl leading-none">₹{(p.modalPrice/100).toFixed(1)}/kg</span>
                <div className="flex items-center gap-1 mt-1.5">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Today</span>
                  <span className="text-[10px] text-green-500 font-bold">↑ 2.4%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SECTION 5: AI ADVISORIES ──────────────────────────────────
function AIAdvisories({ advisories, loading, error, onRetry }) {
  if (loading) return (
    <div className="px-6 mt-10 space-y-5">
      <SectionHeader title="AI Advisories" />
      <Skeleton className="h-40 w-full rounded-[32px]" />
    </div>
  );

  if (error) return <div className="px-6 mt-10"><ErrorSection message={error} onRetry={onRetry} /></div>;

  if (advisories.length === 0) return null;

  return (
    <div className="px-6 mt-10">
      <SectionHeader title="Recent AI Advisories" actionLabel="All Advisories →" />
      <div className="space-y-4">
        {advisories.slice(0, 3).map((adv, i) => (
          <div key={i} className="group bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm transition-all hover:shadow-lg hover:border-green-100 cursor-pointer">
            <div className="flex justify-between items-center mb-4">
              <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-wider ${
                adv.category === 'disease_alert' ? 'bg-red-50 text-red-600' : 
                adv.category === 'weather_advisory' ? 'bg-blue-50 text-blue-600' :
                'bg-green-50 text-green-600'
              }`}>
                {adv.category?.replace(/_/g, ' ') || 'Advisory'}
              </span>
              <span className="text-[10px] text-gray-400 font-bold">{adv.time}</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed font-bold group-hover:text-gray-900 transition-colors">
              {adv.text?.length > 140 ? adv.text.substring(0, 140) + '...' : adv.text}
            </p>
            {adv.text?.length > 140 && <button className="text-green-600 text-xs font-black mt-4 group-hover:translate-x-1 transition-transform inline-block">Read more →</button>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SECTION 6: QUICK ACTIONS ──────────────────────────────────
function QuickActions({ navigate }) {
  const actions = [
    { label: 'Crop AI', icon: '🌱', route: '/crop', color: 'bg-green-50 text-green-700 border-green-100' },
    { label: 'Disease Scan', icon: '🔬', route: '/disease', color: 'bg-red-50 text-red-700 border-red-100' },
    { label: 'Mandi Prices', icon: '📊', route: '/market', color: 'bg-amber-50 text-amber-700 border-amber-100' },
    { label: 'Work', icon: '💼', route: '/work', color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
    { label: 'Weather', icon: '🌤️', route: '/weather', color: 'bg-blue-50 text-blue-700 border-blue-100' },
  ];

  return (
    <div className="px-6 mt-10">
      <SectionHeader title="Quick Actions" />
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-2 px-2">
        {actions.map(action => (
          <button 
            key={action.label} 
            onClick={() => navigate(action.route)}
            className={`flex flex-col items-center justify-center p-6 rounded-[32px] min-w-[115px] border shrink-0 transition-all active:scale-90 hover:shadow-md ${action.color}`}
          >
            <div className="text-3xl mb-3 shadow-md bg-white/50 w-12 h-12 flex items-center justify-center rounded-2xl">{action.icon}</div>
            <span className="text-[12px] font-black text-center leading-tight uppercase tracking-tight">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── SECTION 7: REAL USER STATS ────────────────────────────────
function UserStats({ profile, user }) {
  if (!profile?.farm_size_acres && !profile?.disease_scan_count) {
    return null;
  }

  const stats = [
    { label: 'Farm Size', value: profile?.farm_size_acres ? `${profile.farm_size_acres} ac` : 'Link Farm', icon: '🚜', color: 'bg-emerald-50' },
    { label: 'Disease Scans', value: profile?.disease_scan_count ?? 0, icon: '🔬', color: 'bg-rose-50' },
    { label: 'Member Since', value: new Date(user?.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }), icon: '🌱', color: 'bg-sky-50' },
    { label: 'Saved Reports', value: profile?.reports_saved ?? 0, icon: '📋', color: 'bg-indigo-50' },
  ];

  return (
    <div className="px-6 mt-10">
      <SectionHeader title="Your Farm Intelligence" />
      <div className="grid grid-cols-2 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-xl ${s.color}`}>
                <span className="text-lg">{s.icon}</span>
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[1.5px] leading-tight">{s.label}</p>
            </div>
            <p className="text-2xl font-black text-gray-900 tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SECTION 8: FARMING TIPS ──────────────────────────────────
function FarmingTips({ advisories, loading }) {
  if (loading) return null;
  
  if (advisories.length === 0) return null;

  return (
    <div className="px-6 mt-10 pb-40">
      <SectionHeader title="Expert Context" />
      <div className="space-y-4">
        {advisories.filter(a => a.category === 'crop_recommendation' || a.category === 'general_tip').map((tip, i) => (
          <div key={i} className="flex items-start gap-4 bg-green-900 border border-green-800 rounded-[32px] p-7 shadow-2xl">
            <div className="bg-green-800 p-3 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">💡</span>
            </div>
            <p className="text-sm text-green-50 font-bold leading-relaxed">{tip.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────
export default function FarmerHomeScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    weather, 
    location, 
    mandiPrices, 
    advisories, 
    profile, 
    loading, 
    errors, 
    lastUpdated,
    refresh,
    refreshWeather,
    refreshMandi,
    refreshAdvisories
  } = useDashboard();

  const [showLocationPopup, setShowLocationPopup] = useState(false);

  // Filter to remove empty or placeholder advisories (ZERO DUMMY DATA RULE)
  const validAdvisories = useMemo(() => {
    return advisories.filter(a => a.text && a.text.trim() !== '' && a.text !== 'AI advisory' && a.text !== 'Dashboard advisory');
  }, [advisories]);

  return (
    <div className="min-h-screen bg-gray-50/50 pb-10 font-DM-Sans selection:bg-green-100">
      {showLocationPopup && (
        <LocationPopup onLocationSet={(loc) => {
          setShowLocationPopup(false);
          refresh();
        }} />
      )}

      <div className="max-w-2xl mx-auto bg-white min-h-screen shadow-[0_0_80px_rgba(0,0,0,0.03)] border-x border-gray-100">
        <HeroSection 
          user={user} 
          location={location} 
          weather={weather} 
          loading={loading.weather} 
          onChangeLocation={() => setShowLocationPopup(true)} 
        />

        <div className="pb-10">
          <WeatherAlerts weather={weather} />
          
          <WeatherStrip 
            weather={weather} 
            loading={loading.weather} 
            lastUpdated={lastUpdated.weather} 
          />

          <QuickActions navigate={navigate} />

          <FarmingTips advisories={validAdvisories} loading={loading.advisories} />
        </div>
      </div>
    </div>
  );
}
