import { BackgroundImageStyles } from './types';

/**
 * Helper function to determine if background image is a data image (pattern)
 */
export const isDataImage = (url: string): boolean => {
    return url.startsWith('data:');
};

/**
 * Helper function to get background image styles based on image type
 */
export const getBackgroundImageStyles = (
    imageUrl: string,
): BackgroundImageStyles => {
    if (isDataImage(imageUrl)) {
        // Data images (patterns) should repeat
        return {
            backgroundSize: 'auto',
            backgroundPosition: 'top left',
            backgroundRepeat: 'repeat',
        };
    } else {
        // Regular images should cover
        return {
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
        };
    }
};
