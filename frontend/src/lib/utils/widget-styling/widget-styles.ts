import { Widget } from '@/generated/types';
import { applyBackgroundStyles } from './background-strategy';

/**
 * Generates dynamic CSS styles for a widget based on its style properties
 * Simplified main function that delegates to specialized modules
 */
export const getWidgetStyles = (widget: Widget): React.CSSProperties => {
    const styles: React.CSSProperties = {};

    const backgroundStyles = applyBackgroundStyles(
        widget.backgroundColor,
        widget.backgroundImage,
    );
    Object.assign(styles, backgroundStyles);

    if (widget.textColor) {
        styles.color = widget.textColor;
    }

    return styles;
};
