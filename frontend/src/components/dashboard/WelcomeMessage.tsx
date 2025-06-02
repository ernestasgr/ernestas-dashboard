'use client';

import { useMeQuery } from '@/generated/graphql';
import { useRefetchStore } from '@/lib/stores/use-refetch-store';
import { useEffect } from 'react';
import { Skeleton } from '../ui/skeleton';

const WelcomeMessage: React.FC = () => {
    const { data, loading, error, refetch } = useMeQuery();
    const setRefetch = useRefetchStore((s) => s.setRefetch);

    useEffect(() => {
        setRefetch('me', refetch);
    }, [refetch, setRefetch]);

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
                <h1 className='text-3xl font-bold'>Error</h1>
                <p className='mt-4 text-red-500'>
                    {error.message || 'An unexpected error occurred.'}
                </p>
            </div>
        );
    }

    if (data?.me.__typename === 'AuthPayload') {
        return (
            <div className='flex min-h-screen flex-col items-center justify-center'>
                <h1 className='text-3xl font-bold'>Dashboard</h1>
                <p className='mt-4'>
                    Welcome to the dashboard {data.me.name ?? data.me.email}!
                </p>
            </div>
        );
    }
};

export default WelcomeMessage;
