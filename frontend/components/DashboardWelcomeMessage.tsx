'use client';

import { useEffect, useState } from 'react';
import { z } from 'zod';

const userSchema = z.object({
    name: z.string(),
    email: z.string().email(),
});

type UserData = z.infer<typeof userSchema>;

const DashboardWelcomeMessage: React.FC = () => {
    const AUTH_URL = 'http://localhost:8080/me/';
    const [userData, setUserData] = useState<UserData | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(AUTH_URL, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-Token': document.cookie
                            .split('; ')
                            .find((row) => row.startsWith('csrftoken='))
                            ?.split('=')[1] as string,
                    },
                });

                console.log(response);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                const parsedData = userSchema.parse(data);
                if (parsedData) {
                    setUserData(parsedData);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

    return (
        <>
            {userData && (
                <div className='flex min-h-screen flex-col items-center justify-center'>
                    <h1 className='text-3xl font-bold'>Dashboard</h1>
                    <p className='mt-4'>
                        Welcome to the dashboard {userData.name}!
                    </p>
                </div>
            )}
            {!userData && (
                <div className='flex min-h-screen flex-col items-center justify-center'>
                    <h1 className='text-3xl font-bold'>Loading user data...</h1>
                </div>
            )}
        </>
    );
};

export default DashboardWelcomeMessage;
