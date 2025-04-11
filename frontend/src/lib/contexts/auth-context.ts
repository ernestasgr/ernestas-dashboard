'use client';

import { createContext } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    isRefreshing: boolean;
    setIsRefreshing: (val: boolean) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
