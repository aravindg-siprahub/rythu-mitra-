import React, {
    createContext,
    useContext,
    useState,
    useEffect
} from 'react';
import { supabase } from '../config/supabaseClient';

const AuthContext = createContext(null);

function syncApiTokensFromSession(session) {
    const access = session?.access_token || '';
    const refresh = session?.refresh_token || '';
    if (access) localStorage.setItem('rythu_token', access);
    else localStorage.removeItem('rythu_token');
    if (refresh) localStorage.setItem('rythu_refresh', refresh);
    else localStorage.removeItem('rythu_refresh');
}

export function AuthProvider({ children }) {
    const [user, setUser]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

    useEffect(() => {
        let isMounted = true;

        const init = async () => {
            try {
                const { data, error: sessionError } = await supabase.auth.getSession();
                if (sessionError) throw sessionError;
                if (!isMounted) return;
                setUser(data?.session?.user ?? null);
                syncApiTokensFromSession(data?.session ?? null);
            } catch (e) {
                if (!isMounted) return;
                setUser(null);
                syncApiTokensFromSession(null);
            } finally {
                if (!isMounted) return;
                setLoading(false);
            }
        };

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!isMounted) return;
            setUser(session?.user ?? null);
            syncApiTokensFromSession(session ?? null);
            setLoading(false);
        });

        init();

        return () => {
            isMounted = false;
            authListener?.subscription?.unsubscribe?.();
        };
    }, []);

    // ── Login ────────────────────────────────────────────────────
    const login = async (email, password) => {
        try {
            setError(null);
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                const msg = authError.message || 'Login failed. Check your credentials.';
                setError(msg);
                return { success: false, error: msg };
            }

            syncApiTokensFromSession(data?.session ?? null);

            return { success: true, user: data?.user ?? null, session: data?.session ?? null };
        } catch (e) {
            const msg = 'Network error. Please check your connection.';
            setError(msg);
            return { success: false, error: msg };
        }
    };

    // ── Register ─────────────────────────────────────────────────
    const register = async (payload) => {
        try {
            setError(null);
            const email = payload?.email;
            const password = payload?.password;

            const { data, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: payload?.data || {},
                },
            });

            if (authError) {
                return { success: false, error: authError.message || 'Registration failed.' };
            }

            syncApiTokensFromSession(data?.session ?? null);

            return { success: true, user: data?.user ?? null, session: data?.session ?? null };
        } catch (e) {
            return { success: false, error: 'Network error. Please check your connection.' };
        }
    };

    // ── Logout ───────────────────────────────────────────────────
    const logout = async () => {
        setError(null);
        localStorage.removeItem('rm_role');
        syncApiTokensFromSession(null);
        try {
            await supabase.auth.signOut();
        } catch {
            // noop
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            error,
            isAuthenticated: !!user,
            login,
            register,
            logout,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

export default AuthContext;
