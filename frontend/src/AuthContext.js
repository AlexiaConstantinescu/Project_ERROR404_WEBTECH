import React, { createContext, useContext, useEffect, useState } from 'react';
import { getProfile } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }
        (async () => {
            try {
                const res = await getProfile();
                setUser(res.data);
            } catch (e) {
                console.warn('Auth load failed', e);
                localStorage.removeItem('token');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const loginWithToken = (token, userData) => {
        if (token) localStorage.setItem('token', token);
        setUser(userData || null);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginWithToken, logout, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
