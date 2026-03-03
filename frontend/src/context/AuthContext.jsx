import React, {
    createContext,
    useContext,
    useState,
    useEffect
} from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Restore session from localStorage on mount
    useEffect(() => {
        try {
            const t = localStorage.getItem('rythu_token');
            const u = localStorage.getItem('rythu_user');
            if (t && u) {
                setToken(t);
                setUser(JSON.parse(u));
            }
        } catch (e) {
            // Corrupted storage — clear it
            localStorage.removeItem('rythu_token');
            localStorage.removeItem('rythu_user');
        } finally {
            setLoading(false);
        }
    }, []);

    const saveSession = (tok, refresh, userData) => {
        setToken(tok);
        setUser(userData);
        setError(null);
        localStorage.setItem('rythu_token', tok);
        localStorage.setItem('rythu_refresh', refresh || '');
        localStorage.setItem('rythu_user', JSON.stringify(userData));
    };

    const login = async (username, password) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post(`${API}/auth/login/`, {
                username,
                password
            });
            saveSession(res.data.token, res.data.refresh_token, res.data.user);
            return { success: true, user: res.data.user };
        } catch (err) {
            const msg =
                err.response?.data?.error ||
                'Login failed. Check your credentials.';
            setError(msg);
            return { success: false, error: msg };
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post(`${API}/auth/register/`, userData);
            if (res.data.token) {
                saveSession(res.data.token, res.data.refresh_token, res.data.user);
            }
            return { success: true, user: res.data.user, token: res.data.token };
        } catch (err) {
            const errData = err.response?.data;
            const msg =
                errData?.error ||
                (errData?.errors
                    ? Object.values(errData.errors)[0]
                    : null) ||
                'Registration failed. Please try again.';
            setError(msg);
            return { success: false, error: msg, errors: errData?.errors };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            if (token) {
                await axios.post(
                    `${API}/auth/logout/`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
        } catch (e) {
            // Ignore logout errors — always clear local state
        }
        setUser(null);
        setToken(null);
        setError(null);
        localStorage.removeItem('rythu_token');
        localStorage.removeItem('rythu_refresh');
        localStorage.removeItem('rythu_user');
    };

    const updateProfile = async (data) => {
        try {
            await axios.patch(`${API}/auth/profile/`, data, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const updated = { ...user, ...data };
            setUser(updated);
            localStorage.setItem('rythu_user', JSON.stringify(updated));
            return { success: true };
        } catch (err) {
            return {
                success: false,
                error: err.response?.data?.error || 'Update failed'
            };
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                error,
                isLoggedIn: !!token && !!user,
                login,
                register,
                logout,
                updateProfile
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used inside <AuthProvider>');
    }
    return ctx;
};

export default AuthContext;
