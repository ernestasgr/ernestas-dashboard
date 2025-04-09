import axios, {
    AxiosError,
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
} from 'axios';

const apiClient: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
});

apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            try {
                await axios.get('http://localhost:8080/refresh/', {
                    withCredentials: true,
                });
                return await apiClient.request(
                    error.config as AxiosRequestConfig,
                );
            } catch (refreshError) {
                console.error('Refresh token failed:', refreshError);
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    },
);

export default apiClient;
