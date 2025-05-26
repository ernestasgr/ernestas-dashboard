import axios, {
    AxiosError,
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
} from 'axios';
import { AUTH_URLS } from '../constants/urls/auth';
import { triggerAuthFailure } from '../events/auth';

const apiClient: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
});

apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        console.log('Response received:', response);
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
            __isRetry?: boolean;
        };

        // Only retry once if it's a 401
        console.log('Original request:', originalRequest);
        console.log({ error });
        if (error.response?.status === 401 && !originalRequest.__isRetry) {
            originalRequest.__isRetry = true;
            try {
                // Try refreshing the token
                const refreshResult = await axios.get(AUTH_URLS.REFRESH, {
                    withCredentials: true,
                });

                console.log('Refresh token result:', refreshResult.data);
                if (refreshResult.data === 'Invalid refresh token') {
                    throw new Error('Invalid refresh token');
                }

                // Retry the original request
                return await apiClient.request(originalRequest);
            } catch (refreshError) {
                // If refresh fails, redirect to login
                console.error('Refresh token failed:', refreshError);
                triggerAuthFailure();
            }
        }

        // If it's a second 401 or any other 401, redirect to login
        if (error.response?.status === 401 && originalRequest.__isRetry) {
            console.error('Retry after refresh failed. Redirecting to login.');
            triggerAuthFailure();
        }
        console.log('Error response:', error.response);
        return Promise.reject(error);
    },
);

export default apiClient;
