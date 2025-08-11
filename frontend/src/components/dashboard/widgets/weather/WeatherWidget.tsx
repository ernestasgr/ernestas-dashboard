'use client';

import { useWeather } from '@/components/dashboard/hooks/useWeather';
import { WeatherConfig, Widget } from '@/generated/types';
import { WeatherResponse } from '@/lib/types/weather';
import {
    formatLastUpdated,
    formatTemperature,
    getWeatherDescription,
    getWeatherEmoji,
} from '@/lib/utils/weather-utils';
import { AlertCircle, CloudSun, RefreshCw } from 'lucide-react';
import { BaseWidget, useWidgetContext } from '../BaseWidget';

interface WeatherWidgetProps {
    widget: Widget;
    onEdit: (widget: Widget) => void;
    onDelete: (widgetId: string) => void;
    onStyleEdit?: (widget: Widget) => void;
}

const WeatherLoadingContent = () => {
    const { styling } = useWidgetContext();

    return (
        <div className='flex h-full items-center justify-center'>
            <div className='flex flex-col items-center space-y-3'>
                <RefreshCw
                    className='h-8 w-8 animate-spin'
                    style={{ color: styling.textColor ?? undefined }}
                />
                <p
                    className='text-center text-sm'
                    style={{ color: styling.textColor ?? undefined }}
                >
                    Loading weather data...
                </p>
            </div>
        </div>
    );
};

const WeatherErrorContent = ({
    error,
    location,
    onRefresh,
}: {
    error: Error | null;
    location: string;
    onRefresh: () => void;
}) => {
    const { styling } = useWidgetContext();

    return (
        <div className='flex h-full items-center justify-center'>
            <div className='flex flex-col items-center space-y-3 text-center'>
                <AlertCircle
                    className='h-8 w-8'
                    style={{ color: styling.textColor ?? undefined }}
                />
                <div>
                    <p
                        className='text-sm font-medium'
                        style={{ color: styling.textColor ?? undefined }}
                    >
                        {error?.message ?? 'Unable to load weather data'}
                    </p>
                    {location ? (
                        <button
                            onClick={onRefresh}
                            className='mt-2 text-xs underline transition-all hover:no-underline'
                            style={{ color: styling.textColor ?? undefined }}
                        >
                            Try again
                        </button>
                    ) : (
                        <p
                            className='mt-1 text-xs opacity-70'
                            style={{ color: styling.textColor ?? undefined }}
                        >
                            Please configure location in widget settings
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

const WeatherSuccessContent = ({
    weatherData,
    units,
    lastUpdated,
}: {
    weatherData: WeatherResponse;
    units: 'metric' | 'imperial';
    lastUpdated: Date | null;
}) => {
    const { widget, styling } = useWidgetContext();
    const { current, location: weatherLocation } = weatherData;
    const temperature = formatTemperature(
        current.temp_c,
        current.temp_f,
        units,
    );
    const weatherEmoji = getWeatherEmoji(current.condition);
    const weatherDescription = getWeatherDescription(
        current.condition,
        current.humidity,
        current.wind_mph,
        current.wind_kph,
        units,
    );

    return (
        <div className='flex h-full w-full items-center justify-between'>
            <div className='flex flex-col space-y-4'>
                <div className='flex items-center space-x-3'>
                    <BaseWidget.Icon icon={CloudSun} />
                    <BaseWidget.Title>{widget.title}</BaseWidget.Title>
                </div>
                <div className='space-y-1'>
                    <div
                        className='text-3xl font-bold'
                        style={{ color: styling.textColor ?? undefined }}
                    >
                        {temperature}
                    </div>
                    <div
                        className='text-sm font-medium'
                        style={{ color: styling.textColor ?? undefined }}
                    >
                        {weatherLocation.name}, {weatherLocation.region}
                    </div>
                    <div
                        className='text-sm'
                        style={{ color: styling.textColor ?? undefined }}
                    >
                        {weatherDescription}
                    </div>
                    {lastUpdated && (
                        <div
                            className='text-xs opacity-70'
                            style={{ color: styling.textColor ?? undefined }}
                        >
                            Updated {formatLastUpdated(lastUpdated)}
                        </div>
                    )}
                </div>
            </div>
            <div className='flex items-center justify-center text-5xl'>
                {weatherEmoji}
            </div>
        </div>
    );
};

const WeatherRefreshAction = ({ onRefresh }: { onRefresh: () => void }) => {
    const { styling } = useWidgetContext();

    return (
        <BaseWidget.CustomActions>
            <button
                onClick={onRefresh}
                className='transition-all duration-200 hover:scale-110'
                title='Refresh weather data'
            >
                <RefreshCw
                    className='h-4 w-4'
                    style={{ color: styling.textColor ?? undefined }}
                />
            </button>
        </BaseWidget.CustomActions>
    );
};

export const WeatherWidget = ({
    widget,
    onEdit,
    onDelete,
    onStyleEdit,
}: WeatherWidgetProps) => {
    const config = widget.config as WeatherConfig | null;
    const location = config?.location ?? '';
    const units: 'metric' | 'imperial' =
        config?.units === 'imperial' ? 'imperial' : 'metric';

    const {
        data: weatherData,
        isLoading,
        isError,
        error,
        refetch,
        lastUpdated,
    } = useWeather({
        location,
        units,
        enabled: Boolean(location.trim()),
        refetchInterval: 15 * 60 * 1000, // 15 minutes
    });

    const baseClasses =
        'group relative h-full overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-green-50 via-green-100 to-green-200 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl dark:border-slate-700 dark:from-green-900/20 dark:via-green-800/30 dark:to-green-700/40';

    const handleRefresh = () => {
        refetch();
    };

    const renderContent = () => {
        if (isLoading) {
            return <WeatherLoadingContent />;
        }

        if (isError || !weatherData) {
            return (
                <WeatherErrorContent
                    error={error}
                    location={location}
                    onRefresh={handleRefresh}
                />
            );
        }

        return (
            <WeatherSuccessContent
                weatherData={weatherData}
                units={units}
                lastUpdated={lastUpdated}
            />
        );
    };

    return (
        <BaseWidget
            widget={widget}
            baseClasses={baseClasses}
            onEdit={onEdit}
            onDelete={onDelete}
            onStyleEdit={onStyleEdit}
        >
            {!isLoading && weatherData && (
                <WeatherRefreshAction onRefresh={handleRefresh} />
            )}
            <BaseWidget.Content className='flex h-full items-stretch justify-center overflow-hidden p-6'>
                <div className='flex min-h-0 flex-1 items-center'>
                    {renderContent()}
                </div>
            </BaseWidget.Content>
        </BaseWidget>
    );
};
