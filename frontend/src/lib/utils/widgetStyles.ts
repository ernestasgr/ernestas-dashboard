import { Widget } from '@/generated/graphql';

export interface WidgetStyleProps {
    backgroundColor?: string | null;
    textColor?: string | null;
    backgroundImage?: string | null;
}

/**
 * Generates dynamic CSS styles for a widget based on its style properties
 */
export const getWidgetStyles = (widget: Widget): React.CSSProperties => {
    const styles: React.CSSProperties = {};

    if (widget.backgroundColor) {
        styles.backgroundColor = widget.backgroundColor;
    }

    if (widget.textColor) {
        styles.color = widget.textColor;
    }

    if (widget.backgroundImage) {
        styles.backgroundImage = `url("${widget.backgroundImage}")`;
        styles.backgroundRepeat = 'repeat';
    }

    return styles;
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
    { name: 'Blue', backgroundColor: '#3B82F6', textColor: '#FFFFFF' },
    { name: 'Green', backgroundColor: '#10B981', textColor: '#FFFFFF' },
    { name: 'Purple', backgroundColor: '#8B5CF6', textColor: '#FFFFFF' },
    { name: 'Pink', backgroundColor: '#EC4899', textColor: '#FFFFFF' },
    { name: 'Orange', backgroundColor: '#F59E0B', textColor: '#FFFFFF' },
    { name: 'Red', backgroundColor: '#EF4444', textColor: '#FFFFFF' },
    { name: 'Indigo', backgroundColor: '#6366F1', textColor: '#FFFFFF' },
    { name: 'Teal', backgroundColor: '#14B8A6', textColor: '#FFFFFF' },
    { name: 'Gray', backgroundColor: '#6B7280', textColor: '#FFFFFF' },
    { name: 'Dark', backgroundColor: '#1F2937', textColor: '#FFFFFF' },
    { name: 'Light', backgroundColor: '#F9FAFB', textColor: '#1F2937' },
    { name: 'White', backgroundColor: '#FFFFFF', textColor: '#1F2937' },
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
