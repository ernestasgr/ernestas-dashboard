'use client';

import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import apiClient from '../apiClient';

const userSchema = z.object({
    name: z.string(),
    email: z.string().email(),
});

type UserData = z.infer<typeof userSchema>;

const DashboardWelcomeMessage: React.FC = () => {
    const AUTH_URL = 'http://localhost:8080/me/';

    const {
        data: userData,
        isLoading,
        isError,
    } = useQuery<UserData>({
        queryKey: ['userData'],
        queryFn: async () => {
            const { data }: { data: unknown } = await apiClient.get(AUTH_URL);
            return userSchema.parse(data);
        },
    });

    if (isLoading) {
        return (
            <div className='flex min-h-screen flex-col items-center justify-center'>
                <h1 className='text-3xl font-bold'>Loading user data...</h1>
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
            <p className='mt-4'>Welcome to the dashboard {userData?.name}!</p>
        </div>
    );
};

export default DashboardWelcomeMessage;
