import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workersAPI } from '../../services/apiService';
import { getFarmerDistrict, getFarmerState } from '../../utils/locationService';

const TASK_TYPES = [
    '🌾 Harvesting', '🌱 Planting / Transplanting', '💧 Irrigation',
    '🧪 Fertiliser Spraying', '🐛 Pest Control', '🚜 Land Preparation',
    '🌿 Weeding', '📦 Post-harvest Handling',
];

const TODAY = new Date().toISOString().split('T')[0];

export default function WorkersPage() {
    const navigate = useNavigate();

    const [district, setDistrict] = useState(getFarmerDistrict() || '');
    const [taskType, setTaskType] = useState('');
    const [date,     setDate]     = useState(TODAY);
    const [workers,  setWorkers]  = useState(1);
    const [results,  setResults]  = useState(null);
    const [loading,  setLoading]  = useState(false);
    const [error,    setError]    = useState('');
    const [booked,   setBooked]   = useState(null);
    const [booking,  setBooking]  = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!district.trim() || !taskType) {
            setError('Please select district and task type.');
            return;
        }
        setError('');
        setLoading(true);
        setResults(null);
        try {
            const res = await workersAPI.search({
                district: district.trim(),
                task_type: taskType.replace(/^[^ ]+ /, ''),
                date,
                workers_needed: workers,
            });
            setResults(Array.isArray(res) ? res : res?.workers || res?.results || []);
        } catch (err) {
            setError(err?.message || 'Could not fetch workers. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleBook = async (workerId) => {
        setBooking(true);
        try {
            const res = await workersAPI.book({
                worker_id:      workerId,
                task_type:      taskType.replace(/^[^ ]+ /, ''),
                date,
                district:       district.trim(),
                workers_needed: workers,
                duration:       8,
            });
            setBooked(res?.booking_id || res?.id || 'CONFIRMED');
        } catch (err) {
            setError('Booking failed: ' + (err?.message || 'Please retry.'));
        } finally {
            setBooking(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', background: '#f8fafc', paddingBottom: 80,
            fontFamily: "'Inter', 'DM Sans', -apple-system, sans-serif",
        }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg,#581c87,#7c3aed)',
                padding: '24px 20px 28px',
            }}>
                <button onClick={() => navigate('/dashboard')} style={{
                    background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
                    color: '#fff', borderRadius: 8, padding: '6px 12px',
                    fontSize: 13, cursor: 'pointer', marginBottom: 12,
                }}>← Back</button>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>👷 Farm Workers</h1>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                    Find and book skilled farm labour near you
                </p>
            </div>

            <div style={{ maxWidth: 560, margin: '0 auto', padding: '20px 16px' }}>

                {/* Success */}
                {booked && (
                    <div style={{
                        background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 14,
                        padding: '20px', textAlign: 'center', marginBottom: 20,
                    }}>
                        <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#15803d', margin: '0 0 4px' }}>
                            Booking Confirmed!
                        </h3>
                        <p style={{ fontSize: 13, color: '#166534', margin: 0 }}>
                            Booking ID: <strong>{booked}</strong>
                        </p>
                        <button
                            onClick={() => { setBooked(null); setResults(null); }}
                            style={{
                                marginTop: 14, background: '#16a34a', color: '#fff', border: 'none',
                                borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontWeight: 600,
                            }}
                        >
                            Book Another
                        </button>
                    </div>
                )}

                {/* Search form */}
                <div style={{
                    background: '#fff', borderRadius: 16, padding: '20px',
                    border: '1px solid #e5e7eb', marginBottom: 16,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', margin: '0 0 14px' }}>
                        SEARCH WORKERS
                    </p>
                    <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>
                                District
                            </label>
                            <input
                                type="text"
                                value={district}
                                onChange={e => setDistrict(e.target.value)}
                                placeholder="e.g. Warangal"
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>
                                Task Type
                            </label>
                            <select value={taskType} onChange={e => setTaskType(e.target.value)} style={inputStyle}>
                                <option value="">Select task type...</option>
                                {TASK_TYPES.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>
                                    Date
                                </label>
                                <input type="date" value={date} min={TODAY} onChange={e => setDate(e.target.value)} style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>
                                    Workers needed
                                </label>
                                <input
                                    type="number" min="1" max="50" value={workers}
                                    onChange={e => setWorkers(Number(e.target.value))}
                                    style={inputStyle}
                                />
                            </div>
                        </div>
                        {error && (
                            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#dc2626' }}>
                                ⚠️ {error}
                            </div>
                        )}
                        <button type="submit" disabled={loading} style={btnStyle}>
                            {loading ? 'Searching...' : '🔍 Find Workers'}
                        </button>
                    </form>
                </div>

                {/* Results */}
                {loading && (
                    <div style={{ textAlign: 'center', padding: '32px', color: '#7c3aed' }}>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>👷</div>
                        <p style={{ fontSize: 14, fontWeight: 600 }}>Finding available workers...</p>
                    </div>
                )}

                {results !== null && !loading && (
                    <div>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', marginBottom: 10 }}>
                            {results.length > 0 ? `${results.length} WORKERS AVAILABLE` : 'NO WORKERS FOUND'}
                        </p>
                        {results.length === 0 && (
                            <div style={{
                                background: '#fff', borderRadius: 14, padding: '32px 20px', textAlign: 'center',
                                border: '1px dashed #e5e7eb',
                            }}>
                                <div style={{ fontSize: 40, marginBottom: 8 }}>😔</div>
                                <p style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>No workers available</p>
                                <p style={{ fontSize: 12, color: '#9ca3af' }}>Try a different date or task type</p>
                            </div>
                        )}
                        {results.map((w, i) => (
                            <div key={w.id || i} style={{
                                background: '#fff', borderRadius: 14, padding: '16px',
                                border: '1px solid #e5e7eb', marginBottom: 10,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>
                                            👷 {w.name || `Worker ${i + 1}`}
                                        </p>
                                        <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 0' }}>
                                            {w.experience ? `${w.experience} yrs exp · ` : ''}{w.location || district}
                                        </p>
                                        <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>
                                            ⭐ {w.rating || '4.5'} · {w.completed_jobs || 0} jobs done
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: 16, fontWeight: 800, color: '#15803d', margin: 0 }}>
                                            ₹{w.daily_rate || w.rate || '450'}/day
                                        </p>
                                        <button
                                            onClick={() => handleBook(w.id)}
                                            disabled={booking}
                                            style={{
                                                marginTop: 8, background: '#7c3aed', color: '#fff',
                                                border: 'none', borderRadius: 8, padding: '6px 14px',
                                                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                            }}
                                        >
                                            Book Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

const inputStyle = {
    width: '100%', fontSize: 14, color: '#111827',
    background: '#fafafa', border: '1.5px solid #e5e7eb',
    borderRadius: 10, padding: '10px 12px',
    outline: 'none', boxSizing: 'border-box',
};
const btnStyle = {
    background: 'linear-gradient(135deg,#7c3aed,#581c87)',
    color: '#fff', border: 'none', borderRadius: 10,
    padding: '12px', fontSize: 14, fontWeight: 700,
    cursor: 'pointer', width: '100%',
};
