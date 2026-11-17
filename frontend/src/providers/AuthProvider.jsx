'use client';
import { createContext, useContext, useState, useEffect, useCallback, } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '../services/auth.service';
import { ROUTES, ROLE_HOME } from '../lib/constants';
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    // Initialize from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
            catch {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setIsLoading(false);
    }, []);
    const login = useCallback(async (email, password) => {
        const result = await authApi.login(email, password);
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        setToken(result.token);
        setUser(result.user);
        return result.user;
    }, []);
    const signup = useCallback(async (data) => {
        const result = await authApi.signup(data);
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        setToken(result.token);
        setUser(result.user);
        return result.user;
    }, []);
    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        }
        catch {
            // Ignore — client-side logout still proceeds
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        router.push(ROUTES.LOGIN);
    }, [router]);
    const refreshUser = useCallback(async () => {
        try {
            const me = await authApi.me();
            localStorage.setItem('user', JSON.stringify(me));
            setUser(me);
        }
        catch {
            // Token might be invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
        }
    }, []);
    const value = {
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        signup,
        logout,
        refreshUser,
    };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return ctx;
}
/** Redirect to role-based home. */
export function getHomeRoute(role) {
    return ROLE_HOME[role] || ROUTES.LOGIN;
}
