'use client';

import { useMeQuery } from '@/generated/graphql';
import { triggerAuthFailure } from '@/lib/events/auth';
import { Skeleton } from '../ui/skeleton';

const WelcomeMessage: React.FC = () => {
    const { data, loading, error } = useMeQuery();

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
        triggerAuthFailure();
        return null;
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
