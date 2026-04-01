import { useState, useEffect } from 'react';
import DashboardSidebar from '../components/dashboard_new/DashboardSidebar';
import FarmerHomeScreen from './dashboard_new/FarmerHomeScreen';
import { getSavedLocation, isLocationFresh, cleanLocationName } from '../utils/locationService';
import { fetchOpenWeather } from '../utils/openWeather';
import { cacheWeatherData } from '../utils/locationService';

export default function DashboardNew() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [farmerLocation, setFarmerLocation] = useState(() => {
        const saved = getSavedLocation();
        return isLocationFresh(saved) ? saved : null;
    });

    const [owWeather, setOwWeather]       = useState(null);
    const [owLoading, setOwLoading]       = useState(false);
    const [owError,   setOwError]         = useState(null);

    async function loadWeather(location) {
        if (!location?.lat || !location?.lon) return;
        setOwLoading(true);
        setOwError(null);
        try {
            const data = await fetchOpenWeather(location.lat, location.lon);
            setOwWeather(data);
            if (data) cacheWeatherData(data);
        } catch (e) {
            setOwError(e.message);
        } finally {
            setOwLoading(false);
        }
    }

    useEffect(() => {
        if (!farmerLocation) return;
        const timer = setTimeout(() => {
            loadWeather(farmerLocation);
        }, 500);
        return () => clearTimeout(timer);
    }, [farmerLocation]);

    return (
        <div style={{ minHeight: '100vh', background: '#f5f5f0' }}>
            {/* Sidebar slides OVER the content — no margin push */}
            <DashboardSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Full-width main content */}
            <div style={{ width: '100%' }}>
                <FarmerHomeScreen 
                    owWeather={owWeather}
                    owLoading={owLoading}
                    owError={owError}
                    onLoadWeather={loadWeather}
                    farmerLocation={farmerLocation}
                    setFarmerLocation={setFarmerLocation}
                />
            </div>
        </div>
    );
}
