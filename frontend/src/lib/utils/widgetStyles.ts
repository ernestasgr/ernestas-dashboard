import { Widget } from '@/generated/graphql';

export interface WidgetStyleProps {
    backgroundColor?: string | null;
    textColor?: string | null;
    iconColor?: string | null;
    backgroundImage?: string | null;
}

/**
 * Helper function to determine if background image is a data image (pattern)
 */
const isDataImage = (url: string): boolean => {
    return url.startsWith('data:');
};

/**
 * Helper function to get background image styles based on image type
 */
const getBackgroundImageStyles = (imageUrl: string) => {
    if (isDataImage(imageUrl)) {
        // Data images (patterns) should repeat
        return {
            backgroundSize: 'auto',
            backgroundPosition: 'top left',
            backgroundRepeat: 'repeat',
        };
    } else {
        // Regular images should cover
        return {
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
        };
    }
};

/**
 * Generates dynamic CSS styles for a widget based on its style properties
 */
export const getWidgetStyles = (widget: Widget): React.CSSProperties => {
    const styles: React.CSSProperties = {};

    if (widget.backgroundColor && widget.backgroundImage) {
        // Both exist - check if we should layer them
        const imageStyles = getBackgroundImageStyles(widget.backgroundImage);

        if (isDataImage(widget.backgroundImage)) {
            // Pattern + Color/Gradient: layer them
            if (isGradientBackground(widget.backgroundColor)) {
                // Pattern + Gradient: pattern on top, gradient behind
                styles.background = `url("${widget.backgroundImage}"), ${widget.backgroundColor}`;
                styles.backgroundSize = `${imageStyles.backgroundSize}, cover`;
                styles.backgroundPosition = `${imageStyles.backgroundPosition}, center`;
                styles.backgroundRepeat = `${imageStyles.backgroundRepeat}, no-repeat`;
            } else {
                // Pattern + Solid color: pattern on top, color behind
                styles.backgroundColor = widget.backgroundColor;
                styles.backgroundImage = `url("${widget.backgroundImage}")`;
                Object.assign(styles, imageStyles);
            }
        } else {
            // Regular image: replaces background entirely
            styles.backgroundImage = `url("${widget.backgroundImage}")`;
            Object.assign(styles, imageStyles);
        }
    } else if (widget.backgroundColor) {
        // Only background color/gradient
        if (isGradientBackground(widget.backgroundColor)) {
            styles.background = widget.backgroundColor;
        } else {
            styles.backgroundColor = widget.backgroundColor;
        }
    } else if (widget.backgroundImage) {
        // Only background image
        const imageStyles = getBackgroundImageStyles(widget.backgroundImage);
        styles.backgroundImage = `url("${widget.backgroundImage}")`;
        Object.assign(styles, imageStyles);
    }

    if (widget.textColor) {
        styles.color = widget.textColor;
    }

    return styles;
};

/**
 * Gets icon styles for a widget icon
 */
export const getWidgetIconStyles = (widget: Widget) => {
    const foregroundStyles: React.CSSProperties = {};
    const backgroundStyles: React.CSSProperties = {};

    if (widget.iconColor) {
        foregroundStyles.color = widget.iconColor;
        backgroundStyles.backgroundColor = widget.iconColor;
    }

    return {
        foregroundStyles,
        backgroundStyles,
    };
};

/**
 * Gets CSS classes for a widget, considering custom styling
 */
