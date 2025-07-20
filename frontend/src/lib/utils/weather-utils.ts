import { WeatherCondition } from '@/lib/types/weather';

/**
 * Maps weather condition codes to emoji icons
 * Based on WeatherAPI.com condition codes
 */
export function getWeatherEmoji(condition: WeatherCondition): string {
    const code = condition.code;

    // Sunny/Clear
    if (code === 1000) {
        return condition.icon.includes('day') ? '☀️' : '🌙';
    }

    // Partly cloudy
    if (code === 1003) {
        return condition.icon.includes('day') ? '⛅' : '☁️';
    }

    // Cloudy/Overcast
    if (code === 1006 || code === 1009) {
        return '☁️';
    }

    // Mist/Fog
    if ([1030, 1135, 1147].includes(code)) {
        return '🌫️';
    }

    // Light rain/drizzle
    if ([1063, 1150, 1153, 1168, 1171, 1180, 1183, 1240].includes(code)) {
        return '🌦️';
    }

    // Moderate/Heavy rain
    if ([1186, 1189, 1192, 1195, 1243, 1246].includes(code)) {
        return '🌧️';
    }

    // Thunderstorms
    if ([1087, 1273, 1276, 1279, 1282].includes(code)) {
        return '⛈️';
    }

    // Snow
    if (
        [
            1066, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258,
            1261, 1264,
        ].includes(code)
    ) {
        return '🌨️';
    }

    // Sleet/Ice
    if ([1069, 1072, 1198, 1201, 1204, 1207, 1249, 1252].includes(code)) {
        return '🧊';
    }

    // Default fallback
    return '🌤️';
}

/**
 * Formats temperature based on units preference
 */
export function formatTemperature(
    tempC: number,
    tempF: number,
    units?: string,
): string {
    if (units === 'imperial') {
        return `${Math.round(tempF).toString()}°F`;
    }
    return `${Math.round(tempC).toString()}°C`;
}

/**
 * Formats wind speed based on units preference
 */
export function formatWindSpeed(
    windMph: number,
    windKph: number,
    units?: string,
): string {
    if (units === 'imperial') {
        return `${Math.round(windMph).toString()} mph`;
    }
    return `${Math.round(windKph).toString()} km/h`;
}

/**
 * Formats the last updated time
 */
export function formatLastUpdated(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) {
        return 'Just now';
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes.toString()}m ago`;
    } else {
        const hours = Math.floor(diffInMinutes / 60);
        return `${hours.toString()}h ago`;
    }
}

/**
 * Gets a descriptive weather status including additional details
 */
export function getWeatherDescription(
    condition: WeatherCondition,
    humidity: number,
    windMph: number,
    windKph: number,
    units?: string,
): string {
    const parts = [condition.text];

    // Add humidity if it's notably high or low
    if (humidity >= 80) {
        parts.push('Very humid');
    } else if (humidity <= 30) {
        parts.push('Dry');
    }

    // Add wind information if it's notable
    const windSpeed = units === 'imperial' ? windMph : windKph;
    const windUnit = units === 'imperial' ? 'mph' : 'km/h';

    if (windSpeed >= 25) {
        parts.push(`Windy (${Math.round(windSpeed).toString()} ${windUnit})`);
    } else if (windSpeed >= 15) {
        parts.push(`Breezy (${Math.round(windSpeed).toString()} ${windUnit})`);
    }

    return parts.join(' • ');
}
