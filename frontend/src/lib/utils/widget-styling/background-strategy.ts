import { getBackgroundImageStyles, isDataImage } from './background-utils';
import { isGradientBackground } from './color-utils';
import { CombinedBackgroundStyles } from './types';

/**
 * Strategy pattern for handling different background combinations
 */
interface BackgroundStrategy {
    apply(
        backgroundColor: string,
        backgroundImage: string,
    ): CombinedBackgroundStyles;
}

class SolidColorWithPatternStrategy implements BackgroundStrategy {
    apply(
        backgroundColor: string,
        backgroundImage: string,
    ): CombinedBackgroundStyles {
        const imageStyles = getBackgroundImageStyles(backgroundImage);
        return {
            backgroundColor,
            backgroundImage: `url("${backgroundImage}")`,
            ...imageStyles,
        };
    }
}

class GradientWithPatternStrategy implements BackgroundStrategy {
    apply(
        backgroundColor: string,
        backgroundImage: string,
    ): CombinedBackgroundStyles {
        const imageStyles = getBackgroundImageStyles(backgroundImage);
        return {
            background: `url("${backgroundImage}"), ${backgroundColor}`,
            backgroundSize: `${imageStyles.backgroundSize}, cover`,
            backgroundPosition: `${imageStyles.backgroundPosition}, center`,
            backgroundRepeat: `${imageStyles.backgroundRepeat}, no-repeat`,
        };
    }
}

class RegularImageStrategy implements BackgroundStrategy {
    apply(
        _backgroundColor: string,
        backgroundImage: string,
    ): CombinedBackgroundStyles {
        const imageStyles = getBackgroundImageStyles(backgroundImage);
        return {
            backgroundImage: `url("${backgroundImage}")`,
            ...imageStyles,
        };
    }
}

class BackgroundOnlyStrategy implements BackgroundStrategy {
    apply(backgroundColor: string): CombinedBackgroundStyles {
        if (isGradientBackground(backgroundColor)) {
            return { background: backgroundColor };
        }
        return { backgroundColor };
    }
}

class ImageOnlyStrategy implements BackgroundStrategy {
    apply(
        _backgroundColor: string,
        backgroundImage: string,
    ): CombinedBackgroundStyles {
        const imageStyles = getBackgroundImageStyles(backgroundImage);
        return {
            backgroundImage: `url("${backgroundImage}")`,
            ...imageStyles,
        };
    }
}

/**
 * Factory to get the appropriate background strategy
 */
export const getBackgroundStrategy = (
    backgroundColor?: string,
    backgroundImage?: string,
): BackgroundStrategy | null => {
    if (backgroundColor && backgroundImage) {
        if (isDataImage(backgroundImage)) {
            return isGradientBackground(backgroundColor)
                ? new GradientWithPatternStrategy()
                : new SolidColorWithPatternStrategy();
        }
        return new RegularImageStrategy();
    }

    if (backgroundColor) {
        return new BackgroundOnlyStrategy();
    }

    if (backgroundImage) {
        return new ImageOnlyStrategy();
    }

    return null;
};

/**
 * Simplified background style application
 */
export const applyBackgroundStyles = (
    backgroundColor?: string | null,
    backgroundImage?: string | null,
): CombinedBackgroundStyles => {
    const strategy = getBackgroundStrategy(
        backgroundColor ?? undefined,
        backgroundImage ?? undefined,
    );

    if (!strategy) {
        return {};
    }

    return strategy.apply(backgroundColor ?? '', backgroundImage ?? '');
};
