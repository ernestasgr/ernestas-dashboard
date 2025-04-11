'use client';

import { useEffect, useState } from 'react';
import apiClient from '../api/api-client';
import { AUTH_URLS } from '../constants/urls/auth';
import { AuthContext } from '../contexts/auth-context';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await apiClient.get(AUTH_URLS.USER_INFO);
                setIsAuthenticated(true);
            } catch {
                setIsAuthenticated(false);
            }
        };

        void checkAuth();
    }, []);

    return (
        <AuthContext.Provider
            value={{ isAuthenticated, isRefreshing, setIsRefreshing }}
        >
            {children}
        </AuthContext.Provider>
    );
};
