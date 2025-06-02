// app/AuthRedirectListener.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { onAuthFailure } from '../events/auth';

export function AuthRedirectListener() {
    const router = useRouter();

    useEffect(() => {
        onAuthFailure(() => {
            router.push('/login');
        });
    }, [router]);

    return null;
}
