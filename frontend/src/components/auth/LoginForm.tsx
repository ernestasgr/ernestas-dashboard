'use client';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { OAUTH_PROVIDERS } from '@/lib/constants/oauth-providers';
import { redirectToProviderLogin } from '@/lib/utils/auth-utils';
import { Loader2, LogIn, Mail } from 'lucide-react';
import { useState } from 'react';

const LoginForm: React.FC = () => {
    const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

    const handleLogin = (provider: string) => {
        setLoadingProvider(provider);
        redirectToProviderLogin(provider);
    };

    return (
        <Card className='supports-[backdrop-filter]:bg-background/70 w-[380px] backdrop-blur'>
            <CardHeader>
                <CardTitle className='text-center text-2xl'>
                    Welcome back
                </CardTitle>
                <CardDescription className='text-center'>
                    Sign in to continue to your dashboard
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className='flex flex-col gap-3'>
                    <Button
                        type='button'
                        onClick={() => {
                            handleLogin(OAUTH_PROVIDERS.GOOGLE);
                        }}
                        className='w-full cursor-pointer'
                        variant='outline'
                        name='login-with-google'
                        disabled={!!loadingProvider}
                    >
                        {loadingProvider === OAUTH_PROVIDERS.GOOGLE ? (
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        ) : (
                            <Mail className='mr-2 h-4 w-4' />
                        )}
                        {loadingProvider === OAUTH_PROVIDERS.GOOGLE
                            ? 'Redirecting...'
                            : 'Login with Google'}
                    </Button>
                    <Button
                        type='button'
                        onClick={() => {
                            handleLogin(OAUTH_PROVIDERS.GITHUB);
                        }}
                        className='w-full cursor-pointer'
                        name='login-with-github'
                        disabled={!!loadingProvider}
                    >
                        {loadingProvider === OAUTH_PROVIDERS.GITHUB ? (
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        ) : (
                            <LogIn className='mr-2 h-4 w-4' />
                        )}
                        {loadingProvider === OAUTH_PROVIDERS.GITHUB
                            ? 'Redirecting...'
                            : 'Login with GitHub'}
                    </Button>
                    <div className='text-muted-foreground flex items-center justify-center gap-2 pt-1 text-xs'>
                        <LogIn className='h-3.5 w-3.5' />
                        You will be redirected to the provider
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default LoginForm;
