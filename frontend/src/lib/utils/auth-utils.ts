import { redirect } from 'next/navigation';
import { AUTH_URLS } from '../constants/urls/auth';
import { FRONTEND_URLS } from '../constants/urls/frontend';

export const redirectToProviderLogin = (provider: string) => {
    redirect(
        `${AUTH_URLS.OAUTH}${provider}?redirect_uri=${encodeURIComponent(FRONTEND_URLS.DASHBOARD)}`,
    );
};

let csrfToken: string | null = null;

export async function initCsrfToken(gatewayBaseUrl: string): Promise<void> {
    try {
        const res = await fetch(`${gatewayBaseUrl}/csrf-token`, {
            credentials: 'include',
        });
        const data: unknown = await res.json();
        if (
            typeof data === 'object' &&
            data !== null &&
            'token' in data &&
            typeof (data as { token: unknown }).token === 'string'
        ) {
            csrfToken = (data as { token: string }).token;
            console.log('CSRF token initialized');
        } else {
            console.warn('Invalid CSRF token response');
        }
    } catch (error) {
        console.error('Failed to initialize CSRF token:', error);
    }
}

export function getCsrfToken(): string | null {
    return csrfToken;
}