export const getWidgetClasses = (
    widget: Widget,
    baseClasses: string,
): string => {
    // If custom styling is applied, remove default background gradients
    if (widget.backgroundColor || widget.backgroundImage) {
        return baseClasses
            .replace(/bg-gradient-\S+|\bfrom-\S+|\bvia-\S+|\bto-\S+/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    return baseClasses;
};

/**
 * Predefined color options for quick selection
 */
export const WIDGET_COLOR_PRESETS = [
    {
        name: 'Blue',
        backgroundColor: '#3B82F6',
        textColor: '#FFFFFF',
        iconColor: '#60A5FA',
    },
    {
        name: 'Green',
        backgroundColor: '#10B981',
        textColor: '#FFFFFF',
        iconColor: '#34D399',
    },
    {
        name: 'Purple',
        backgroundColor: '#8B5CF6',
        textColor: '#FFFFFF',
        iconColor: '#A78BFA',
    },
    {
        name: 'Pink',
        backgroundColor: '#EC4899',
        textColor: '#FFFFFF',
        iconColor: '#F472B6',
    },
    {
        name: 'Orange',
        backgroundColor: '#F59E0B',
        textColor: '#FFFFFF',
        iconColor: '#FBBF24',
    },
    {
        name: 'Red',
        backgroundColor: '#EF4444',
        textColor: '#FFFFFF',
        iconColor: '#F87171',
    },
    {
        name: 'Indigo',
        backgroundColor: '#6366F1',
        textColor: '#FFFFFF',
        iconColor: '#818CF8',
    },
    {
        name: 'Teal',
        backgroundColor: '#14B8A6',
        textColor: '#FFFFFF',
        iconColor: '#2DD4BF',
    },
    {
        name: 'Gray',
        backgroundColor: '#6B7280',
        textColor: '#FFFFFF',
        iconColor: '#D1D5DB',
    },
    {
        name: 'Dark',
        backgroundColor: '#1F2937',
        textColor: '#FFFFFF',
        iconColor: '#9CA3AF',
    },
    {
        name: 'Light',
        backgroundColor: '#F9FAFB',
        textColor: '#1F2937',
        iconColor: '#6B7280',
    },
    {
        name: 'White',
        backgroundColor: '#FFFFFF',
        textColor: '#1F2937',
        iconColor: '#4B5563',
    },
];

/**
 * Common background image patterns
 */
export const WIDGET_BACKGROUND_PRESETS = [
    {
        name: 'Gradient Mesh',
        url: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'%3E%3Cdefs%3E%3CradialGradient id='g1' cx='30%' cy='30%' r='100%'%3E%3Cstop offset='0%' stop-color='%23ff9a9e'/%3E%3Cstop offset='100%' stop-color='%23fad0c4'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect fill='url(%23g1)' width='100%' height='100%'/%3E%3C/svg%3E`,
    },
    {
        name: 'Dots',
        url: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Cpath fill='%239C92AC' fill-opacity='1' d='M1 3h1v1H1V3zm2-2h1v1H3V1z'%3E%3C/path%3E%3C/svg%3E`,
    },
    {
        name: 'Lines',
        url: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cline x1='0' y1='0' x2='40' y2='40' stroke='%23bbb' stroke-width='1'/%3E%3C/svg%3E`,
    },
];

/**
 * Predefined gradient options for widget backgrounds
 */
export const WIDGET_GRADIENT_PRESETS = [
    {
        name: 'Blue Ocean',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
        name: 'Sunset',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
        name: 'Green Paradise',
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    {
        name: 'Purple Dream',
        gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    },
    {
        name: 'Orange Burst',
        gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    },
    {
        name: 'Night Sky',
        gradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
    },
    {
        name: 'Forest',
        gradient: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
    },
    {
        name: 'Rose Gold',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
        name: 'Deep Space',
        gradient: 'linear-gradient(135deg, #000428 0%, #004e92 100%)',
    },
    {
        name: 'Warm Flame',
        gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
    },
    {
        name: 'Cool Blues',
        gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    },
    {
        name: 'Peachy',
        gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    },
];

/**
 * Helper function to check if a background is a gradient
 */
export const isGradientBackground = (background: string): boolean => {
    return background.includes('gradient');
};

/**
 * Helper function to extract gradient type and colors from a gradient string
 */
export const parseGradient = (gradient: string) => {
    const linearRegex = /linear-gradient\(([^)]+)\)/;
    const linearMatch = linearRegex.exec(gradient);
    if (linearMatch) {
        const parts = linearMatch[1].split(',').map((s) => s.trim());
        const direction = parts[0];
        const colors = parts.slice(1);
        return {
            type: 'linear',
            direction,
            colors,
        };
    }

    const radialRegex = /radial-gradient\(([^)]+)\)/;
    const radialMatch = radialRegex.exec(gradient);
    if (radialMatch) {
        const parts = radialMatch[1].split(',').map((s) => s.trim());
        return {
            type: 'radial',
            colors: parts,
        };
    }

    return null;
};

/**
 * Helper function to convert hex color to RGB values
 */
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : null;
};

