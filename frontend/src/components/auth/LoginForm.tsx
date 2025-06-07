'use client';

import { Button } from '@/components/ui/button';
import { OAUTH_PROVIDERS } from '@/lib/constants/oauth-providers';
import { redirectToProviderLogin } from '@/lib/utils/auth-utils';
import { LucideLogIn } from 'lucide-react';
import { useState } from 'react';

const LoginForm: React.FC = () => {
    const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

    const handleLogin = (provider: string) => {
        setLoadingProvider(provider);
        redirectToProviderLogin(provider);
    };

    return (
        <div className='flex min-h-screen flex-col items-center justify-center'>
            <form className='w-80 rounded p-6 shadow-md'>
                <h1 className='mb-4 text-center text-2xl font-bold'>Login</h1>
                <div className='flex flex-col gap-4'>
                    {[OAUTH_PROVIDERS.GOOGLE, OAUTH_PROVIDERS.GITHUB].map(
                        (provider) => (
                            <Button
                                key={provider}
                                type='button'
                                onClick={() => {
                                    handleLogin(provider);
                                }}
                                className='w-full'
                                disabled={loadingProvider !== null}
                                name={`login-with-${provider}`}
                            >
                                <LucideLogIn className='mr-2' />
                                {loadingProvider === provider
                                    ? 'Redirecting...'
                                    : `Login with ${provider.charAt(0).toUpperCase() + provider.slice(1)}`}
                            </Button>
                        ),
                    )}
                </div>
            </form>
        </div>
    );
};

export default LoginForm;
