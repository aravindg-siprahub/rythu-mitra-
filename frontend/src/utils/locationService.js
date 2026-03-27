const LOCATION_KEY = 'rm_farmer_location';
const OPENCAGE_KEY = '34f258a0963f47868af164e5d9d33354';

export function getSavedLocation() {
  try {
    const raw = localStorage.getItem(LOCATION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveLocation(locationData) {
  try {
    localStorage.setItem(LOCATION_KEY, JSON.stringify({
      ...locationData,
      savedAt: Date.now(),
    }));
  } catch {}
}

export function clearLocation() {
  localStorage.removeItem(LOCATION_KEY);
}

export function isLocationFresh(locationData) {
  if (!locationData?.savedAt) return false;
  const AGE_LIMIT = 7 * 24 * 60 * 60 * 1000; // 7 days
  return (Date.now() - locationData.savedAt) < AGE_LIMIT;
}

export async function detectLocationFromGPS() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('GPS not supported on this device'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://api.opencagedata.com/geocode/v1/json` +
            `?q=${latitude}+${longitude}` +
            `&key=${OPENCAGE_KEY}` +
            `&language=en` +
            `&pretty=0` +
            `&no_annotations=1` +
            `&countrycode=in`
          );
          const data = await res.json();

          if (
            data.status?.code !== 200 || 
            !data.results?.length
          ) {
            console.error('OpenCage error:', data.status);
            resolve({
              lat:         latitude,
              lon:         longitude,
              district:    '',
              state:       '',
              city:        '',
              displayName: `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`,
            });
            return;
          }

          const r          = data.results[0];
          const components = r.components || {};

          console.log('OpenCage components:', 
            JSON.stringify(components));

          // Extract location fields from OpenCage response
          const sublocality =
            components.village             ||
            components.hamlet              ||
            components.suburb              ||
            components.neighbourhood       ||
            components.quarter             ||
            components.residential         ||
            components._normalized_city    || '';

          const locality =
            components.city                ||
            components.town                ||
            components.county              ||
            components.village             || '';

          const district =
            components.state_district ||
            components.county         ||
            components.district       || '';

          const state =
            components.state          || '';

          const postcode =
            components.postcode       || '';

          // Most specific name first
          const displayName =
            sublocality ||
            locality    ||
            district    ||
            r.formatted?.split(',')[0] ||
            `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;

          const city = locality || sublocality || district || '';

          resolve({
            lat:         latitude,
            lon:         longitude,
            district:    district,
            state:       state,
            city:        city,
            sublocality: sublocality,
            locality:    locality,
            postcode:    postcode,
            displayName: displayName,
            formatted:   r.formatted || '',
          });
        } catch {
          resolve({
            lat: latitude,
            lon: longitude,
            district: '',
            state: '',
            city: '',
            displayName: `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`,
          });
        }
      },
      (err) => {
        reject(new Error(
          err.code === 1 ? 'Location permission denied' :
          err.code === 2 ? 'Location unavailable'       :
                           'Location request timed out'
        ));
      },
      { timeout: 10000, maximumAge: 300000, enableHighAccuracy: false }
    );
  });
}

export function cleanLocationName(location) {
  if (!location) return '';

  const city = 
    location.sublocality ||
    location.locality    ||
    location.city        ||
    location.displayName ||
    location.district    || '';

  const state = location.state || '';

  const cleanCity = city
    .replace(/\s+taluku?/gi,  '')
    .replace(/\s+tehsil/gi,   '')
    .replace(/\s+mandal/gi,   '')
    .replace(/\s+district/gi, '')
    .split(',')[0]
    .trim();

  if (!cleanCity && !state) return 'Your Location';
  if (!cleanCity)           return state;
  if (!state)               return cleanCity;
  return `${cleanCity}, ${state}`;
}

// Get farmer's saved district for auto-filling forms
export function getFarmerDistrict() {
  const loc = getSavedLocation();
  if (!loc) return '';
  return loc.district || 
         loc.locality || 
         loc.city     || '';
}

// Get farmer's saved state
export function getFarmerState() {
  const loc = getSavedLocation();
  if (!loc) return '';
  return loc.state || '';
}

// Get farmer's saved city/area
export function getFarmerCity() {
  const loc = getSavedLocation();
  if (!loc) return '';
  return loc.sublocality || 
         loc.locality    || 
         loc.city        || 
         loc.district    || '';
}

// Get farmer's mandi/market location
export function getFarmerMandi() {
  const loc = getSavedLocation();
  if (!loc) return '';
  // Use district for mandi — most relevant for market prices
  return loc.district || 
         loc.locality || 
         loc.city     || '';
}

// Cache weather data for cross-page use
const WEATHER_CACHE_KEY = 'rm_weather_cache';

export function cacheWeatherData(weatherData) {
  try {
    localStorage.setItem(WEATHER_CACHE_KEY, 
      JSON.stringify({
        data: weatherData,
        cachedAt: Date.now(),
      })
    );
  } catch {}
}

export function getCachedWeather() {
  try {
    const raw = localStorage.getItem(WEATHER_CACHE_KEY);
    if (!raw) return null;
    const { data, cachedAt } = JSON.parse(raw);
    const AGE = 30 * 60 * 1000; // 30 minutes
    if (Date.now() - cachedAt > AGE) return null;
    return data;
  } catch { return null; }
}
