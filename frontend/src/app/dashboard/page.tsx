'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useMeQuery } from '@/generated/Auth.generated';
import { useEventStore } from '@/lib/stores/use-event-store';
import { useEffect } from 'react';
import Grid from '../../components/dashboard/grid/Grid';

export default function Dashboard() {
    const { loading, error, refetch } = useMeQuery();
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
            <div className='flex min-h-screen flex-col items-center justify-center'>
                <Skeleton
                    className='mb-4 h-8 w-60'
                    data-testid='skeleton-title'
                />
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
                <h1 className='text-3xl font-bold' data-testid='error-heading'>
                    Error
                </h1>
                <p className='mt-4 text-red-500' data-testid='error-message'>
                    {error.message || 'An unexpected error occurred.'}
                </p>
            </div>
        );
    }

    return (
        <div data-testid='dashboard-heading'>
            <Grid />
        </div>
    );
}
