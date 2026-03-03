import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps protected routes. Redirects to /login if not authenticated.
 * Shows a full-page green spinner while auth state is loading.
 */
const ProtectedRoute = ({ children }) => {
    const { isLoggedIn, loading } = useAuth();

    if (loading) {
        return (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    background: '#f0fdf4',
                    flexDirection: 'column',
                    gap: 16
                }}
            >
                <div
                    style={{
                        width: 48,
                        height: 48,
                        border: '4px solid #16a34a',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'rythu-spin 0.8s linear infinite'
                    }}
                />
                <style>{`@keyframes rythu-spin { to { transform: rotate(360deg); } }`}</style>
                <p style={{ color: '#16a34a', fontWeight: 600, fontSize: 14 }}>
                    Loading...
                </p>
            </div>
        );
    }

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
