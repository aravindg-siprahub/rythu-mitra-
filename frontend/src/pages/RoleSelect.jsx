import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { mapSupabaseUserToAppUser, persistAppUserSnapshot } from '../utils/mapSupabaseUser';

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
    setError(null);

    try {
      const { data: authData } = await supabase.auth.getUser();
      const sessionUser = authData?.user;
      const metadata = sessionUser?.user_metadata || {};

      let { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (!session || sessionError) {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError || !refreshData.session) {
          navigate('/login');
          return;
        }
        session = refreshData.session;
      }

      const uid = session.user.id;
      const email = session.user.email || '';
      const displayName =
        metadata.full_name ||
        metadata.name ||
        user.user_metadata?.full_name ||
        email.split('@')[0] ||
        'User';

      // Some DB checks only allow role ∈ { farmer, worker, reg_user }; keep fine-grained choice in user_role.
      const roleForColumn = role === 'supplier' ? 'worker' : role;

      const profileData = {
        id: uid,
        full_name: displayName,
        username: (metadata.username || email.split('@')[0] || 'user').toLowerCase().slice(0, 48),
        role: roleForColumn,
        user_role: role,
        state: metadata.state || 'Andhra Pradesh',
        district: metadata.district || 'Chittoor',
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' });

      if (error) throw error;

      const appUser = mapSupabaseUserToAppUser(session.user);
      if (appUser) {
        appUser.profile = { ...appUser.profile, user_role: role };
        persistAppUserSnapshot(appUser);
      }

      localStorage.setItem('rm_role', role);

      if (role === 'supplier' || role === 'worker') {
        navigate('/work', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      const msg =
        err?.message ||
        err?.error_description ||
        (typeof err === 'object' ? JSON.stringify(err) : String(err));
      console.error('Error saving role:', err);
      setError(msg || 'Unable to save your role. Try again or check your connection.');
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

        {/* Worker (explicit DB role) */}
        <div onClick={() => !loading && handleSelect('worker')} style={{
          background: '#fff', border: '2px solid #E0E0E0',
          borderRadius: 16, padding: 24, marginBottom: 16,
          cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', 
          alignItems: 'center', gap: 20, transition: 'all 0.2s'
        }}
        onMouseEnter={e => !loading && (e.currentTarget.style.borderColor = '#1565C0')}
        onMouseLeave={e => !loading && (e.currentTarget.style.borderColor = '#E0E0E0')}>
          <span style={{ fontSize: 48 }}>🧑‍🌾</span>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#1565C0' }}>
              Farm worker
            </div>
            <div style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
              Find daily wage work, apply, get hired
            </div>
          </div>
        </div>

        {/* Supplier / vehicle owner */}
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
