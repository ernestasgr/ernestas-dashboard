import { redirect } from 'next/navigation';
import { AUTH_URLS } from '../constants/urls/auth';
import { FRONTEND_URLS } from '../constants/urls/frontend';

export const redirectToProviderLogin = (provider: string) => {
    redirect(
        `${AUTH_URLS.OAUTH}${provider}?redirect_uri=${encodeURIComponent(FRONTEND_URLS.DASHBOARD)}`,
    );
};

export const getCsrfToken = () => {
    if (typeof document === 'undefined') return '';
    const cookies = document.cookie.split(';');
    const csrfCookie = cookies.find((cookie) =>
        cookie.trim().startsWith('XSRF-TOKEN='),
    );
    return csrfCookie ? decodeURIComponent(csrfCookie.split('=')[1]) : '';
};
