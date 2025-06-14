import { env } from '@/lib/utils/env-utils';

const gateway = env.NEXT_PUBLIC_GATEWAY_DOMAIN.replace(/\/$/, '');

export const AUTH_URLS = {
    OAUTH: `${gateway}/oauth2/authorization/`,
};
