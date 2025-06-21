import { Widget } from '@/generated/graphql';
import {
    adjustSaturation,
    colorToRgbaString,
    darkenColor,
    isGradientBackground,
    lightenColor,
    parseGradient,
} from './color-utils';
import { WidgetItemColors } from './types';

/**
 * Gets item colors based on widget styling for consistent theming
 */
export const getWidgetItemColors = (widget: Widget): WidgetItemColors => {
    const baseColor = widget.backgroundColor ?? widget.iconColor ?? '#3B82F6';
    const textColor = widget.textColor ?? '#1F2937';

    let primaryColor = baseColor;
    if (isGradientBackground(baseColor)) {
        const parsed = parseGradient(baseColor);
        if (parsed && parsed.colors.length > 0) {
            const firstColor = parsed.colors[0].split(' ')[0].trim();
            primaryColor = firstColor.startsWith('#') ? firstColor : '#3B82F6';
        }
    }

    const lightBackground = lightenColor(primaryColor, 0.4);
    const darkBackground = darkenColor(primaryColor, 0.1);
    const borderColor = adjustSaturation(
        lightenColor(primaryColor, 0.2),
        -0.05,
    );
    const accent =
        widget.iconColor ??
        adjustSaturation(darkenColor(primaryColor, 0.05), 0.1);
    const accentLight = lightenColor(accent, 0.15);

    const hasGradient =
        widget.backgroundColor && isGradientBackground(widget.backgroundColor);

    return {
        lightBackground: hasGradient
            ? 'rgba(255, 255, 255, 0.08)'
            : colorToRgbaString(lightBackground, 0.08),

        darkBackground: hasGradient
            ? 'rgba(255, 255, 255, 0.15)'
            : colorToRgbaString(darkBackground, 0.85),

        border: hasGradient
            ? 'rgba(255, 255, 255, 0.15)'
            : colorToRgbaString(borderColor, 0.3),

        primaryText: textColor,
        secondaryText: colorToRgbaString(textColor, 0.5),

        accent: accent,
        accentLight: accentLight,

        focusRing: colorToRgbaString(accent, 0.3),
    };
};
