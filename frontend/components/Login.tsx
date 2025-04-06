'use client';

import { Button } from '@/components/ui/button';
import { LucideLogIn } from 'lucide-react';

const Login: React.FC = () => {
    const AUTH_URL = 'http://localhost:8080/oauth2/authorization/';

    const redirectTo = (provider: string) => {
        const frontendUrl = window.location.origin;
        window.location.href = `${AUTH_URL}${provider}?redirect_uri=${encodeURIComponent(frontendUrl)}/dashboard`;
    };

    return (
        <div className='flex min-h-screen flex-col items-center justify-center'>
            <form className='w-80 rounded p-6 shadow-md'>
                <h1 className='mb-4 text-center text-2xl font-bold'>Login</h1>
                <div className='flex flex-col gap-4'>
                    <Button
                        type='button'
                        onClick={() => {
                            redirectTo('google');
                        }}
                        className='w-full'
                    >
                        <LucideLogIn className='mr-2' />
                        Login with Google
                    </Button>
                    <Button
                        type='button'
                        onClick={() => {
                            redirectTo('github');
                        }}
                        className='w-full'
                    >
                        <LucideLogIn className='mr-2' />
                        Login with GitHub
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default Login;
