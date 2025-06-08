import { env } from '@/lib/utils/env-utils';

export const AUTH_URLS = {
    OAUTH: `${env.NEXT_PUBLIC_GATEWAY_DOMAIN}/oauth2/authorization/`,
};
