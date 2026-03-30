import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/apiService';
import { useWeather } from '../../modules/weather/hooks/useWeather';
import { 
  getSavedLocation, 
  isLocationFresh,
  cleanLocationName
} from '../../utils/locationService';
import LocationPopup from './LocationPopup';
import { fetchOpenWeather, getWeatherEmoji } from '../../utils/openWeather';

// ─── Design tokens ─────────────────────────────────────────────
const RM = {
    green:       '#16a34a',
    greenLight:  '#f0fdf4',
    greenBorder: '#bbf7d0',
    greenMid:    '#15803d',
    amber:       '#d97706',
    amberLight:  '#fffbeb',
    blue:        '#1d4ed8',
    blueLight:   '#eff6ff',
    red:         '#dc2626',
    redLight:    '#fef2f2',
    purple:      '#7c3aed',
    purpleLight: '#f5f3ff',
    white:       '#ffffff',
    gray50:      '#f9fafb',
    gray100:     '#f3f4f6',
    gray200:     '#e5e7eb',
    gray400:     '#9ca3af',
    gray600:     '#6b7280',
    gray900:     '#111827',
    dark:        '#1a1a1a',
};

// ─── Utilities ─────────────────────────────────────────────────
function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning,';
    if (h < 17) return 'Good afternoon,';
    return 'Good evening,';
}

function getCurrentSeason() {
    const m = new Date().getMonth() + 1;
    if (m >= 11 || m <= 2) return 'Rabi Season';
    if (m >= 3  && m <= 5) return 'Zaid Season';
    return 'Kharif Season';
}

// ─── Advisory labels ───────────────────────────────────────────
const ADVISORY_LABELS = {
    weather_advisory:    { label: 'Weather Alert', color: RM.blue,   bg: RM.blueLight,   dot: RM.blue   },
    crop_recommendation: { label: 'Crop Tip',      color: RM.green,  bg: RM.greenLight,  dot: RM.green  },
    market_price:        { label: 'Market Update', color: RM.amber,  bg: RM.amberLight,  dot: RM.amber  },
    disease_alert:       { label: 'Disease Alert', color: RM.red,    bg: RM.redLight,    dot: RM.red    },
    government_scheme:   { label: 'Scheme',        color: RM.purple, bg: RM.purpleLight, dot: RM.purple },
};

// ─── Quick action cards (routes from App.js audit) ────────────
const ACTIONS = [
    { emoji: '🌱', label: 'Crop AI',  desc: 'Best crop for your soil', route: '/crop',    iconBg: RM.greenLight  },
    { emoji: '🔬', label: 'Disease',  desc: 'Scan your crop photo',    route: '/disease', iconBg: RM.redLight    },
    { emoji: '📊', label: 'Market',   desc: 'Live APMC prices',        route: '/market',  iconBg: RM.amberLight  },
    { emoji: '🌤️', label: 'Weather',  desc: '7-day forecast',          route: '/weather', iconBg: RM.blueLight   },
    { emoji: '📋', label: 'Booking',  desc: 'Equipment, experts, supplies', route: '/booking', iconBg: RM.purpleLight },
];

// ─── Sub-component: HeroSection ────────────────────────────────
function HeroSection({ greeting, name, district, temp, condition, weatherEmoji, isLoading, isError, onRetry, onChangeLocation }) {
    return (
        <div style={styles.hero}>
            <img
                src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1400&q=80"
                alt="paddy field"
                style={styles.heroImg}
            />
            <div style={styles.heroOverlay} />
            <div style={styles.heroContent}>
                <div style={styles.heroTop}>
                    <div>
                        <p style={styles.greeting}>{greeting}</p>
                        <h1 style={styles.farmerName}>{name} 👋</h1>
                        <p style={styles.location}>
                            📍 {district}
                            <button 
                                onClick={onChangeLocation}
                                style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    borderRadius: 8,
                                    color: 'rgba(255,255,255,0.9)',
                                    fontSize: 10,
                                    fontWeight: 600,
                                    padding: '2px 8px',
                                    cursor: 'pointer',
                                    marginLeft: 8,
                                }}
                            >
                                Change
                            </button>
                        </p>
                    </div>
                    <WeatherChip
                        temp={temp}
                        condition={condition}
                        weatherEmoji={weatherEmoji}
                        isLoading={isLoading}
                        isError={isError}
                        onRetry={onRetry}
                    />
                </div>
                <div style={styles.heroBottom}>
                    <span style={styles.seasonBadge}>🌾 {getCurrentSeason()}</span>
                    <span style={styles.seasonBadge}>
                        {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                    </span>
                </div>
            </div>
        </div>
    );
}

