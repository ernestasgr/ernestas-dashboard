// Re-export all the functions and types for backward compatibility
export * from './background-strategy';
export * from './background-utils';
export * from './class-utils';
export * from './color-utils';
export * from './icon-styles';
export * from './item-colors';
export * from './presets';
export * from './types';
export * from './widget-styles';

// Main exports that external code should use
export { getWidgetClasses } from './class-utils';
export { isGradientBackground, parseGradient } from './color-utils';
export { getWidgetIconStyles } from './icon-styles';
export { getWidgetItemColors } from './item-colors';
export {
    WIDGET_BACKGROUND_PRESETS,
    WIDGET_COLOR_PRESETS,
    WIDGET_GRADIENT_PRESETS,
} from './presets';
export { getWidgetStyles } from './widget-styles';
