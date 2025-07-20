import {
    fetchCurrentWeather,
    FetchWeatherParams,
    WeatherApiError,
} from '@/lib/services/weather-api';
import { isWeatherError, WeatherResponse } from '@/lib/types/weather';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

export interface UseWeatherOptions {
    location: string;
    units?: 'metric' | 'imperial';
    enabled?: boolean;
    refetchInterval?: number; // in milliseconds
}

export interface UseWeatherReturn {
    data: WeatherResponse | null;
    isLoading: boolean;
    isError: boolean;
    error: WeatherApiError | null;
    refetch: () => void;
    lastUpdated: Date | null;
}

const WEATHER_QUERY_KEY = 'weather';
const DEFAULT_REFETCH_INTERVAL = 15 * 60 * 1000; // 15 minutes

export function useWeather({
    location,
    units = 'metric',
    enabled = true,
    refetchInterval = DEFAULT_REFETCH_INTERVAL,
}: UseWeatherOptions): UseWeatherReturn {
    const queryKey = useMemo(
        () => [WEATHER_QUERY_KEY, { location, units }],
        [location, units],
    );

    const {
        data,
        isLoading,
        isError,
        error,
        refetch: queryRefetch,
        dataUpdatedAt,
    } = useQuery({
        queryKey,
        queryFn: async (): Promise<WeatherResponse> => {
            const params: FetchWeatherParams = { location, units };
            const result = await fetchCurrentWeather(params);

            if (isWeatherError(result)) {
                throw new WeatherApiError(
                    result.error.code,
                    result.error.message,
                );
            }

            return result;
        },
        enabled: enabled && Boolean(location.trim()),
        refetchInterval,
        retry: (failureCount, error) => {
            if (error instanceof WeatherApiError) {
                // Don't retry on API key issues or location not found
                if (error.code === 1002 || error.code === 1006) {
                    return false;
                }
            }
            // Retry up to 3 times for other errors
            return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    });

    const refetch = useCallback(() => {
        void queryRefetch();
    }, [queryRefetch]);

    const lastUpdated = useMemo(() => {
        return dataUpdatedAt ? new Date(dataUpdatedAt) : null;
    }, [dataUpdatedAt]);

    return {
        data: data ?? null,
        isLoading,
        isError,
        error: isError && error instanceof WeatherApiError ? error : null,
        refetch,
        lastUpdated,
    };
}

/**
 * Prefetch weather data for a location
 */
export function usePrefetchWeather() {
    const queryClient = useQueryClient();

    return useCallback(
        async (location: string, units: 'metric' | 'imperial' = 'metric') => {
            const queryKey = [WEATHER_QUERY_KEY, { location, units }];

            await queryClient.prefetchQuery({
                queryKey,
                queryFn: async (): Promise<WeatherResponse> => {
                    const params: FetchWeatherParams = { location, units };
                    const result = await fetchCurrentWeather(params);

                    if (isWeatherError(result)) {
                        throw new WeatherApiError(
                            result.error.code,
                            result.error.message,
                        );
                    }

                    return result;
                },
                staleTime: 5 * 60 * 1000,
            });
        },
        [queryClient],
    );
}
