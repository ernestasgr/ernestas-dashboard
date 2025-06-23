import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    applyBackgroundStyles,
    getBackgroundStrategy,
} from './background-strategy';

vi.mock('./background-utils', () => ({
    isDataImage: vi.fn((url: string) => url.startsWith('data:')),
    getBackgroundImageStyles: vi.fn((imageUrl: string) => {
        if (imageUrl.startsWith('data:')) {
            return {
                backgroundSize: 'auto',
                backgroundPosition: 'top left',
                backgroundRepeat: 'repeat',
            };
        }
        return {
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
        };
    }),
}));

vi.mock('./color-utils', () => ({
    isGradientBackground: vi.fn((background: string) =>
        background.includes('gradient'),
    ),
}));

describe('Background Strategy', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getBackgroundStrategy', () => {
        it('should return null when no background properties are provided', () => {
            const strategy = getBackgroundStrategy();
            expect(strategy).toBeNull();
        });

        it('should return null when both backgroundColor and backgroundImage are undefined', () => {
            const strategy = getBackgroundStrategy(undefined, undefined);
            expect(strategy).toBeNull();
        });

        it('should return BackgroundOnlyStrategy when only backgroundColor is provided', () => {
            const strategy = getBackgroundStrategy('#ff0000');
            expect(strategy).toBeTruthy();
            expect(strategy?.constructor.name).toBe('BackgroundOnlyStrategy');
        });

        it('should return ImageOnlyStrategy when only backgroundImage is provided', () => {
            const strategy = getBackgroundStrategy(
                undefined,
                'https://example.com/image.jpg',
            );
            expect(strategy).toBeTruthy();
            expect(strategy?.constructor.name).toBe('ImageOnlyStrategy');
        });

        it('should return SolidColorWithPatternStrategy when backgroundColor and data image are provided', () => {
            const strategy = getBackgroundStrategy(
                '#ff0000',
                'data:image/svg+xml,<svg>...</svg>',
            );
            expect(strategy).toBeTruthy();
            expect(strategy?.constructor.name).toBe(
                'SolidColorWithPatternStrategy',
            );
        });

        it('should return GradientWithPatternStrategy when gradient backgroundColor and data image are provided', () => {
            const strategy = getBackgroundStrategy(
                'linear-gradient(45deg, #ff0000, #00ff00)',
                'data:image/svg+xml,<svg>...</svg>',
            );
            expect(strategy).toBeTruthy();
            expect(strategy?.constructor.name).toBe(
                'GradientWithPatternStrategy',
            );
        });

        it('should return RegularImageStrategy when backgroundColor and regular image are provided', () => {
            const strategy = getBackgroundStrategy(
                '#ff0000',
                'https://example.com/image.jpg',
            );
            expect(strategy).toBeTruthy();
            expect(strategy?.constructor.name).toBe('RegularImageStrategy');
        });
    });

    describe('SolidColorWithPatternStrategy', () => {
        it('should combine solid color with pattern image', () => {
            const strategy = getBackgroundStrategy(
                '#ff0000',
                'data:image/svg+xml,<svg>...</svg>',
            );
            expect(strategy).toBeTruthy();
            const result = strategy?.apply(
                '#ff0000',
                'data:image/svg+xml,<svg>...</svg>',
            );

            expect(result).toEqual({
                backgroundColor: '#ff0000',
                backgroundImage: 'url("data:image/svg+xml,<svg>...</svg>")',
                backgroundSize: 'auto',
                backgroundPosition: 'top left',
                backgroundRepeat: 'repeat',
            });
        });
    });

    describe('GradientWithPatternStrategy', () => {
        it('should combine gradient with pattern image using background shorthand', () => {
            const strategy = getBackgroundStrategy(
                'linear-gradient(45deg, #ff0000, #00ff00)',
                'data:image/svg+xml,<svg>...</svg>',
            );
            expect(strategy).toBeTruthy();
            const result = strategy?.apply(
                'linear-gradient(45deg, #ff0000, #00ff00)',
                'data:image/svg+xml,<svg>...</svg>',
            );

            expect(result).toEqual({
                background:
                    'url("data:image/svg+xml,<svg>...</svg>"), linear-gradient(45deg, #ff0000, #00ff00)',
                backgroundSize: 'auto, cover',
                backgroundPosition: 'top left, center',
                backgroundRepeat: 'repeat, no-repeat',
            });
        });
    });

    describe('RegularImageStrategy', () => {
        it('should apply regular image styles only', () => {
            const strategy = getBackgroundStrategy(
                '#ff0000',
                'https://example.com/image.jpg',
            );
            expect(strategy).toBeTruthy();
            const result = strategy?.apply(
                '#ff0000',
                'https://example.com/image.jpg',
            );

            expect(result).toEqual({
                backgroundImage: 'url("https://example.com/image.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            });
        });
    });

    describe('BackgroundOnlyStrategy', () => {
        it('should apply solid color background', () => {
            const strategy = getBackgroundStrategy('#ff0000');
            expect(strategy).toBeTruthy();
            const result = strategy?.apply('#ff0000', '');

            expect(result).toEqual({
                backgroundColor: '#ff0000',
            });
        });
        it('should apply gradient background using background property', () => {
            const strategy = getBackgroundStrategy(
                'linear-gradient(45deg, #ff0000, #00ff00)',
            );
            expect(strategy).toBeTruthy();
            const result = strategy?.apply(
                'linear-gradient(45deg, #ff0000, #00ff00)',
                '',
            );

            expect(result).toEqual({
                background: 'linear-gradient(45deg, #ff0000, #00ff00)',
            });
        });
    });
    describe('ImageOnlyStrategy', () => {
        it('should apply image styles for data image', () => {
            const strategy = getBackgroundStrategy(
                undefined,
                'data:image/svg+xml,<svg>...</svg>',
            );
            expect(strategy).toBeTruthy();
            const result = strategy?.apply(
                '',
                'data:image/svg+xml,<svg>...</svg>',
            );

            expect(result).toEqual({
                backgroundImage: 'url("data:image/svg+xml,<svg>...</svg>")',
                backgroundSize: 'auto',
                backgroundPosition: 'top left',
                backgroundRepeat: 'repeat',
            });
        });

        it('should apply image styles for regular image', () => {
            const strategy = getBackgroundStrategy(
                undefined,
                'https://example.com/image.jpg',
            );
            expect(strategy).toBeTruthy();
            const result = strategy?.apply('', 'https://example.com/image.jpg');

            expect(result).toEqual({
                backgroundImage: 'url("https://example.com/image.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            });
        });
    });

    describe('applyBackgroundStyles', () => {
        it('should return empty object when no parameters are provided', () => {
            const result = applyBackgroundStyles();
            expect(result).toEqual({});
        });

        it('should return empty object when both parameters are null', () => {
            const result = applyBackgroundStyles(null, null);
            expect(result).toEqual({});
        });

        it('should apply solid color background when only backgroundColor is provided', () => {
            const result = applyBackgroundStyles('#ff0000');
            expect(result).toEqual({
                backgroundColor: '#ff0000',
            });
        });

        it('should apply gradient background when gradient backgroundColor is provided', () => {
            const result = applyBackgroundStyles(
                'linear-gradient(45deg, #ff0000, #00ff00)',
            );
            expect(result).toEqual({
                background: 'linear-gradient(45deg, #ff0000, #00ff00)',
            });
        });

        it('should apply image styles when only backgroundImage is provided', () => {
            const result = applyBackgroundStyles(
                null,
                'https://example.com/image.jpg',
            );
            expect(result).toEqual({
                backgroundImage: 'url("https://example.com/image.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            });
        });

        it('should combine solid color with pattern when both are provided', () => {
            const result = applyBackgroundStyles(
                '#ff0000',
                'data:image/svg+xml,<svg>...</svg>',
            );
            expect(result).toEqual({
                backgroundColor: '#ff0000',
                backgroundImage: 'url("data:image/svg+xml,<svg>...</svg>")',
                backgroundSize: 'auto',
                backgroundPosition: 'top left',
                backgroundRepeat: 'repeat',
            });
        });

        it('should combine gradient with pattern when both are provided', () => {
            const result = applyBackgroundStyles(
                'linear-gradient(45deg, #ff0000, #00ff00)',
                'data:image/svg+xml,<svg>...</svg>',
            );
            expect(result).toEqual({
                background:
                    'url("data:image/svg+xml,<svg>...</svg>"), linear-gradient(45deg, #ff0000, #00ff00)',
                backgroundSize: 'auto, cover',
                backgroundPosition: 'top left, center',
                backgroundRepeat: 'repeat, no-repeat',
            });
        });

        it('should prioritize image over color for regular images', () => {
            const result = applyBackgroundStyles(
                '#ff0000',
                'https://example.com/image.jpg',
            );
            expect(result).toEqual({
                backgroundImage: 'url("https://example.com/image.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            });
        });

        it('should handle empty strings as falsy values', () => {
            const result = applyBackgroundStyles('', '');
            expect(result).toEqual({});
        });

        it('should handle undefined values correctly', () => {
            const result = applyBackgroundStyles(undefined, undefined);
            expect(result).toEqual({});
        });
    });

    describe('Edge Cases', () => {
        it('should handle special characters in image URLs', () => {
            const imageUrl = 'https://example.com/image with spaces.jpg';
            const result = applyBackgroundStyles(null, imageUrl);
            expect(result.backgroundImage).toBe(`url("${imageUrl}")`);
        });

        it('should handle complex gradient definitions', () => {
            const complexGradient =
                'radial-gradient(circle at 50% 50%, rgba(255,0,0,0.8) 0%, rgba(0,255,0,0.6) 50%, rgba(0,0,255,0.4) 100%)';
            const result = applyBackgroundStyles(complexGradient);
            expect(result.background).toBe(complexGradient);
        });

        it('should handle data URLs with commas and special characters', () => {
            const dataUrl =
                'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg"%3E%3C/svg%3E';
            const result = applyBackgroundStyles(null, dataUrl);
            expect(result.backgroundImage).toBe(`url("${dataUrl}")`);
        });

        it('should handle hex colors with different formats', () => {
            const testCases = ['#ff0000', '#FF0000', '#f00'];
            testCases.forEach((color) => {
                const result = applyBackgroundStyles(color);
                expect(result.backgroundColor).toBe(color);
            });
        });

        it('should handle rgba colors', () => {
            const rgbaColor = 'rgba(255, 0, 0, 0.5)';
            const result = applyBackgroundStyles(rgbaColor);
            expect(result.backgroundColor).toBe(rgbaColor);
        });

        it('should handle hsl colors', () => {
            const hslColor = 'hsl(0, 100%, 50%)';
            const result = applyBackgroundStyles(hslColor);
            expect(result.backgroundColor).toBe(hslColor);
        });
    });

    describe('Strategy Pattern Behavior', () => {
        it('should always return the same strategy type for the same input combination', () => {
            const inputs = [
                ['#ff0000', 'data:image/svg+xml,<svg>...</svg>'],
                [
                    'linear-gradient(45deg, #ff0000, #00ff00)',
                    'data:image/svg+xml,<svg>...</svg>',
                ],
                ['#ff0000', 'https://example.com/image.jpg'],
                ['#ff0000', undefined],
                [undefined, 'https://example.com/image.jpg'],
            ];

            inputs.forEach(([bg, img]) => {
                const strategy1 = getBackgroundStrategy(bg, img);
                const strategy2 = getBackgroundStrategy(bg, img);
                expect(strategy1?.constructor.name).toBe(
                    strategy2?.constructor.name,
                );
            });
        });

        it('should produce consistent results for the same strategy', () => {
            const backgroundColor = '#ff0000';
            const backgroundImage = 'data:image/svg+xml,<svg>...</svg>';

            const result1 = applyBackgroundStyles(
                backgroundColor,
                backgroundImage,
            );
            const result2 = applyBackgroundStyles(
                backgroundColor,
                backgroundImage,
            );

            expect(result1).toEqual(result2);
        });
    });
});
