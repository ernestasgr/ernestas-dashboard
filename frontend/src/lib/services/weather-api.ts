import { WeatherApiResponse, isWeatherError } from '@/lib/types/weather';
import axios from 'axios';

export class WeatherApiError extends Error {
    constructor(
        public code: number,
        message: string,
    ) {
        super(message);
        this.name = 'WeatherApiError';
    }
}

export interface FetchWeatherParams {
    location: string;
    units?: 'metric' | 'imperial';
}

export async function fetchCurrentWeather({
    location,
}: FetchWeatherParams): Promise<WeatherApiResponse> {
    try {
        const response = await axios.get('/api/weather', {
            params: {
                location,
            },
            timeout: 15000,
        });

        const data = response.data as WeatherApiResponse;

        if (isWeatherError(data)) {
            throw new WeatherApiError(data.error.code, data.error.message);
        }

        return data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (
                error.response?.data &&
                typeof error.response.data === 'object' &&
                'error' in error.response.data
            ) {
                const data = error.response.data as {
                    error: { code: number; message: string };
                };
                const apiError = data.error;
                throw new WeatherApiError(apiError.code, apiError.message);
            }

            if (error.code === 'ECONNABORTED') {
                throw new WeatherApiError(
                    9999,
                    'Request timeout. Please try again.',
                );
            }

            if (error.response?.status === 401) {
                throw new WeatherApiError(
                    1002,
                    'Weather service authentication failed.',
                );
            }

            if (error.response?.status && error.response.status >= 500) {
                throw new WeatherApiError(
                    9999,
                    'Weather service temporarily unavailable.',
                );
            }

            throw new WeatherApiError(9999, `Network error: ${error.message}`);
        }

        if (error instanceof WeatherApiError) {
            throw error;
        }

        throw new WeatherApiError(
            9999,
            'Unknown error occurred while fetching weather data.',
        );
    }
}
