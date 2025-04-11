export const BASE_URL = process.env.AUTH_SERVICE_URL ?? 'http://localhost:8080';

export const AUTH_URLS = {
    USER_INFO: `${BASE_URL}/me/`,
    REFRESH: `${BASE_URL}/refresh/`,
    OAUTH: `${BASE_URL}/oauth2/authorization/`,
};