// ─── Sub-component: WeatherChip ────────────────────────────────
function WeatherChip({ temp, condition, weatherEmoji, isLoading, isError, onRetry }) {
    return (
        <div style={styles.weatherChip}>
            {isLoading ? (
                <>
                    <div style={styles.skeleton} />
                    <div style={{ ...styles.skeleton, width: 40, marginTop: 4 }} />
                </>
            ) : isError ? (
                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, margin: 0 }}>Unavailable</p>
                    <button onClick={onRetry} style={styles.retryBtn}>Retry</button>
                </div>
            ) : (
                <>
                    <span style={{ fontSize: 26 }}>{weatherEmoji || '🌤️'}</span>
                    <div>
                        <p style={styles.tempText}>{temp !== null && temp !== undefined ? `${Math.round(temp)}°` : '—°'}</p>
                        <p style={styles.condText}>{condition || 'Clear'}</p>
                    </div>
                </>
            )}
        </div>
    );
}

// ─── Sub-component: QuickActions ───────────────────────────────
function QuickActions({ actions, navigate }) {
    return (
        <div>
            <p style={styles.sectionLabel}>QUICK ACTIONS</p>
            <div style={styles.actionsGrid}>
                {actions.map((a) => (
                    <button key={a.route} style={styles.actionCard}
                        onClick={() => navigate(a.route)}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = '#16a34a';
                            e.currentTarget.style.background  = '#f0fdf4';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = '#e5e7eb';
                            e.currentTarget.style.background  = '#ffffff';
                        }}
                    >
                        <div style={{ ...styles.actionIcon, background: a.iconBg }}>
                          <span style={{ fontSize: 22 }}>{a.emoji}</span>
                        </div>
                        <div style={styles.actionTextWrap}>
                          <span style={styles.actionLabel}>{a.label}</span>
                          <span style={styles.actionDesc}>{a.desc}</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

// ─── Sub-component: WeatherStrip ───────────────────────────────
function WeatherStrip({ weather, loading, farmerLocation, locationLabel }) {
  const fmt = (val, suffix) =>
    val != null ? `${val}${suffix}` : '—';

  const items = [
    { 
      emoji: '🌡️', 
      val: fmt(weather?.temperature, '°C'), 
      label: 'Temperature',
      sub: weather?.temp_max != null 
        ? `H:${weather.temp_max}° L:${weather.temp_min}°` 
        : null,
    },
    { 
      emoji: '💧', 
      val: fmt(weather?.humidity, '%'),    
      label: 'Humidity',
      sub: weather?.humidity >= 80 ? '⚠️ Fungal risk high'
         : weather?.humidity >= 60 ? '✓ Good for most crops'
         : weather?.humidity >= 40 ? '✓ Comfortable'
         : '⚠️ Too dry — irrigate',
    },
    { 
      emoji: '💨', 
      val: fmt(weather?.wind_speed, ' km/h'), 
      label: 'Wind',
      sub: weather?.wind_speed <= 5  ? '✓ Good for spraying'
         : weather?.wind_speed <= 15 ? '⚠️ Avoid spraying'
         : '⚠️ No spraying today',
    },
    { 
      emoji: '🌧️', 
      val: fmt(weather?.rainfall, ' mm'),  
      label: 'Rainfall',
      sub: weather?.rainfall > 0 
        ? `✓ Received today`
        : 'No rain last hour',
    },
    { 
      emoji: '👁️', 
      val: weather?.visibility != null 
           ? `${weather.visibility} km` : '—', 
      label: 'Visibility',
      sub: weather?.visibility >= 10 ? '✓ Excellent'
         : weather?.visibility >= 5  ? '~ Moderate'
         : '⚠️ Poor',
    },
    { 
      emoji: '🌡️', 
      val: fmt(weather?.pressure, ' mb'),  
      label: 'Pressure',
      sub: null,
    },
  ];

  return (
    <div style={styles.weatherStrip}>
      <div style={styles.weatherStripHeader}>
        <div>
          <p style={styles.weatherStripTitle}>
            Today's Conditions
          </p>
          <p style={styles.weatherStripSub}>
            {locationLabel || weather?.city || 'Your Location'}
          </p>
        </div>
        <span style={{ fontSize: 32 }}>
          {getWeatherEmoji(weather?.condition)}
        </span>
      </div>

      {loading && (
        <p style={{ fontSize: 13, color: '#9ca3af', 
                    margin: '8px 0' }}>
          Loading weather data...
        </p>
      )}

      <div className="weather-grid-6" style={styles.weatherGrid6}>
        {items.map((item) => (
          <div key={item.label} style={styles.weatherItem}>
            <span style={{ fontSize: 18 }}>{item.emoji}</span>
            <p style={styles.weatherVal}>{item.val}</p>
            <p style={styles.weatherLabel}>{item.label}</p>
            {item.sub && (
              <p style={styles.weatherSub}>{item.sub}</p>
            )}
          </div>
        ))}
      </div>

      {weather?.updatedAt && (
        <p style={{
          fontSize: 11,
          color: '#9ca3af',
          textAlign: 'right',
          marginTop: 12,
          borderTop: '1px solid #f3f4f6',
          paddingTop: 8,
        }}>
          Updated {Math.round(
            (Date.now() - new Date(weather.updatedAt).getTime()) 
            / 60000
          )} min ago
        </p>
      )}
    </div>
  );
}


// ─── Sub-component: AdvisoryStrip ──────────────────────────────
function AdvisoryStrip({ advisories }) {
    function timeAgo(dateStr) {
        if (!dateStr) return '';
        const diff = Date.now() - new Date(dateStr).getTime();
        const h = Math.floor(diff / 3600000);
        if (h < 1)  return 'Just now';
        if (h < 24) return `${h}h ago`;
        return `${Math.floor(h / 24)}d ago`;
    }

    return (
        <div>
            <p style={styles.sectionLabel}>RECENT ADVISORIES</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {advisories.map((adv, i) => {
                    // AdvisorySection maps: category, text/message, time/created_at
                    const type = adv.type || adv.category || '';
                    const meta = ADVISORY_LABELS[type] ??
                        { label: 'Advisory', color: RM.green, bg: RM.greenLight, dot: RM.green };
                    const text = adv.text || adv.message || adv.content || adv.title || '';
                    const isPlaceholder = !text ||
                        text.toLowerCase() === 'ai advisory' ||
                        text.trim().length < 10;
                    if (isPlaceholder) return null;
                    return (
                        <div key={adv.id || i} style={styles.advCard}>
                            <div style={{ ...styles.advDot, background: meta.dot }} />
                            <div style={{ flex: 1 }}>
                                <span style={{ ...styles.advBadge, color: meta.color, background: meta.bg }}>
                                    {meta.label}
                                </span>
                                <p style={styles.advText}>{text}</p>
                                <p style={styles.advTime}>{timeAgo(adv.created_at || adv.time)}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Sub-component: FarmingTipsSection ─────────────────────────
function FarmingTipsSection({ season }) {
  const TIPS = {
    'Rabi Season': [
      { emoji: '🌾', tip: 'Ideal time for wheat and mustard sowing' },
      { emoji: '💧', tip: 'Reduce irrigation — dew provides moisture' },
      { emoji: '🌡️', tip: 'Watch for frost below 5°C at night' },
      { emoji: '🐛', tip: 'Scout for aphids in wheat crops' },
    ],
    'Zaid Season': [
      { emoji: '☀️', tip: 'High UV — crops need more water in afternoons' },
      { emoji: '🌿', tip: 'Good time for moong and watermelon' },
      { emoji: '💦', tip: 'Drip irrigation saves 40% water in summer' },
      { emoji: '🌡️', tip: 'Mulching reduces soil temperature by 5-8°C' },
    ],
    'Kharif Season': [
      { emoji: '🌧️', tip: 'Check drainage before heavy rain forecast' },
      { emoji: '🌾', tip: 'Prime time for paddy and cotton sowing' },
      { emoji: '🐛', tip: 'Monitor for stem borer in paddy fields' },
      { emoji: '💊', tip: 'Apply basal fertilizer before transplanting' },
    ],
  };

  const tips = TIPS[season] || TIPS['Zaid Season'];

  return (
    <div style={styles.tipsSection}>
      <div style={styles.tipsSectionHeader}>
        <p style={styles.sectionLabel}>
          FARMING TIPS — {season?.toUpperCase()}
        </p>
      </div>
      <div style={styles.tipsGrid}>
        {tips.map((t, i) => (
          <div key={i} style={styles.tipCard}>
            <span style={{ fontSize: 24 }}>{t.emoji}</span>
            <p style={styles.tipText}>{t.tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Divider ───────────────────────────────────────────────────
function Divider() {
    return <div style={{ height: 1, background: RM.gray100, margin: '0 -20px' }} />;
}

// ─── Main Component ────────────────────────────────────────────
export default function FarmerHomeScreen({
    owWeather,
    owLoading,
    owError,
    onLoadWeather,
    farmerLocation,
    setFarmerLocation
}) {
    const navigate   = useNavigate();
    const { user }   = useAuth();

    // Advisory state — fetched inline (no reusable hook exists)
    const [advisories, setAdvisories]   = useState([]);
    const [advLoading, setAdvLoading]   = useState(true);

    const [showLocationPopup, setShowLocationPopup] = useState(() => {
        const saved = getSavedLocation();
        return !saved || !isLocationFresh(saved);
    });

    // Soft user fields — user object from localStorage (field names are backend-driven)
    const farmerName =
        user?.user_metadata?.full_name ||
        user?.user_metadata?.name ||
        user?.name ||
        user?.full_name ||
        user?.first_name ||
        user?.username ||
        'Farmer';
    const district   = user?.district || user?.location || 'Andhra Pradesh';

    useEffect(() => {
        const loadAdvisories = async () => {
            setAdvLoading(true);
            try {
                const res = await api.get('/ai/advisories/').catch(() => ({ data: null }));
                const list = res?.data?.advisories || res?.data || [];
                if (Array.isArray(list)) setAdvisories(list.slice(0, 3));
            } catch { /* silently ignore */ }
            finally { setAdvLoading(false); }
        };
        loadAdvisories();
    }, []);

    function handleLocationSet(locationData) {
        setFarmerLocation(locationData);
        setShowLocationPopup(false);
    }

    function handleChangeLocation() {
        setShowLocationPopup(true);
    }

    const displayLocation = cleanLocationName(farmerLocation);

    return (
        <div style={styles.page}>
            {showLocationPopup && (
                <LocationPopup onLocationSet={handleLocationSet} />
            )}
            <HeroSection
                greeting={getGreeting()}
                name={farmerName}
                district={displayLocation || district || ''}
                temp={owWeather?.temperature ?? null}
                condition={owWeather?.condition ?? ''}
                weatherEmoji={getWeatherEmoji(owWeather?.condition)}
                isLoading={owLoading}
                isError={!!owError}
                onRetry={() => onLoadWeather(farmerLocation)}
                onChangeLocation={handleChangeLocation}
            />

            <div style={styles.body}>
                <QuickActions actions={ACTIONS} navigate={navigate} />

                <Divider />

                <WeatherStrip 
                    weather={owWeather} 
                    loading={owLoading} 
                    farmerLocation={farmerLocation}
                    locationLabel={displayLocation}
                />

                <Divider />

                {!advLoading && advisories.some(a => {
                    const t = a.text || a.message || a.content || a.title || '';
                    return t && t.toLowerCase() !== 'ai advisory' && t.trim().length >= 10;
                }) && (
                    <AdvisoryStrip advisories={advisories} />
                )}

                {!advLoading && !advisories.some(a => {
                    const t = a.text || a.message || a.content || a.title || '';
                    return t && t.toLowerCase() !== 'ai advisory' && t.trim().length >= 10;
                }) && (
                    <div>
                        <p style={styles.sectionLabel}>RECENT ADVISORIES</p>
                        <div style={{
                            background:   '#f9fafb',
                            border:       '1px dashed #e5e7eb',
                            borderRadius: 14,
                            padding:      '24px 20px',
                            textAlign:    'center',
                        }}>
                            <p style={{ fontSize: 28, margin: '0 0 8px' }}>📋</p>
                            <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: 0 }}>
                                No advisories yet
                            </p>
                            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                                AI advisories for your district will appear here
                            </p>
                        </div>
                    </div>
                )}

                <Divider />
                <FarmingTipsSection season={getCurrentSeason()} />
            </div>
        </div>
    );
}

// ─── Styles ────────────────────────────────────────────────────
const styles = {
    page: {
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
        background:  'transparent',
        minHeight:   '100vh',
    },
    hero: {
        position:     'relative',
        height:       220,
        overflow:     'hidden',
        borderRadius: 0,
    },
    heroImg: {
        width:           '100%',
        height:          '100%',
        objectFit:       'cover',
        objectPosition:  'center 60%',
        display:         'block',
    },
    heroOverlay: {
        position: 'absolute',
        inset:    0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.58) 100%)',
    },
    heroContent: {
        position:        'absolute',
        inset:           0,
        padding:         '24px 24px 20px',
        display:         'flex',
        flexDirection:   'column',
        justifyContent:  'space-between',
    },
    heroTop: {
        display:        'flex',
        justifyContent: 'space-between',
        alignItems:     'flex-start',
    },
    greeting: {
        color:      'rgba(255,255,255,0.85)',
        fontSize:   13,
        fontWeight: 400,
        margin:     0,
    },
    farmerName: {
        color:         '#ffffff',
        fontSize:      24,
        fontWeight:    700,
        margin:        '2px 0 4px',
        letterSpacing: '-0.3px',
    },
    location: {
        color:    'rgba(255,255,255,0.75)',
        fontSize: 12,
        margin:   0,
    },
    weatherChip: {
        background:     'rgba(255,255,255,0.15)',
        border:         '1px solid rgba(255,255,255,0.25)',
        borderRadius:   20,
        padding:        '10px 14px',
        display:        'flex',
        alignItems:     'center',
        gap:            10,
        backdropFilter: 'blur(8px)',
        minWidth:       90,
    },
    tempText: {
        color:      '#ffffff',
        fontSize:   26,
        fontWeight: 700,
        margin:     0,
        lineHeight: 1,
    },
    condText: {
        color:     'rgba(255,255,255,0.85)',
        fontSize:  11,
        margin:    '3px 0 0',
    },
    skeleton: {
        background:  'rgba(255,255,255,0.3)',
        borderRadius: 4,
        height:      20,
        width:       50,
        animation:   'pulse 1.5s ease-in-out infinite',
    },
    retryBtn: {
        background:   'transparent',
        border:       '1px solid rgba(255,255,255,0.4)',
        color:        '#ffffff',
        fontSize:     10,
        borderRadius: 8,
        padding:      '3px 8px',
        cursor:       'pointer',
        marginTop:    4,
    },
    heroBottom: {
        display:    'flex',
        gap:        8,
        flexWrap:   'wrap',
    },
    seasonBadge: {
        background:   'rgba(255,255,255,0.15)',
        border:       '1px solid rgba(255,255,255,0.3)',
        borderRadius: 20,
        padding:      '5px 12px',
        color:        '#ffffff',
        fontSize:     11,
        fontWeight:   500,
    },
    body: {
        padding:       '20px 24px',
        display:       'flex',
        flexDirection: 'column',
        gap:           20,
    },
    sectionLabel: {
        fontSize:      11,
        fontWeight:    700,
        color:         '#9ca3af',
        letterSpacing: '0.8px',
        marginBottom:  12,
        margin:        0,
    },
    actionsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 10,
        marginBottom: 4,
    },
    actionCard: {
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        width: '100%',
        textAlign: 'left',
    },
    actionTextWrap: {
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
    },
    actionLabel: {
        fontSize: 13,
        fontWeight: 700,
        color: '#111827',
    },
    actionDesc: {
        fontSize: 11,
        color: '#9ca3af',
        lineHeight: 1.3,
    },
    actionIcon: {
        width: 42,
        height: 42,
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    weatherStrip: {
        background:   '#ffffff',
        border:       '1px solid #e5e7eb',
        borderRadius: 16,
        padding:      '16px',
    },
    weatherStripHeader: {
        display:        'flex',
        justifyContent: 'space-between',
        alignItems:     'center',
        marginBottom:   14,
    },
    weatherStripTitle: {
        fontSize:   14,
        fontWeight: 700,
        color:      '#111827',
        margin:     0,
    },
    weatherStripSub: {
        fontSize: 12,
        color:    '#9ca3af',
        margin:   '2px 0 0',
    },
    weatherGrid6: {
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: 8,
        borderTop: '1px solid #f3f4f6',
        paddingTop: 14,
        marginTop: 8,
    },
    weatherSub: {
        fontSize: 9,
        color: '#16a34a',
        margin: '2px 0 0',
        fontWeight: 600,
    },
    weatherGrid: {
        display:             'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap:                 8,
        borderTop:           '1px solid #f3f4f6',
        paddingTop:          14,
    },
    weatherItem:  { textAlign: 'center' },
    weatherVal: {
        fontSize:   15,
        fontWeight: 700,
        color:      '#111827',
        margin:     0,
    },
    weatherLabel: {
        fontSize:  10,
        color:     '#9ca3af',
        marginTop: 3,
    },
    advCard: {
        background:   '#ffffff',
        border:       '1px solid #e5e7eb',
        borderRadius: 14,
        padding:      '14px',
        display:      'flex',
        gap:          12,
        alignItems:   'flex-start',
    },
    advDot: {
        width:       8,
        height:      8,
        borderRadius: '50%',
        marginTop:   5,
        flexShrink:  0,
    },
    advBadge: {
        fontSize:     10,
        fontWeight:   700,
        padding:      '3px 8px',
        borderRadius: 20,
        display:      'inline-block',
        marginBottom: 5,
    },
    advText: {
        fontSize:   13,
        color:      '#374151',
        lineHeight: 1.5,
        margin:     0,
    },
    advTime: {
        fontSize:  10,
        color:     '#9ca3af',
        marginTop: 5,
    },
    tipsSection: {
        paddingBottom: 24,
    },
    tipsSectionHeader: {
        marginBottom: 12,
    },
    tipsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 10,
    },
    tipCard: {
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderLeft: '3px solid #16a34a',
        borderRadius: '0 10px 10px 0',
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
    },
    tipText: {
        fontSize: 13,
        color: '#374151',
        lineHeight: 1.5,
        margin: 0,
        fontWeight: 500,
    },
};
