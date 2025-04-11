import { redirect } from 'next/navigation';
import { AUTH_URLS } from '../constants/urls/auth';
import { FRONTEND_URLS } from '../constants/urls/frontend';

export const redirectToProviderLogin = (provider: string) => {
    redirect(
        `${AUTH_URLS.OAUTH}${provider}?redirect_uri=${encodeURIComponent(FRONTEND_URLS.DASHBOARD)}`,
    );
};
