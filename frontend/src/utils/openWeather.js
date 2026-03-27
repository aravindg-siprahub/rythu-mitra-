const OWM_KEY = '50ede64a3a8e9d3993d0bac15a858a49';
// This is a free public demo key — works for testing.
// For production, get a free key at openweathermap.org

export async function fetchOpenWeather(lat, lon) {
  if (!lat || !lon) return null;
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather` +
      `?lat=${lat}&lon=${lon}&appid=${OWM_KEY}&units=metric`
    );
    if (!res.ok) throw new Error('Weather fetch failed');
    const d = await res.json();
    return {
      temperature:  Math.round(d.main?.temp        ?? 0),
      feels_like:   Math.round(d.main?.feels_like  ?? 0),
      temp_min:     Math.round(d.main?.temp_min    ?? 0),
      temp_max:     Math.round(d.main?.temp_max    ?? 0),
      humidity:     Math.round(d.main?.humidity    ?? 0),
      wind_speed:   Math.round((d.wind?.speed ?? 0) * 3.6), // m/s → km/h
      wind_dir:     d.wind?.deg ?? 0,
      visibility:   d.visibility 
                      ? Math.round(d.visibility / 1000) 
                      : null,              // metres → km
      rainfall:     d.rain?.['1h'] ?? d.rain?.['3h'] ?? 0,
      condition:    d.weather?.[0]?.main        ?? 'Clear',
      description:  d.weather?.[0]?.description ?? 'Clear sky',
      icon:         d.weather?.[0]?.main        ?? 'Clear',
      city:         d.name ?? '',
      country:      d.sys?.country ?? '',
      pressure:     d.main?.pressure ?? null,
      clouds:       d.clouds?.all ?? null,
      sunrise:      d.sys?.sunrise ?? null,
      sunset:       d.sys?.sunset  ?? null,
      updatedAt:    d.dt ? new Date(d.dt * 1000) : new Date(),
    };
  } catch (err) {
    console.error('OpenWeather error:', err);
    return null;
  }
}

export function getWeatherEmoji(condition) {
  const c = condition?.toLowerCase() ?? '';
  if (c.includes('thunder'))              return '⛈️';
  if (c.includes('drizzle'))              return '🌦️';
  if (c.includes('rain'))                 return '🌧️';
  if (c.includes('snow'))                 return '❄️';
  if (c.includes('fog') || 
      c.includes('mist') || 
      c.includes('haze'))                 return '🌫️';
  if (c.includes('cloud'))               return '⛅';
  if (c.includes('clear') || 
      c.includes('sunny'))               return '☀️';
  return '🌤️';
}
