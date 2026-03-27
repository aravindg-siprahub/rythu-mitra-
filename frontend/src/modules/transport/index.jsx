import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { transportAPI } from '../../services/apiService';
import { getFarmerDistrict } from '../../utils/locationService';

const VEHICLE_TYPES = [
    { key: 'tractor',      label: '🚜 Tractor',         desc: 'Ploughing, levelling, sowing' },
    { key: 'tipper',       label: '🚛 Tipper/Lorry',    desc: 'Produce transport, bulk loads' },
    { key: 'mini_truck',   label: '🚐 Mini Truck',      desc: 'Medium loads, market trips' },
    { key: 'bike',         label: '🏍️ Two-Wheeler',    desc: 'Quick deliveries, small cargo' },
    { key: 'harvester',    label: '🌾 Harvester',       desc: 'Paddy, wheat, maize harvest' },
    { key: 'sprayer',      label: '💊 Sprayer Machine', desc: 'Pesticide & fertiliser spray' },
];

const TODAY = new Date().toISOString().split('T')[0];

export default function TransportPage() {
    const navigate = useNavigate();

    const [origin,      setOrigin]      = useState(getFarmerDistrict() || '');
    const [destination, setDestination] = useState('');
    const [vehicleType, setVehicleType] = useState('');
    const [date,        setDate]        = useState(TODAY);
    const [results,     setResults]     = useState(null);
    const [loading,     setLoading]     = useState(false);
    const [error,       setError]       = useState('');
    const [booked,      setBooked]      = useState(null);
    const [booking,     setBooking]     = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!origin.trim() || !vehicleType) {
            setError('Please fill origin and select a vehicle type.');
            return;
        }
        setError('');
        setLoading(true);
        setResults(null);
        try {
            const res = await transportAPI.search({
                origin:       origin.trim(),
                destination:  destination.trim() || undefined,
                vehicle_type: vehicleType,
                date,
            });
            setResults(Array.isArray(res) ? res : res?.vehicles || res?.results || []);
        } catch (err) {
            setError(err?.message || 'Could not fetch vehicles. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleBook = async (vehicleId, vehicle) => {
        setBooking(true);
        try {
            const res = await transportAPI.book({
                vehicle_id:  vehicleId,
                origin:      origin.trim(),
                destination: destination.trim() || origin.trim(),
                load_type:   vehicle.load_type || 'Agricultural produce',
                weight_kg:   500,
                date,
                vehicle_type: vehicleType,
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
                background: 'linear-gradient(135deg,#1e40af,#1d4ed8)',
                padding: '24px 20px 28px',
            }}>
                <button onClick={() => navigate('/dashboard')} style={{
                    background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
                    color: '#fff', borderRadius: 8, padding: '6px 12px',
                    fontSize: 13, cursor: 'pointer', marginBottom: 12,
                }}>← Back</button>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>🚛 Transport & Machinery</h1>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                    Book tractors, vehicles and farm machinery near you
                </p>
            </div>

            <div style={{ maxWidth: 560, margin: '0 auto', padding: '20px 16px' }}>

                {/* Success */}
                {booked && (
                    <div style={{
                        background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 14,
                        padding: '20px', textAlign: 'center', marginBottom: 20,
                    }}>
                        <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1d4ed8', margin: '0 0 4px' }}>Booking Confirmed!</h3>
                        <p style={{ fontSize: 13, color: '#1e40af', margin: 0 }}>
                            Booking ID: <strong>{booked}</strong>
                        </p>
                        <button onClick={() => { setBooked(null); setResults(null); }} style={{
                            marginTop: 14, background: '#1d4ed8', color: '#fff', border: 'none',
                            borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontWeight: 600,
                        }}>
                            Book Another
                        </button>
                    </div>
                )}

                {/* Vehicle type selector */}
                <div style={{
                    background: '#fff', borderRadius: 16, padding: '20px',
                    border: '1px solid #e5e7eb', marginBottom: 16,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', margin: '0 0 14px' }}>
                        SELECT VEHICLE TYPE
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
                        {VEHICLE_TYPES.map(v => (
                            <button
                                key={v.key}
                                onClick={() => setVehicleType(v.key)}
                                style={{
                                    padding: '12px 10px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                                    border:     `1.5px solid ${vehicleType === v.key ? '#1d4ed8' : '#e5e7eb'}`,
                                    background: vehicleType === v.key ? '#eff6ff' : '#fafafa',
                                }}
                            >
                                <div style={{ fontSize: 20, marginBottom: 4 }}>{v.label.split(' ')[0]}</div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: vehicleType === v.key ? '#1d4ed8' : '#111827' }}>
                                    {v.label.replace(/^[^ ]+ /, '')}
                                </div>
                                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{v.desc}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search form */}
                <div style={{
                    background: '#fff', borderRadius: 16, padding: '20px',
                    border: '1px solid #e5e7eb', marginBottom: 16,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', margin: '0 0 14px' }}>
                        TRIP DETAILS
                    </p>
                    <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>
                                Origin (Your District)
                            </label>
                            <input
                                type="text" placeholder="e.g. Guntur" value={origin}
                                onChange={e => setOrigin(e.target.value)} style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>
                                Destination (optional)
                            </label>
                            <input
                                type="text" placeholder="e.g. Vijayawada APMC" value={destination}
                                onChange={e => setDestination(e.target.value)} style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>
                                Date
                            </label>
                            <input type="date" value={date} min={TODAY} onChange={e => setDate(e.target.value)} style={inputStyle} />
                        </div>
                        {error && (
                            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#dc2626' }}>
                                ⚠️ {error}
                            </div>
                        )}
                        <button type="submit" disabled={loading} style={{
                            background: 'linear-gradient(135deg,#1d4ed8,#1e40af)',
                            color: '#fff', border: 'none', borderRadius: 10,
                            padding: '12px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                        }}>
                            {loading ? 'Searching...' : '🔍 Find Vehicles'}
                        </button>
                    </form>
                </div>

                {/* Results */}
                {loading && (
                    <div style={{ textAlign: 'center', padding: '32px', color: '#1d4ed8' }}>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>🚛</div>
                        <p style={{ fontSize: 14, fontWeight: 600 }}>Finding available vehicles...</p>
                    </div>
                )}
                {results !== null && !loading && (
                    <div>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', marginBottom: 10 }}>
                            {results.length > 0 ? `${results.length} VEHICLES AVAILABLE` : 'NO VEHICLES FOUND'}
                        </p>
                        {results.length === 0 && (
                            <div style={{
                                background: '#fff', borderRadius: 14, padding: '32px 20px', textAlign: 'center',
                                border: '1px dashed #e5e7eb',
                            }}>
                                <div style={{ fontSize: 40, marginBottom: 8 }}>😔</div>
                                <p style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>No vehicles available</p>
                                <p style={{ fontSize: 12, color: '#9ca3af' }}>Try a different date or vehicle type</p>
                            </div>
                        )}
                        {results.map((v, i) => (
                            <div key={v.id || i} style={{
                                background: '#fff', borderRadius: 14, padding: '16px',
                                border: '1px solid #e5e7eb', marginBottom: 10,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>
                                            🚛 {v.vehicle_name || v.name || `Vehicle ${i + 1}`}
                                        </p>
                                        <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 0' }}>
                                            {v.capacity ? `Capacity: ${v.capacity} · ` : ''}{v.location || origin}
                                        </p>
                                        <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>
                                            ⭐ {v.rating || '4.3'} · {v.trips_done || 0} trips
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: 16, fontWeight: 800, color: '#1d4ed8', margin: 0 }}>
                                            ₹{v.rate || v.price || '1,200'}/day
                                        </p>
                                        <button
                                            onClick={() => handleBook(v.id, v)}
                                            disabled={booking}
                                            style={{
                                                marginTop: 8, background: '#1d4ed8', color: '#fff',
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