/**
 * Helper function to convert RGB to hex
 */
const rgbToHex = (r: number, g: number, b: number): string => {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

/**
 * Helper function to lighten/darken a color
 */
const adjustColor = (hex: string, percent: number): string => {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;

    const adjust = (value: number) => {
        const adjusted = Math.round(value + (255 - value) * (percent / 100));
        return Math.max(0, Math.min(255, adjusted));
    };

    return rgbToHex(adjust(rgb.r), adjust(rgb.g), adjust(rgb.b));
};

/**
 * Gets item colors based on widget styling for consistent theming
 */
export const getWidgetItemColors = (widget: Widget) => {
    const baseColor = widget.backgroundColor ?? widget.iconColor ?? '#6B7280';
    const textColor = widget.textColor ?? '#1F2937';

    let primaryColor = baseColor;
    if (isGradientBackground(baseColor)) {
        const parsed = parseGradient(baseColor);
        if (parsed && parsed.colors.length > 0) {
            const firstColor = parsed.colors[0].split(' ')[0].trim();
            primaryColor = firstColor.startsWith('#') ? firstColor : baseColor;
        }
    }

    const lightBackground = adjustColor(primaryColor, 20);
    const mediumBackground = adjustColor(primaryColor, 10);
    const darkBackground = adjustColor(primaryColor, -10);
    const border = adjustColor(primaryColor, 5);
    const accent = widget.iconColor ?? adjustColor(primaryColor, -15);

    const getRgbValues = (color: string) => {
        const rgb = hexToRgb(color);
        return {
            r: rgb?.r ?? 0,
            g: rgb?.g ?? 0,
            b: rgb?.b ?? 0,
        };
    };
    const lightRgb = getRgbValues(lightBackground);
    const mediumRgb = getRgbValues(mediumBackground);
    const darkRgb = getRgbValues(darkBackground);
    const borderRgb = getRgbValues(border);
    const textRgb = getRgbValues(textColor);
    const accentRgb = getRgbValues(accent);

    const hasGradient =
        widget.backgroundColor && isGradientBackground(widget.backgroundColor);

    return {
        lightBackground: hasGradient
            ? 'rgba(255, 255, 255, 0.1)'
            : `rgba(${lightRgb.r.toString()}, ${lightRgb.g.toString()}, ${lightRgb.b.toString()}, 0.1)`,
        mediumBackground: hasGradient
            ? 'rgba(255, 255, 255, 0.15)'
            : `rgba(${mediumRgb.r.toString()}, ${mediumRgb.g.toString()}, ${mediumRgb.b.toString()}, 0.5)`,
        darkBackground: hasGradient
            ? 'rgba(255, 255, 255, 0.2)'
            : `rgba(${darkRgb.r.toString()}, ${darkRgb.g.toString()}, ${darkRgb.b.toString()}, 0.7)`,

        border: hasGradient
            ? 'rgba(255, 255, 255, 0.2)'
            : `rgba(${borderRgb.r.toString()}, ${borderRgb.g.toString()}, ${borderRgb.b.toString()}, 0.4)`,

        primaryText: textColor,
        secondaryText: `rgba(${textRgb.r.toString()}, ${textRgb.g.toString()}, ${textRgb.b.toString()}, 0.7)`,

        accent: accent,
        accentLight: adjustColor(accent, 15),

        focusRing: `rgba(${accentRgb.r.toString()}, ${accentRgb.g.toString()}, ${accentRgb.b.toString()}, 0.2)`,
    };
};
