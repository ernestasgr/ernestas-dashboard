// app/AuthRedirectListener.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { onAuthFailure } from '../events/auth';

export function AuthRedirectListener() {
    const router = useRouter();

    useEffect(() => {
        onAuthFailure(() => {
            console.trace('Auth failure detected, redirecting to login');
            router.push('/login');
        });
    }, [router]);

    return null;
}
