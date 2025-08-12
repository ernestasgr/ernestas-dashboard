'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useMeQuery } from '@/generated/Auth.generated';
import { useAuthStore, useSyncAuthFromMe } from '@/lib/stores/auth-store';
import { useEventStore } from '@/lib/stores/use-event-store';
import { useEffect } from 'react';
import Grid from '../../components/dashboard/grid/Grid';

export default function Dashboard() {
    const { loading: gqlLoading, error: gqlError, refetch } = useMeQuery();
    useSyncAuthFromMe();
    const loading = useAuthStore((s) => s.loading) || gqlLoading;
    const error =
        useAuthStore((s) => s.error) ?? (gqlError ? gqlError.message : null);
    const setEventListener = useEventStore((s) => s.subscribe);

    useEffect(() => {
        const unsubscribe = setEventListener('refresh', () => {
            refetch().catch((error: unknown) => {
                console.error('Failed to refetch user data:', error);
            });
        });

        return unsubscribe;
    }, [refetch, setEventListener]);

    if (loading) {
        return (
            <div className='flex min-h-screen flex-col items-center justify-center gap-3'>
                <Skeleton className='h-8 w-60' data-testid='skeleton-title' />
                <Skeleton
                    className='h-6 w-80'
                    data-testid='skeleton-subtitle'
                />
            </div>
        );
    }

    if (error) {
        return (
            <div className='flex min-h-screen flex-col items-center justify-center'>
                <h1
                    className='text-3xl font-semibold'
                    data-testid='error-heading'
                >
                    Something went wrong
                </h1>
                <p
                    className='text-muted-foreground mt-2'
                    data-testid='error-message'
                >
                    {error || 'An unexpected error occurred.'}
                </p>
            </div>
        );
    }

    return (
        <div
            data-testid='dashboard-heading'
            className='flex min-h-dvh w-full flex-col p-3'
        >
            <Grid />
        </div>
    );
}
