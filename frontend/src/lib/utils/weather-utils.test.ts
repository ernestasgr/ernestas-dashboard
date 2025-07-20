import { WeatherCondition } from '@/lib/types/weather';
import {
    formatLastUpdated,
    formatTemperature,
    getWeatherDescription,
    getWeatherEmoji,
} from '@/lib/utils/weather-utils';
import { describe, expect, it } from 'vitest';

describe('weatherUtils', () => {
    describe('formatTemperature', () => {
        it('should format metric temperature', () => {
            expect(formatTemperature(22.5, 72.5, 'metric')).toBe('23°C');
        });

        it('should format imperial temperature', () => {
            expect(formatTemperature(22.5, 72.5, 'imperial')).toBe('73°F');
        });

        it('should default to metric when units not specified', () => {
            expect(formatTemperature(22.5, 72.5)).toBe('23°C');
        });
    });

    describe('getWeatherEmoji', () => {
        it('should return sun emoji for clear day', () => {
            const condition: WeatherCondition = {
                text: 'Sunny',
                icon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
                code: 1000,
            };
            expect(getWeatherEmoji(condition)).toBe('☀️');
        });

        it('should return moon emoji for clear night', () => {
            const condition: WeatherCondition = {
                text: 'Clear',
                icon: '//cdn.weatherapi.com/weather/64x64/night/113.png',
                code: 1000,
            };
            expect(getWeatherEmoji(condition)).toBe('🌙');
        });

        it('should return cloud emoji for partly cloudy', () => {
            const condition: WeatherCondition = {
                text: 'Partly cloudy',
                icon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
                code: 1003,
            };
            expect(getWeatherEmoji(condition)).toBe('⛅');
        });
    });

    describe('formatLastUpdated', () => {
        it('should show "Just now" for very recent times', () => {
            const now = new Date();
            expect(formatLastUpdated(now)).toBe('Just now');
        });

        it('should show minutes for recent times', () => {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            expect(formatLastUpdated(fiveMinutesAgo)).toBe('5m ago');
        });

        it('should show hours for older times', () => {
            const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
            expect(formatLastUpdated(twoHoursAgo)).toBe('2h ago');
        });
    });

    describe('getWeatherDescription', () => {
        const condition: WeatherCondition = {
            text: 'Sunny',
            icon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
            code: 1000,
        };

        it('should include basic condition text', () => {
            const description = getWeatherDescription(condition, 50, 10, 16);
            expect(description).toContain('Sunny');
        });

        it('should add humidity info for very humid conditions', () => {
            const description = getWeatherDescription(condition, 85, 10, 16);
            expect(description).toContain('Very humid');
        });

        it('should add humidity info for dry conditions', () => {
            const description = getWeatherDescription(condition, 25, 10, 16);
            expect(description).toContain('Dry');
        });

        it('should add wind info for windy conditions', () => {
            const description = getWeatherDescription(condition, 50, 30, 48);
            expect(description).toContain('Windy');
        });

        it('should add wind info for breezy conditions', () => {
            const description = getWeatherDescription(condition, 50, 20, 32);
            expect(description).toContain('Breezy');
        });
    });
});
