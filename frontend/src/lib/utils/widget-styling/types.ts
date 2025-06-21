export interface WidgetStyleProps {
    backgroundColor?: string | null;
    textColor?: string | null;
    iconColor?: string | null;
    backgroundImage?: string | null;
}

export interface BackgroundImageStyles {
    backgroundSize: string;
    backgroundPosition: string;
    backgroundRepeat: string;
}

export interface CombinedBackgroundStyles {
    background?: string;
    backgroundColor?: string;
    backgroundImage?: string;
    backgroundSize?: string;
    backgroundPosition?: string;
    backgroundRepeat?: string;
}

export interface WidgetIconStyles {
    foregroundStyles: React.CSSProperties;
    backgroundStyles: React.CSSProperties;
}

export interface WidgetItemColors {
    lightBackground: string;
    darkBackground: string;
    border: string;
    primaryText: string;
    secondaryText: string;
    accent: string;
    accentLight: string;
    focusRing: string;
}

export interface GradientInfo {
    type: 'linear' | 'radial';
    direction?: string;
    colors: string[];
}
