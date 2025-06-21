import { clampChroma, converter, formatHex, formatRgb } from 'culori';
import { GradientInfo } from './types';

const toRgb = converter('rgb');
const toOklch = converter('oklch');

/**
 * Helper function to check if a background is a gradient
 */
export const isGradientBackground = (background: string): boolean => {
    return background.includes('gradient');
};

/**
 * Helper function to extract gradient type and colors from a gradient string
 */
export const parseGradient = (gradient: string): GradientInfo | null => {
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
 * Convert any color format to RGB using culori
 */
export const colorToRgb = (color: string) => {
    return toRgb(color.trim());
};

/**
 * Convert any color format to hex using culori
 */
export const colorToHex = (color: string): string => {
    const hex = formatHex(color.trim());
    return hex ?? color;
};

/**
 * Lighten a color by adjusting its lightness in OKLCH space for better perceptual results
 */
export const lightenColor = (color: string, amount: number): string => {
    const oklch = toOklch(color);
    if (!oklch) return color;

    const lightened = {
        ...oklch,
        l: Math.min(1, oklch.l + amount),
    };

    return colorToHex(formatRgb(clampChroma(lightened))) || color;
};

/**
 * Darken a color by adjusting its lightness in OKLCH space for better perceptual results
 */
export const darkenColor = (color: string, amount: number): string => {
    const oklch = toOklch(color);
    if (!oklch) return color;

    const darkened = {
        ...oklch,
        l: Math.max(0, oklch.l - amount),
    };

    return colorToHex(formatRgb(clampChroma(darkened))) || color;
};

/**
 * Adjust color saturation in OKLCH space
 */
export const adjustSaturation = (color: string, amount: number): string => {
    const oklch = toOklch(color);
    if (!oklch) return color;

    const adjusted = {
        ...oklch,
        c: Math.max(0, oklch.c + amount),
    };

    return colorToHex(formatRgb(clampChroma(adjusted))) || color;
};

/**
 * Create an RGBA string from a color with specified alpha
 */
export const colorToRgbaString = (color: string, alpha: number): string => {
    const rgb = toRgb(color);
    if (!rgb) return `rgba(255, 255, 255, ${alpha.toString()})`;

    const r = Math.round((rgb.r || 0) * 255);
    const g = Math.round((rgb.g || 0) * 255);
    const b = Math.round((rgb.b || 0) * 255);

    return `rgba(${r.toString()}, ${g.toString()}, ${b.toString()}, ${alpha.toString()})`;
};
