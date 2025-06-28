import { Widget } from '@/generated/graphql';
import { describe, expect, it } from 'vitest';
import { getWidgetClasses } from './class-utils';

const createMockWidget = (overrides?: Partial<Widget>): Widget => ({
    __typename: 'Widget',
    id: 'test-widget-1',
    type: 'clock',
    title: 'Test Widget',
    x: 0,
    y: 0,
    width: 3,
    height: 4,
    config: null,
    backgroundColor: null,
    textColor: null,
    iconColor: null,
    backgroundImage: null,
    ...overrides,
});

describe('Class Utils', () => {
    describe('getWidgetClasses', () => {
        const baseClasses =
            'group relative h-full bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 shadow-lg';

        describe('default behavior', () => {
            it('should return base classes unchanged when no custom styling is applied', () => {
                const widget = createMockWidget();
                const result = getWidgetClasses(widget, baseClasses);

                expect(result).toBe(baseClasses);
            });

            it('should return base classes when backgroundColor and backgroundImage are null', () => {
                const widget = createMockWidget({
                    backgroundColor: null,
                    backgroundImage: null,
                });
                const result = getWidgetClasses(widget, baseClasses);

                expect(result).toBe(baseClasses);
            });
            it('should return base classes when backgroundColor and backgroundImage are undefined', () => {
                const widget = createMockWidget();

                // Destructure to remove backgroundColor and backgroundImage from widget

                const {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    backgroundColor,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    backgroundImage,
                    ...widgetWithoutBackground
                } = widget;
                const testWidget = widgetWithoutBackground as Widget;

                const result = getWidgetClasses(testWidget, baseClasses);

                expect(result).toBe(baseClasses);
            });
        });

        describe('background color customization', () => {
            it('should remove gradient classes when backgroundColor is set to solid color', () => {
                const widget = createMockWidget({
                    backgroundColor: '#ff0000',
                });
                const result = getWidgetClasses(widget, baseClasses);

                expect(result).toBe('group relative h-full shadow-lg');
                expect(result).not.toContain('bg-gradient-to-br');
                expect(result).not.toContain('from-blue-50');
                expect(result).not.toContain('via-blue-100');
                expect(result).not.toContain('to-blue-200');
            });

            it('should remove gradient classes when backgroundColor is set to gradient', () => {
                const widget = createMockWidget({
                    backgroundColor: 'linear-gradient(45deg, #ff0000, #00ff00)',
                });
                const result = getWidgetClasses(widget, baseClasses);

                expect(result).toBe('group relative h-full shadow-lg');
                expect(result).not.toContain('bg-gradient-to-br');
                expect(result).not.toContain('from-blue-50');
                expect(result).not.toContain('via-blue-100');
                expect(result).not.toContain('to-blue-200');
            });

            it('should handle rgba color values', () => {
                const widget = createMockWidget({
                    backgroundColor: 'rgba(255, 0, 0, 0.5)',
                });
                const result = getWidgetClasses(widget, baseClasses);

                expect(result).toBe('group relative h-full shadow-lg');
            });

            it('should handle hsl color values', () => {
                const widget = createMockWidget({
                    backgroundColor: 'hsl(120, 100%, 50%)',
                });
                const result = getWidgetClasses(widget, baseClasses);

                expect(result).toBe('group relative h-full shadow-lg');
            });
        });

        describe('background image customization', () => {
            it('should remove gradient classes when backgroundImage is set to data URL', () => {
                const widget = createMockWidget({
                    backgroundImage: 'data:image/svg+xml,<svg></svg>',
                });
                const result = getWidgetClasses(widget, baseClasses);

                expect(result).toBe('group relative h-full shadow-lg');
                expect(result).not.toContain('bg-gradient-to-br');
                expect(result).not.toContain('from-blue-50');
                expect(result).not.toContain('via-blue-100');
                expect(result).not.toContain('to-blue-200');
            });

            it('should remove gradient classes when backgroundImage is set to regular URL', () => {
                const widget = createMockWidget({
                    backgroundImage: 'https://example.com/image.jpg',
                });
                const result = getWidgetClasses(widget, baseClasses);

                expect(result).toBe('group relative h-full shadow-lg');
            });
        });

        describe('combined customization', () => {
            it('should remove gradient classes when both backgroundColor and backgroundImage are set', () => {
                const widget = createMockWidget({
                    backgroundColor: '#ff0000',
                    backgroundImage: 'https://example.com/image.jpg',
                });
                const result = getWidgetClasses(widget, baseClasses);

                expect(result).toBe('group relative h-full shadow-lg');
            });

            it('should remove gradient classes when backgroundColor is gradient and backgroundImage is data URL', () => {
                const widget = createMockWidget({
                    backgroundColor:
                        'radial-gradient(circle, #ff0000, #00ff00)',
                    backgroundImage: 'data:image/svg+xml,<svg></svg>',
                });
                const result = getWidgetClasses(widget, baseClasses);

                expect(result).toBe('group relative h-full shadow-lg');
            });
        });

        describe('complex gradient patterns', () => {
            const complexGradientClasses =
                'bg-gradient-to-br from-purple-50 via-pink-100 to-red-200 hover:from-purple-100 hover:via-pink-200 hover:to-red-300';
            it('should remove all gradient-related classes including hover states', () => {
                const widget = createMockWidget({
                    backgroundColor: '#ff0000',
                });
                const result = getWidgetClasses(widget, complexGradientClasses);

                expect(result).toBe('hover: hover: hover:');
                expect(result).not.toContain('bg-gradient-to-br');
                expect(result).not.toContain('from-purple-50');
                expect(result).not.toContain('via-pink-100');
                expect(result).not.toContain('to-red-200');
                expect(result).not.toContain('hover:from-purple-100');
                expect(result).not.toContain('hover:via-pink-200');
                expect(result).not.toContain('hover:to-red-300');
            });

            it('should preserve non-gradient classes while removing gradient classes', () => {
                const mixedClasses =
                    'flex items-center bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-md hover:shadow-lg';
                const widget = createMockWidget({
                    backgroundColor: '#ff0000',
                });
                const result = getWidgetClasses(widget, mixedClasses);

                expect(result).toBe(
                    'flex items-center rounded-lg shadow-md hover:shadow-lg',
                );
                expect(result).not.toContain('bg-gradient-to-r');
                expect(result).not.toContain('from-blue-500');
                expect(result).not.toContain('to-purple-600');
            });
        });

        describe('edge cases', () => {
            it('should handle empty base classes', () => {
                const widget = createMockWidget({
                    backgroundColor: '#ff0000',
                });
                const result = getWidgetClasses(widget, '');

                expect(result).toBe('');
            });

            it('should handle base classes with only gradient classes', () => {
                const gradientOnlyClasses =
                    'bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200';
                const widget = createMockWidget({
                    backgroundColor: '#ff0000',
                });
                const result = getWidgetClasses(widget, gradientOnlyClasses);

                expect(result).toBe('');
            });

            it('should handle multiple spaces between classes', () => {
                const spacedClasses =
                    'group   relative    h-full   bg-gradient-to-br   from-blue-50   shadow-lg';
                const widget = createMockWidget({
                    backgroundColor: '#ff0000',
                });
                const result = getWidgetClasses(widget, spacedClasses);

                expect(result).toBe('group relative h-full shadow-lg');
                expect(result).not.toMatch(/\s{2,}/);
            });

            it('should handle classes with numbers and special characters', () => {
                const specialClasses =
                    'bg-gradient-to-br from-blue-50 to-purple-600 md:from-blue-100 lg:to-purple-700';
                const widget = createMockWidget({
                    backgroundColor: '#ff0000',
                });
                const result = getWidgetClasses(widget, specialClasses);

                expect(result).toBe('md: lg:');
            });
        });

        describe('empty string handling', () => {
            it('should handle empty string backgroundColor', () => {
                const widget = createMockWidget({
                    backgroundColor: '',
                });
                const result = getWidgetClasses(widget, baseClasses);

                expect(result).toBe(baseClasses);
            });

            it('should handle empty string backgroundImage', () => {
                const widget = createMockWidget({
                    backgroundImage: '',
                });
                const result = getWidgetClasses(widget, baseClasses);

                expect(result).toBe(baseClasses);
            });

            it('should handle both empty strings', () => {
                const widget = createMockWidget({
                    backgroundColor: '',
                    backgroundImage: '',
                });
                const result = getWidgetClasses(widget, baseClasses);

                expect(result).toBe(baseClasses);
            });
        });

        describe('whitespace handling', () => {
            it('should trim leading and trailing whitespace', () => {
                const widget = createMockWidget({
                    backgroundColor: '#ff0000',
                });
                const classesWithWhitespace =
                    '  group relative h-full bg-gradient-to-br from-blue-50  ';
                const result = getWidgetClasses(widget, classesWithWhitespace);

                expect(result).toBe('group relative h-full');
                expect(result).not.toMatch(/^\s/);
                expect(result).not.toMatch(/\s$/);
            });

            it('should normalize internal whitespace', () => {
                const widget = createMockWidget({
                    backgroundColor: '#ff0000',
                });
                const classesWithExtraSpaces =
                    'group  relative   h-full    bg-gradient-to-br    from-blue-50   shadow-lg';
                const result = getWidgetClasses(widget, classesWithExtraSpaces);

                expect(result).toBe('group relative h-full shadow-lg');
                expect(result).not.toMatch(/\s{2,}/);
            });
        });
    });
});
