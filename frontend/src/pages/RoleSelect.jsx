import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function RoleSelect() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fix 3 — Redirect to login if no valid session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
    };
    checkSession();
  }, [navigate]);

  const handleSelect = async (role) => {
    if (!user) return;
    setLoading(true);

    try {
      // 1. Fetch metadata from Auth as fallback (in case profile is missing)
      const { data: authData } = await supabase.auth.getUser();
      const metadata = authData?.user?.user_metadata || {};
      
      // 2. Prepare profile data
      const profileData = {
        id: user.id,
        role: role,
        user_role: role,
        updated_at: new Date().toISOString()
      };

      // If user profile is missing some required fields, satisfy them from metadata or defaults
      if (!user.profile?.full_name) {
        profileData.full_name = user.full_name || metadata.full_name || 'User';
      }
      if (!user.profile?.state) {
        profileData.state = 'Andhra Pradesh';
      }
      if (!user.profile?.district) {
        profileData.district = 'Chittoor';
      }

      // Fix 1 — Validate session before saving; refresh if expired
      let { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (!session || sessionError) {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError || !refreshData.session) {
          navigate('/login');
          return;
        }
        session = refreshData.session;
      }

      // 3. Save to Supabase profiles table
      const { error } = await supabase
        .from('profiles')
        .upsert({ ...profileData, id: session.user.id });

      if (error) throw error;

      // 2. Cache in localStorage
      localStorage.setItem('rm_role', role);

      // 3. Navigate based on role
      if (role === 'supplier') {
        navigate('/booking', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      console.error('Error saving role:', err);
      setError('Unable to save your role. Please log in again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#F0FDF4', padding: '16px'
    }}>
      <div style={{
        background: '#fff', padding: '32px 24px', borderRadius: 24,
        boxShadow: '0 10px 40px rgba(0,0,0,0.08)', width: '100%', maxWidth: 400
      }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1B5E20',
          textAlign: 'center', marginBottom: 8 }}>
          I am a...
        </h2>
        <p style={{ textAlign: 'center', color: '#666', fontSize: 16,
          marginBottom: 32 }}>
          Choose your role to get started
        </p>

        {/* Farmer Card */}
        <div onClick={() => !loading && handleSelect('farmer')} style={{
          background: '#fff', border: '2px solid #E0E0E0',
          borderRadius: 16, padding: 24, marginBottom: 16,
          cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', 
          alignItems: 'center', gap: 20, transition: 'all 0.2s'
        }}
        onMouseEnter={e => !loading && (e.currentTarget.style.borderColor = '#2E7D32')}
        onMouseLeave={e => !loading && (e.currentTarget.style.borderColor = '#E0E0E0')}>
          <span style={{ fontSize: 48 }}>🌾</span>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#1B5E20' }}>
              Farmer
            </div>
            <div style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
              Post jobs, find workers, tractors & transport
            </div>
          </div>
        </div>

        {/* Supplier Card */}
        <div onClick={() => !loading && handleSelect('supplier')} style={{
          background: '#fff', border: '2px solid #E0E0E0',
          borderRadius: 16, padding: 24, marginBottom: 16,
          cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', 
          alignItems: 'center', gap: 20, transition: 'all 0.2s'
        }}
        onMouseEnter={e => !loading && (e.currentTarget.style.borderColor = '#1565C0')}
        onMouseLeave={e => !loading && (e.currentTarget.style.borderColor = '#E0E0E0')}>
          <span style={{ fontSize: 48 }}>🚜</span>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#1565C0' }}>
              Worker / Vehicle Owner
            </div>
            <div style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
              Browse jobs, apply, earn daily income
            </div>
          </div>
        </div>

        {/* Fix 2 — Show error message if session/save fails */}
        {error && (
          <p style={{ fontSize: 13, color: 'var(--color-text-danger, #D32F2F)',
            textAlign: 'center', marginTop: 12 }}>
            {error}
          </p>
        )}

        <p style={{ textAlign: 'center', fontSize: 13, color: '#999',
          marginTop: 12 }}>
          {loading ? 'Saving choice...' : 'You can only choose once. Contact support to change.'}
        </p>
      </div>
    </div>
  );
}
