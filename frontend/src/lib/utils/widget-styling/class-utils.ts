import { Widget } from '@/generated/graphql';

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
