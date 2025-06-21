import { Widget } from '@/generated/graphql';
import { applyBackgroundStyles } from './background-strategy';

/**
 * Generates dynamic CSS styles for a widget based on its style properties
 * Simplified main function that delegates to specialized modules
 */
export const getWidgetStyles = (widget: Widget): React.CSSProperties => {
    const styles: React.CSSProperties = {};

    // Apply background styles using the strategy pattern
    const backgroundStyles = applyBackgroundStyles(
        widget.backgroundColor,
        widget.backgroundImage,
    );
    Object.assign(styles, backgroundStyles);

    // Apply text color if specified
    if (widget.textColor) {
        styles.color = widget.textColor;
    }

    return styles;
};
