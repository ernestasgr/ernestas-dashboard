import { WeatherApiResponse, isWeatherError } from '@/lib/types/weather';
import axios from 'axios';

const WEATHER_API_BASE_URL = 'https://api.weatherapi.com/v1';
const WEATHER_API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

if (!WEATHER_API_KEY) {
    console.warn(
        'NEXT_PUBLIC_WEATHER_API_KEY is not set. Weather widget will not function properly.',
    );
}

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
    if (!WEATHER_API_KEY) {
        throw new WeatherApiError(
            1002,
            'Weather API key not configured. Please add NEXT_PUBLIC_WEATHER_API_KEY to your environment variables.',
        );
    }

    try {
        const response = await axios.get(
            `${WEATHER_API_BASE_URL}/current.json`,
            {
                params: {
                    key: WEATHER_API_KEY,
                    q: location,
                    aqi: 'no',
                },
                timeout: 10000,
            },
        );

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
                    'Invalid API key. Please check your weather API configuration.',
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
