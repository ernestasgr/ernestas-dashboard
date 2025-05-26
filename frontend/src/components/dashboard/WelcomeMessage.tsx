'use client';

import { useUser } from '@/lib/hooks/use-user';
import { Skeleton } from '../ui/skeleton';

const WelcomeMessage: React.FC = () => {
    const { data, isLoading, isError } = useUser();

    if (isLoading) {
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

    if (isError) {
        return (
            <div className='flex min-h-screen flex-col items-center justify-center'>
                <h1 className='text-3xl font-bold'>Error loading user data</h1>
            </div>
        );
    }

    return (
        <div className='flex min-h-screen flex-col items-center justify-center'>
            <h1 className='text-3xl font-bold'>Dashboard</h1>
            <p className='mt-4'>Welcome to the dashboard {data?.name}!</p>
        </div>
    );
};

export default WelcomeMessage;
