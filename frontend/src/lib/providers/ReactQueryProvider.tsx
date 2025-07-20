'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

interface ReactQueryProviderProps {
    children: React.ReactNode;
}

/**
 * Provides React Query (TanStack Query) context to the application.
 * Creates a QueryClient with optimized defaults for caching and error handling.
 */
export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 5 * 60 * 1000, // 5 minutes
                        gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
                        retry: 3,
                        retryDelay: (attemptIndex) =>
                            Math.min(1000 * 2 ** attemptIndex, 30000),
                        refetchOnWindowFocus: false,
                        refetchOnReconnect: true,
                        refetchOnMount: true,
                    },
                    mutations: {
                        retry: 1,
                        retryDelay: 1000,
                    },
                },
            }),
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {process.env.NODE_ENV === 'development' && (
                <ReactQueryDevtools initialIsOpen={false} />
            )}
        </QueryClientProvider>
    );
}
