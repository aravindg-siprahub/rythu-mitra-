import { useState } from 'react';
import { detectLocationFromGPS, saveLocation } from '../../utils/locationService';
export default function LocationPopup({ onLocationSet }) {
  const [status, setStatus] = useState('idle');
  // status: 'idle' | 'detecting' | 'success' | 'denied' | 'error'
  const [detectedLocation, setDetectedLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [manualErrorMsg, setManualErrorMsg] = useState('');
  async function handleDetect() {
    setStatus('detecting');
    setErrorMsg('');
    try {
      const loc = await detectLocationFromGPS();
      setDetectedLocation(loc);
      setStatus('success');
    } catch (err) {
      setErrorMsg(err.message);
      setStatus(err.message.includes('denied') ? 'denied' : 'error');
    }
  }
  function handleConfirm() {
    if (!detectedLocation) return;
    saveLocation(detectedLocation);
    onLocationSet(detectedLocation);
  }
  function handleRetry() {
    setStatus('idle');
    setDetectedLocation(null);
    setErrorMsg('');
  }
  async function handleManualSearch() {
    if (!manualInput.trim()) return;
    setStatus('detecting');
    setManualErrorMsg('');
    try {
      const query = manualInput.trim() + ', India';
      const res = await fetch(
        `https://api.opencagedata.com/geocode/v1/json` +
        `?q=${encodeURIComponent(query)}` +
        `&key=34f258a0963f47868af164e5d9d33354` +
        `&language=en&no_annotations=1&countrycode=in` +
        `&limit=1`
      );
      const data = await res.json();
      if (!data.results?.length) {
        setManualErrorMsg('Location not found. Try a different name.');
        setStatus('success'); // Revert back so input doesn't vanish
        return;
      }
      const r = data.results[0];
      const c = r.components;
      const loc = {
        lat:         r.geometry.lat,
        lon:         r.geometry.lng,
        displayName: c.hamlet || c.suburb || 
                     c.neighbourhood || c.village ||
                     c.town || c.city || 
                     manualInput.split(',')[0].trim(),
        district:    c.state_district || c.county || '',
        state:       c.state || '',
        city:        c.city || c.town || c.village || '',
        sublocality: c.hamlet || c.suburb || 
                     c.neighbourhood || '',
        locality:    c.city || c.town || '',
      };
      setDetectedLocation(loc);
      setStatus('success');
      setManualInput('');
    } catch {
      setManualErrorMsg('Search failed. Please try again.');
      setStatus('success');
    }
  }
  return (
    <div style={S.backdrop}>
      <div style={S.popup}>
        <div style={S.iconWrap}>
          <span style={{ fontSize: 40 }}>📍</span>
        </div>
        <h2 style={S.title}>Set Your Location</h2>
        <p style={S.subtitle}>
          We'll use your location to show accurate weather,
          crop advice, and market prices for your area.
        </p>
        {status === 'idle' && (
          <button style={S.btnPrimary} onClick={handleDetect}>
            Detect My Location
          </button>
        )}
        {status === 'detecting' && (
          <div style={S.detectingWrap}>
            <div style={S.spinner} />
            <p style={S.detectingText}>Detecting your location...</p>
          </div>
        )}
        {status === 'success' && detectedLocation && (
          <div style={S.successWrap}>
            <div style={S.locationCard}>
              <span style={{ fontSize: 20 }}>📍</span>
              <div>
                <p style={S.locationName}>
                  {detectedLocation.displayName}
                </p>
                <p style={S.locationSub}>
                  {detectedLocation.district && 
                   detectedLocation.district !== detectedLocation.displayName
                    ? `${detectedLocation.district}, ` : ''}
                  {detectedLocation.state}
                </p>
              </div>
            </div>
            <button style={S.btnPrimary} onClick={handleConfirm}>
              Use This Location
            </button>
            <div style={{ margin: '12px 0', textAlign: 'center' }}>
              <p style={{ 
                fontSize: 12, 
                color: '#9ca3af',
                margin: '0 0 8px'
              }}>
                Not your exact location?
              </p>
              <input
                type="text"
                spellCheck="false"
                placeholder="Type your village or area name..."
                value={manualInput}
                onChange={e => setManualInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleManualSearch()}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: manualErrorMsg ? '1px solid #dc2626' : '1px solid #e5e7eb',
                  borderRadius: 10,
                  fontSize: 13,
                  outline: 'none',
                  boxSizing: 'border-box',
                  color: '#111827',
                  backgroundColor: '#ffffff',
                }}
              />
              {manualErrorMsg && (
                <p style={{ color: '#dc2626', fontSize: 12, margin: '4px 0 0' }}>
                  {manualErrorMsg}
                </p>
              )}
              {manualInput.length > 2 && (
                <button
                  onClick={handleManualSearch}
                  style={{
                    width: '100%',
                    marginTop: 8,
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: 10,
                    padding: '10px',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#15803d',
                    cursor: 'pointer',
                  }}
                >
                  Search "{manualInput}"
                </button>
              )}
            </div>
            {manualInput.length <= 2 && (
              <button style={S.btnPrimary} onClick={handleConfirm}>
                Use This Location
              </button>
            )}
            {manualInput.length <= 2 && (
              <button style={S.btnSecondary} onClick={handleRetry}>
                Try Again
              </button>
            )}
          </div>
        )}
        {(status === 'denied' || status === 'error') && (
          <div style={S.errorWrap}>
            <p style={S.errorText}>{errorMsg}</p>
            {status === 'denied' && (
              <p style={S.errorHint}>
                Please allow location access in your browser settings,
                then try again.
              </p>
            )}
            <button style={S.btnPrimary} onClick={handleRetry}>
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
const S = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px',
  },
  popup: {
    background: '#ffffff',
    borderRadius: 20,
    padding: '32px 28px',
    maxWidth: 380,
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  iconWrap: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: '#111827',
    margin: '0 0 8px',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 1.6,
    margin: '0 0 24px',
  },
  btnPrimary: {
    width: '100%',
    background: '#16a34a',
    color: '#ffffff',
    border: 'none',
    borderRadius: 12,
    padding: '14px 20px',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    marginBottom: 10,
    transition: 'background 0.15s',
  },
  btnSecondary: {
    width: '100%',
    background: 'transparent',
    color: '#6b7280',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: '12px 20px',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
  },
  detectingWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    padding: '12px 0 24px',
  },
  spinner: {
    width: 36,
    height: 36,
    border: '3px solid #e5e7eb',
    borderTop: '3px solid #16a34a',
    borderRadius: '50%',
    animation: 'rm-spin 0.8s linear infinite',
  },
  detectingText: {
    fontSize: 14,
    color: '#6b7280',
    margin: 0,
  },
  successWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  locationCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: 12,
    padding: '14px 16px',
    marginBottom: 6,
    textAlign: 'left',
  },
  locationName: {
    fontSize: 15,
    fontWeight: 700,
    color: '#111827',
    margin: 0,
  },
  locationSub: {
    fontSize: 12,
    color: '#6b7280',
    margin: '2px 0 0',
  },
  errorWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: 600,
    margin: 0,
  },
  errorHint: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 1.5,
    margin: '0 0 8px',
  },
};
