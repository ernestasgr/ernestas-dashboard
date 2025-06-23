import { Widget } from '@/generated/graphql';
import { describe, expect, it } from 'vitest';
import { getWidgetStyles } from './widget-styles';

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

describe('Widget Styles', () => {
    describe('getWidgetStyles', () => {
        describe('default behavior', () => {
            it('should return empty styles when no custom styling is applied', () => {
                const widget = createMockWidget();
                const result = getWidgetStyles(widget);

                expect(result).toEqual({});
            });

            it('should return empty styles when all styling properties are null', () => {
                const widget = createMockWidget({
                    backgroundColor: null,
                    backgroundImage: null,
                    textColor: null,
                });
                const result = getWidgetStyles(widget);

                expect(result).toEqual({});
            });
            it('should return empty styles when all styling properties are undefined', () => {
                const widget = createMockWidget();
                const testWidget = widget;

                const result = getWidgetStyles(testWidget);

                expect(result).toEqual({});
            });
        });

        describe('background color styling', () => {
            it('should apply solid background color', () => {
                const widget = createMockWidget({
                    backgroundColor: '#ff0000',
                });
                const result = getWidgetStyles(widget);

                expect(result).toEqual({
                    backgroundColor: '#ff0000',
                });
            });

            it('should apply RGBA background color', () => {
                const widget = createMockWidget({
                    backgroundColor: 'rgba(255, 0, 0, 0.5)',
                });
                const result = getWidgetStyles(widget);

                expect(result).toEqual({
                    backgroundColor: 'rgba(255, 0, 0, 0.5)',
                });
            });

            it('should apply HSL background color', () => {
                const widget = createMockWidget({
                    backgroundColor: 'hsl(120, 100%, 50%)',
                });
                const result = getWidgetStyles(widget);

                expect(result).toEqual({
                    backgroundColor: 'hsl(120, 100%, 50%)',
                });
            });

            it('should apply linear gradient background', () => {
                const gradient = 'linear-gradient(45deg, #ff0000, #00ff00)';
                const widget = createMockWidget({
                    backgroundColor: gradient,
                });
                const result = getWidgetStyles(widget);

                expect(result).toEqual({
                    background: gradient,
                });
            });

            it('should apply radial gradient background', () => {
                const gradient = 'radial-gradient(circle, #ff0000, #00ff00)';
                const widget = createMockWidget({
                    backgroundColor: gradient,
                });
                const result = getWidgetStyles(widget);

                expect(result).toEqual({
                    background: gradient,
                });
            });

            it('should apply complex gradient background', () => {
                const gradient =
                    'linear-gradient(135deg, rgba(255,0,0,0.8) 0%, rgba(0,255,0,0.6) 50%, rgba(0,0,255,0.4) 100%)';
                const widget = createMockWidget({
                    backgroundColor: gradient,
                });
                const result = getWidgetStyles(widget);

                expect(result).toEqual({
                    background: gradient,
                });
            });
        });

        describe('background image styling', () => {
            it('should apply data URL background image', () => {
                const widget = createMockWidget({
                    backgroundImage: 'data:image/svg+xml,<svg></svg>',
                });
                const result = getWidgetStyles(widget);

                expect(result).toEqual({
                    backgroundImage: 'url("data:image/svg+xml,<svg></svg>")',
                    backgroundSize: 'auto',
                    backgroundPosition: 'top left',
                    backgroundRepeat: 'repeat',
                });
            });

            it('should apply regular image background', () => {
                const widget = createMockWidget({
                    backgroundImage: 'https://example.com/image.jpg',
                });
                const result = getWidgetStyles(widget);

                expect(result).toEqual({
                    backgroundImage: 'url("https://example.com/image.jpg")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                });
            });
        });

        describe('text color styling', () => {
            it('should apply text color', () => {
                const widget = createMockWidget({
                    textColor: '#333333',
                });
                const result = getWidgetStyles(widget);

                expect(result).toEqual({
                    color: '#333333',
                });
            });

            it('should apply RGBA text color', () => {
                const widget = createMockWidget({
                    textColor: 'rgba(51, 51, 51, 0.8)',
                });
                const result = getWidgetStyles(widget);

                expect(result).toEqual({
                    color: 'rgba(51, 51, 51, 0.8)',
                });
            });
        });

        describe('combined styling', () => {
            it('should combine solid background color and text color', () => {
                const widget = createMockWidget({
                    backgroundColor: '#ff0000',
                    textColor: '#ffffff',
                });
                const result = getWidgetStyles(widget);

                expect(result).toEqual({
                    backgroundColor: '#ff0000',
                    color: '#ffffff',
                });
            });

            it('should combine gradient background and text color', () => {
                const gradient = 'linear-gradient(45deg, #ff0000, #00ff00)';
                const widget = createMockWidget({
                    backgroundColor: gradient,
                    textColor: '#ffffff',
                });
                const result = getWidgetStyles(widget);

                expect(result).toEqual({
                    background: gradient,
                    color: '#ffffff',
                });
            });

            it('should combine background image and text color', () => {
                const widget = createMockWidget({
                    backgroundImage: 'https://example.com/image.jpg',
                    textColor: '#ffffff',
                });
                const result = getWidgetStyles(widget);

                expect(result).toEqual({
                    backgroundImage: 'url("https://example.com/image.jpg")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    color: '#ffffff',
                });
            });

            it('should prioritize background image over background color', () => {
                const widget = createMockWidget({
                    backgroundColor: '#ff0000',
                    backgroundImage: 'https://example.com/image.jpg',
                    textColor: '#ffffff',
                });
                const result = getWidgetStyles(widget);

                expect(result).toEqual({
                    backgroundImage: 'url("https://example.com/image.jpg")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    color: '#ffffff',
                });
                expect(result).not.toHaveProperty('backgroundColor');
            });

            it('should combine solid color with pattern image', () => {
                const widget = createMockWidget({
                    backgroundColor: '#ff0000',
                    backgroundImage: 'data:image/svg+xml,<svg></svg>',
                    textColor: '#ffffff',
                });
                const result = getWidgetStyles(widget);

                expect(result).toEqual({
                    backgroundColor: '#ff0000',
                    backgroundImage: 'url("data:image/svg+xml,<svg></svg>")',
                    backgroundSize: 'auto',
                    backgroundPosition: 'top left',
                    backgroundRepeat: 'repeat',
                    color: '#ffffff',
                });
            });

            it('should combine gradient with pattern image', () => {
                const gradient = 'linear-gradient(45deg, #ff0000, #00ff00)';
                const widget = createMockWidget({
                    backgroundColor: gradient,
                    backgroundImage: 'data:image/svg+xml,<svg></svg>',
                    textColor: '#ffffff',
                });
                const result = getWidgetStyles(widget);

                expect(result).toEqual({
                    background:
                        'url("data:image/svg+xml,<svg></svg>"), linear-gradient(45deg, #ff0000, #00ff00)',
                    backgroundSize: 'auto, cover',
                    backgroundPosition: 'top left, center',
                    backgroundRepeat: 'repeat, no-repeat',
                    color: '#ffffff',
                });
            });
        });

        describe('edge cases', () => {
            it('should handle empty string values', () => {
                const widget = createMockWidget({
                    backgroundColor: '',
                    backgroundImage: '',
                    textColor: '',
                });
                const result = getWidgetStyles(widget);

                expect(result).toEqual({});
            });
            it('should handle whitespace-only values as valid styling', () => {
                const widget = createMockWidget({
                    backgroundColor: '   ',
                    backgroundImage: '   ',
                    textColor: '   ',
                });
                const result = getWidgetStyles(widget);

                expect(result).toEqual({
                    backgroundImage: 'url("   ")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    color: '   ',
                });
            });

            it('should handle URLs with special characters', () => {
                const specialUrl =
                    'https://example.com/images/my image (1).jpg';
                const widget = createMockWidget({
                    backgroundImage: specialUrl,
                });
                const result = getWidgetStyles(widget);

                expect(result.backgroundImage).toBe(`url("${specialUrl}")`);
            });

            it('should handle complex data URLs', () => {
                const complexDataUrl =
                    'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg"%3E%3C/svg%3E';
                const widget = createMockWidget({
                    backgroundImage: complexDataUrl,
                });
                const result = getWidgetStyles(widget);

                expect(result.backgroundImage).toBe(`url("${complexDataUrl}")`);
            });
        });

        describe('CSS property types', () => {
            it('should return a valid React.CSSProperties object', () => {
                const widget = createMockWidget({
                    backgroundColor: '#ff0000',
                    textColor: '#ffffff',
                });
                const result = getWidgetStyles(widget);

                expect(typeof result).toBe('object');
                if (result.backgroundColor) {
                    expect(typeof result.backgroundColor).toBe('string');
                }
                if (result.color) {
                    expect(typeof result.color).toBe('string');
                }
                if (result.backgroundImage) {
                    expect(typeof result.backgroundImage).toBe('string');
                }
            });
        });

        describe('consistency and idempotency', () => {
            it('should return consistent results for the same input', () => {
                const widget = createMockWidget({
                    backgroundColor: '#ff0000',
                    textColor: '#ffffff',
                });

                const result1 = getWidgetStyles(widget);
                const result2 = getWidgetStyles(widget);

                expect(result1).toEqual(result2);
            });

            it('should be deterministic across multiple calls', () => {
                const widget = createMockWidget({
                    backgroundColor: 'linear-gradient(45deg, #ff0000, #00ff00)',
                    backgroundImage: 'data:image/svg+xml,<svg></svg>',
                    textColor: '#ffffff',
                });

                const results = Array.from({ length: 5 }, () =>
                    getWidgetStyles(widget),
                );

                results.forEach((result, index) => {
                    if (index > 0) {
                        expect(result).toEqual(results[0]);
                    }
                });
            });
        });
    });
});
