import { Widget } from '@/generated/types';
import {
    getWidgetClasses,
    getWidgetIconStyles,
    getWidgetItemColors,
    getWidgetStyles,
} from '@/lib/utils/widget-styles';
import { useMemo } from 'react';

/**
 * Interface for all widget styling data
 */
export interface WidgetStyling {
    containerClasses: string;
    containerStyles: React.CSSProperties;
    iconStyles: {
        foreground: React.CSSProperties;
        background: React.CSSProperties;
    };
    itemColors: {
        lightBackground: string;
        darkBackground: string;
        border: string;
        primaryText: string;
        secondaryText: string;
        accent: string;
        accentLight: string;
        focusRing: string;
    };
    textColor: string | null;
    iconColor: string | null;
}

/**
 * Custom hook for widget styling
 * Consolidates all widget styling logic into a single, memoized hook
 *
 * @param widget - The widget object containing styling configuration
 * @param baseClasses - Base CSS classes for the widget type
 * @returns Complete styling configuration for the widget
 */
export const useWidgetStyling = (
    widget: Widget,
    baseClasses: string,
): WidgetStyling => {
    return useMemo(() => {
        const containerStyles = getWidgetStyles(widget);
        const containerClasses = getWidgetClasses(widget, baseClasses);
        const { foregroundStyles, backgroundStyles } =
            getWidgetIconStyles(widget);
        const itemColors = getWidgetItemColors(widget);

        return {
            containerClasses,
            containerStyles,
            iconStyles: {
                foreground: foregroundStyles,
                background: backgroundStyles,
            },
            itemColors,
            textColor: widget.textColor ?? null,
            iconColor: widget.iconColor ?? null,
        };
    }, [widget, baseClasses]);
};

/**
 * Helper function to apply text color to an element style
 */
export const applyTextColor = (
    textColor: string | null,
    additionalStyles?: React.CSSProperties,
): React.CSSProperties => {
    const baseStyles = additionalStyles ?? {};
    return textColor ? { ...baseStyles, color: textColor } : baseStyles;
};

/**
 * Helper function to merge icon styles with custom colors
 */
export const mergeIconStyles = (
    iconStyles: React.CSSProperties,
    textColor: string | null,
    additionalStyles?: React.CSSProperties,
): React.CSSProperties => {
    return {
        ...iconStyles,
        ...(textColor ? { color: textColor } : {}),
        ...additionalStyles,
    };
};
