import { useMeQuery } from '@/generated/Auth.generated';
import { appEvents } from '@/lib/events/app-events';
import { redirectToProviderLogin } from '@/lib/utils/auth-utils';
import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { useEffect } from 'react';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface SessionInfo {
    isAuthenticated: boolean;
    lastRefreshAt?: number;
}

export interface MeData {
    email: string;
    name?: string | null;
}

interface AuthStoreState {
    session: SessionInfo;
    me: MeData | null;
    loading: boolean;
    error?: string | null;
}

interface AuthStoreActions {
    hydrateFromMe: (me: MeData | null) => void;
    login: (provider: string) => void;
    logout: (client?: ApolloClient<NormalizedCacheObject>) => Promise<void>;
    refresh: (client?: ApolloClient<NormalizedCacheObject>) => Promise<boolean>;
    setError: (message: string | null) => void;
    setLoading: (loading: boolean) => void;
}

export type AuthStore = AuthStoreState & AuthStoreActions;

export const useAuthStore = create<AuthStore>()(
    subscribeWithSelector((set) => ({
        session: { isAuthenticated: false },
        me: null,
        loading: false,
        error: null,

        hydrateFromMe: (me) => {
            set({
                me,
                session: { isAuthenticated: !!me },
            });
        },

        login: (provider) => {
            redirectToProviderLogin(provider);
        },

        logout: async (client) => {
            try {
                await fetch('/api/logout', {
                    method: 'POST',
                    credentials: 'include',
                }).catch(() => undefined);
            } catch {
            } finally {
                set({ session: { isAuthenticated: false }, me: null });
                try {
                    await client?.clearStore();
                } catch {}
                appEvents.emit('auth:logout', undefined);
            }
        },

        refresh: async () => {
            set((s) => ({
                session: { ...s.session, lastRefreshAt: Date.now() },
            }));
            try {
                const res = await fetch('/api/refresh', {
                    method: 'POST',
                    credentials: 'include',
                });
                if (!res.ok) throw new Error('Refresh failed');
                appEvents.emit('refresh', undefined);
                return true;
            } catch {
                set({ session: { isAuthenticated: false } });
                appEvents.emit('auth:failure', { reason: 'refresh_failed' });
                return false;
            }
        },

        setError: (message) => {
            set({ error: message });
        },
        setLoading: (loading) => {
            set({ loading });
        },
    })),
);

export function useSyncAuthFromMe() {
    const { data, loading, error } = useMeQuery();
    const hydrateFromMe = useAuthStore((s) => s.hydrateFromMe);
    const setLoading = useAuthStore((s) => s.setLoading);
    const setError = useAuthStore((s) => s.setError);

    useEffect(() => {
        setLoading(loading);
    }, [loading, setLoading]);

    useEffect(() => {
        setError(
            error
                ? error instanceof Error
                    ? error.message
                    : JSON.stringify(error)
                : null,
        );
    }, [error, setError]);

    useEffect(() => {
        const me =
            data?.me.__typename === 'AuthPayload'
                ? { email: data.me.email, name: data.me.name ?? null }
                : null;
        hydrateFromMe(me);
    }, [data?.me, hydrateFromMe]);
}
