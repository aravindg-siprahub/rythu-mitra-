import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getSavedLocation, 
  isLocationFresh, 
  detectLocationFromGPS, 
  saveLocation
} from '../utils/locationService';
import { fetchOpenWeather } from '../utils/openWeather';
import { fetchMandiPrice } from '../utils/mandiPrices';
import api from '../utils/apiService';

/**
 * useDashboard Hook
 * Orchestrates all real-time dashboard data from multiple APIs.
 * Fixed loop issue where fetching location triggered re-fetch.
 */
export function useDashboard() {
  const { user } = useAuth();
  
  const [data, setData] = useState({
    weather: null,
    location: null,
    mandiPrices: [],
    advisories: [],
    profile: null,
    loading: {
      weather: true,
      mandi: true,
      advisories: true,
      profile: true,
    },
    errors: {
      weather: null,
      mandi: null,
      advisories: null,
      profile: null,
    },
    lastUpdated: {
      weather: null,
      mandi: null,
      advisories: null,
    }
  });

  // Use a ref to track the current location for intervals
  const locationRef = useRef(null);

  // 1. Fetch Location
  const loadLocation = useCallback(async () => {
    let loc = getSavedLocation();
    if (!isLocationFresh(loc)) {
      try {
        loc = await detectLocationFromGPS();
        saveLocation(loc);
      } catch (err) {
        console.warn('Dashboard location detection failed:', err.message);
      }
    }
    
    // Only update state if location actually changed or is new
    // We compare lat/lon to avoid unnecessary re-renders
    setData(prev => {
      if (prev.location?.lat === loc?.lat && prev.location?.lon === loc?.lon) {
        return prev;
      }
      locationRef.current = loc;
      return { ...prev, location: loc };
    });
    
    locationRef.current = loc;
    return loc;
  }, []);

  // 2. Fetch Weather
  const loadWeather = useCallback(async (loc) => {
    const targetLoc = loc || locationRef.current;
    if (!targetLoc?.lat || !targetLoc?.lon) return;
    
    setData(prev => ({ 
      ...prev, 
      loading: { ...prev.loading, weather: true },
      errors: { ...prev.errors, weather: null }
    }));
    
    try {
      const weatherData = await fetchOpenWeather(targetLoc.lat, targetLoc.lon);
      setData(prev => ({ 
        ...prev, 
        weather: weatherData,
        loading: { ...prev.loading, weather: false },
        lastUpdated: { ...prev.lastUpdated, weather: new Date() }
      }));
    } catch (err) {
      setData(prev => ({ 
        ...prev, 
        loading: { ...prev.loading, weather: false },
        errors: { ...prev.errors, weather: 'Weather unavailable' }
      }));
    }
  }, []);

  // 3. Fetch Mandi Prices
  const loadMandi = useCallback(async (loc) => {
    const targetLoc = loc || locationRef.current;
    const district = targetLoc?.district || targetLoc?.city || 'Kurnool';
    
    setData(prev => ({ 
      ...prev, 
      loading: { ...prev.loading, mandi: true },
      errors: { ...prev.errors, mandi: null }
    }));

    const crops = ['Paddy', 'Wheat', 'Cotton', 'Maize', 'Onion'];
    try {
      const results = await Promise.allSettled(
        crops.map(crop => fetchMandiPrice(crop, district))
      );
      const validRecords = results
        .filter(r => r.status === 'fulfilled' && r.value)
        .map(r => r.value);

      setData(prev => ({ 
        ...prev, 
        mandiPrices: validRecords,
        loading: { ...prev.loading, mandi: false },
        lastUpdated: { ...prev.lastUpdated, mandi: new Date() }
      }));
    } catch (err) {
      setData(prev => ({ 
        ...prev, 
        loading: { ...prev.loading, mandi: false },
        errors: { ...prev.errors, mandi: 'Mandi prices unavailable' }
      }));
    }
  }, []);

  // 4. Fetch AI Advisories
  const loadAdvisories = useCallback(async () => {
    setData(prev => ({ 
      ...prev, 
      loading: { ...prev.loading, advisories: true },
      errors: { ...prev.errors, advisories: null }
    }));

    try {
      const res = await api.get('/ai/advisories/').catch(() => ({ advisories: [] }));
      const list = res?.advisories || res?.data?.advisories || [];
      setData(prev => ({ 
        ...prev, 
        advisories: list,
        loading: { ...prev.loading, advisories: false },
        lastUpdated: { ...prev.lastUpdated, advisories: new Date() }
      }));
    } catch (err) {
      setData(prev => ({ 
        ...prev, 
        loading: { ...prev.loading, advisories: false },
        errors: { ...prev.errors, advisories: 'Advisories unavailable' }
      }));
    }
  }, []);

  // 5. Fetch User Profile
  const loadProfile = useCallback(async () => {
    setData(prev => ({ 
      ...prev, 
      loading: { ...prev.loading, profile: true },
      errors: { ...prev.errors, profile: null }
    }));

    try {
      const res = await api.get('/auth/profile/').catch(() => ({ profile: {} }));
      setData(prev => ({ 
        ...prev, 
        profile: res.profile || res.data?.profile || {},
        loading: { ...prev.loading, profile: false },
      }));
    } catch (err) {
      setData(prev => ({ 
        ...prev, 
        loading: { ...prev.loading, profile: false },
        errors: { ...prev.errors, profile: 'Profile unavailable' }
      }));
    }
  }, []);

  // Initial Data Fetch - dependent ONLY on user
  useEffect(() => {
    const fetchAll = async () => {
      const loc = await loadLocation();
      await Promise.allSettled([
        loadWeather(loc),
        loadMandi(loc),
        loadAdvisories(),
        loadProfile()
      ]);
    };

    if (user) {
      fetchAll();
    }
  }, [user, loadLocation, loadWeather, loadMandi, loadAdvisories, loadProfile]);

  // Separate Effect for Intervals - avoid re-triggering main mount logic
  useEffect(() => {
    if (!user) return;

    const weatherIv = setInterval(() => loadWeather(), 10 * 60 * 1000); // 10 min
    const mandiIv = setInterval(() => loadMandi(), 30 * 60 * 1000);   // 30 min
    const advIv = setInterval(loadAdvisories, 60 * 60 * 1000);        // 1 hour
    
    return () => {
      clearInterval(weatherIv);
      clearInterval(mandiIv);
      clearInterval(advIv);
    };
  }, [user, loadWeather, loadMandi, loadAdvisories]);

  return {
    ...data,
    refresh: async () => {
       const loc = await loadLocation();
       return Promise.allSettled([
         loadWeather(loc),
         loadMandi(loc),
         loadAdvisories(),
         loadProfile()
       ]);
    },
    refreshWeather: () => loadWeather(),
    refreshMandi: () => loadMandi(),
    refreshAdvisories: loadAdvisories,
  };
}
