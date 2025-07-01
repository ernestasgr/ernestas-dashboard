import { Widget } from '@/generated/types';
import { WidgetIconStyles } from './types';

/**
 * Gets icon styles for a widget icon
 */
export const getWidgetIconStyles = (widget: Widget): WidgetIconStyles => {
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
