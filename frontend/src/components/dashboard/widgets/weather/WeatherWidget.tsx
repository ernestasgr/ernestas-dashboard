'use client';

import { useWeather } from '@/components/dashboard/hooks/useWeather';
import {
    applyTextColor,
    useWidgetStyling,
} from '@/components/dashboard/hooks/useWidgetStyling';
import { WeatherConfig, Widget } from '@/generated/types';
import {
    formatLastUpdated,
    formatTemperature,
    getWeatherDescription,
    getWeatherEmoji,
} from '@/lib/utils/weather-utils';
import { AlertCircle, CloudSun, GripVertical, RefreshCw } from 'lucide-react';
import { WidgetActions } from '../WidgetActions';

interface WeatherWidgetProps {
    widget: Widget;
    onEdit: (widget: Widget) => void;
    onDelete: (widgetId: string) => void;
    onStyleEdit?: (widget: Widget) => void;
}

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

    const styling = useWidgetStyling(widget, baseClasses);

    const handleRefresh = () => {
        refetch();
    };

    if (isLoading) {
        return (
            <div
                className={styling.containerClasses}
                style={styling.containerStyles}
            >
                <WidgetActions
                    widget={widget}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStyleEdit={onStyleEdit}
                />
                <div className='drag-handle absolute top-2 right-2 cursor-move opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
                    <GripVertical
                        className='h-5 w-5'
                        style={styling.iconStyles.foreground}
                    />
                </div>
                <div className='flex h-full items-center justify-center p-6'>
                    <div className='flex flex-col items-center space-y-3'>
                        <RefreshCw
                            className='h-8 w-8 animate-spin'
                            style={styling.iconStyles.foreground}
                        />
                        <p
                            className='text-center text-sm'
                            style={applyTextColor(styling.textColor)}
                        >
                            Loading weather data...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !weatherData) {
        return (
            <div
                className={styling.containerClasses}
                style={styling.containerStyles}
            >
                <WidgetActions
                    widget={widget}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStyleEdit={onStyleEdit}
                />
                <div className='drag-handle absolute top-2 right-2 cursor-move opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
                    <GripVertical
                        className='h-5 w-5'
                        style={styling.iconStyles.foreground}
                    />
                </div>
                <div className='flex h-full items-center justify-center p-6'>
                    <div className='flex flex-col items-center space-y-3 text-center'>
                        <AlertCircle
                            className='h-8 w-8'
                            style={styling.iconStyles.foreground}
                        />
                        <div>
                            <p
                                className='text-sm font-medium'
                                style={applyTextColor(styling.textColor)}
                            >
                                {error?.message ??
                                    'Unable to load weather data'}
                            </p>
                            {location ? (
                                <button
                                    onClick={handleRefresh}
                                    className='mt-2 text-xs underline transition-all hover:no-underline'
                                    style={applyTextColor(styling.textColor)}
                                >
                                    Try again
                                </button>
                            ) : (
                                <p
                                    className='mt-1 text-xs opacity-70'
                                    style={applyTextColor(styling.textColor)}
                                >
                                    Please configure location in widget settings
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
        <div
            className={styling.containerClasses}
            style={styling.containerStyles}
        >
            <WidgetActions
                widget={widget}
                onEdit={onEdit}
                onDelete={onDelete}
                onStyleEdit={onStyleEdit}
            />
            <div className='drag-handle absolute top-2 right-2 cursor-move opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
                <GripVertical
                    className='h-5 w-5'
                    style={styling.iconStyles.foreground}
                />
            </div>

            <button
                onClick={handleRefresh}
                className='absolute top-2 right-10 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:scale-110'
                title='Refresh weather data'
            >
                <RefreshCw
                    className='h-4 w-4'
                    style={styling.iconStyles.foreground}
                />
            </button>

            <div className='flex h-full items-center justify-between p-6'>
                <div className='flex flex-col space-y-4'>
                    <div className='flex items-center space-x-3'>
                        <div
                            className='flex items-center justify-center rounded-full p-2'
                            style={styling.iconStyles.background}
                        >
                            <CloudSun
                                className='h-6 w-6'
                                style={{
                                    ...styling.iconStyles.foreground,
                                    ...(styling.textColor
                                        ? { color: styling.textColor }
                                        : {}),
                                }}
                            />
                        </div>
                        <h3
                            className='text-lg font-semibold'
                            style={applyTextColor(styling.textColor)}
                        >
                            {widget.title}
                        </h3>
                    </div>
                    <div className='space-y-1'>
                        <div
                            className='text-3xl font-bold'
                            style={applyTextColor(styling.textColor)}
                        >
                            {temperature}
                        </div>
                        <div
                            className='text-sm font-medium'
                            style={applyTextColor(styling.textColor)}
                        >
                            {weatherLocation.name}, {weatherLocation.region}
                        </div>
                        <div
                            className='text-sm'
                            style={applyTextColor(styling.textColor)}
                        >
                            {weatherDescription}
                        </div>
                        {lastUpdated && (
                            <div
                                className='text-xs opacity-70'
                                style={applyTextColor(styling.textColor)}
                            >
                                Updated {formatLastUpdated(lastUpdated)}
                            </div>
                        )}
                    </div>
                </div>
                <div className='text-5xl'>{weatherEmoji}</div>
            </div>
        </div>
    );
};
