import { describe, expect, it } from 'vitest';
import { validateWidgetConfig } from './widget-schemas';

describe('Widget Validation', () => {
    describe('validateWidgetConfig', () => {
        it('should validate clock widget config', () => {
            const result = validateWidgetConfig('clock', {
                timezone: 'UTC',
                format: '24h',
            });
            expect(result.success).toBe(true);
        });

        it('should reject invalid clock config', () => {
            const result = validateWidgetConfig('clock', {
                timezone: '',
                format: '24h',
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(
                    result.errors.some((error) => error.includes('timezone')),
                ).toBe(true);
            }
        });

        it('should validate weather widget config', () => {
            const result = validateWidgetConfig('weather', {
                location: 'New York',
                units: 'metric',
            });
            expect(result.success).toBe(true);
        });

        it('should reject invalid weather config', () => {
            const result = validateWidgetConfig('weather', {
                location: '',
                units: 'metric',
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(
                    result.errors.some((error) => error.includes('location')),
                ).toBe(true);
            }
        });

        it('should validate tasks widget config', () => {
            const result = validateWidgetConfig('tasks', {
                categories: ['work', 'personal'],
                defaultCategory: 'work',
            });
            expect(result.success).toBe(true);
        });

        it('should reject tasks config with empty categories', () => {
            const result = validateWidgetConfig('tasks', {
                categories: [],
                defaultCategory: 'work',
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(
                    result.errors.some((error) => error.includes('categories')),
                ).toBe(true);
            }
        });

        it('should validate notes widget config', () => {
            const result = validateWidgetConfig('notes', {
                content: 'Test content',
                maxLength: 500,
            });
            expect(result.success).toBe(true);
        });
    });
});
