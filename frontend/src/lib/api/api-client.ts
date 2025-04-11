import axios, {
    AxiosError,
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
} from 'axios';
import { redirect } from 'next/navigation';
import { AUTH_URLS } from '../constants/urls/auth';

const apiClient: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
});

apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            try {
                await axios.get(AUTH_URLS.REFRESH, {
                    withCredentials: true,
                });
                return await apiClient.request(
                    error.config as AxiosRequestConfig,
                );
            } catch (refreshError) {
                console.error('Refresh token failed:', refreshError);
                redirect('/login');
            }
        }
        return Promise.reject(error);
    },
);

export default apiClient;
