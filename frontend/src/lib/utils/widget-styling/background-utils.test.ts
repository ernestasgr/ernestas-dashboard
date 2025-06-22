import { describe, expect, it } from 'vitest';
import { getBackgroundImageStyles, isDataImage } from './background-utils';

describe('Background Utils', () => {
    describe('isDataImage', () => {
        it('should return true for data URLs', () => {
            const dataUrls = [
                'data:image/svg+xml,<svg></svg>',
                'data:image/png;base64,iVBORw0KGgoA...',
                'data:image/jpeg;base64,/9j/4AAQSkZ...',
                'data:image/gif;base64,R0lGODlhAQABAI...',
                'data:image/webp;base64,UklGRiQAAABXRU...',
            ];

            dataUrls.forEach((url) => {
                expect(isDataImage(url)).toBe(true);
            });
        });

        it('should return false for regular URLs', () => {
            const regularUrls = [
                'https://example.com/image.jpg',
                'http://example.com/image.png',
                '/path/to/image.gif',
                './relative/path/image.webp',
                '../another/path/image.svg',
                'ftp://example.com/image.bmp',
                'file://localhost/path/image.tiff',
            ];

            regularUrls.forEach((url) => {
                expect(isDataImage(url)).toBe(false);
            });
        });
        it('should return false for empty or invalid URLs', () => {
            const invalidUrls = ['', ' ', 'not-a-url'];

            invalidUrls.forEach((url) => {
                expect(isDataImage(url)).toBe(false);
            });
        });

        it('should return true for data: prefix regardless of content', () => {
            expect(isDataImage('data:')).toBe(true);
            expect(isDataImage('data:invalid')).toBe(true);
        });

        it('should be case sensitive', () => {
            expect(isDataImage('DATA:image/svg+xml,<svg></svg>')).toBe(false);
            expect(isDataImage('Data:image/svg+xml,<svg></svg>')).toBe(false);
            expect(isDataImage('data:image/svg+xml,<svg></svg>')).toBe(true);
        });
    });

    describe('getBackgroundImageStyles', () => {
        describe('for data images (patterns)', () => {
            it('should return pattern styles for SVG data URLs', () => {
                const svgDataUrl = 'data:image/svg+xml,<svg></svg>';
                const styles = getBackgroundImageStyles(svgDataUrl);

                expect(styles).toEqual({
                    backgroundSize: 'auto',
                    backgroundPosition: 'top left',
                    backgroundRepeat: 'repeat',
                });
            });

            it('should return pattern styles for PNG data URLs', () => {
                const pngDataUrl = 'data:image/png;base64,iVBORw0KGgoA...';
                const styles = getBackgroundImageStyles(pngDataUrl);

                expect(styles).toEqual({
                    backgroundSize: 'auto',
                    backgroundPosition: 'top left',
                    backgroundRepeat: 'repeat',
                });
            });

            it('should return pattern styles for complex data URLs', () => {
                const complexDataUrl =
                    'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg"%3E%3C/svg%3E';
                const styles = getBackgroundImageStyles(complexDataUrl);

                expect(styles).toEqual({
                    backgroundSize: 'auto',
                    backgroundPosition: 'top left',
                    backgroundRepeat: 'repeat',
                });
            });
        });

        describe('for regular images', () => {
            it('should return cover styles for HTTPS URLs', () => {
                const httpsUrl = 'https://example.com/image.jpg';
                const styles = getBackgroundImageStyles(httpsUrl);

                expect(styles).toEqual({
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                });
            });

            it('should return cover styles for HTTP URLs', () => {
                const httpUrl = 'http://example.com/image.png';
                const styles = getBackgroundImageStyles(httpUrl);

                expect(styles).toEqual({
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                });
            });

            it('should return cover styles for relative paths', () => {
                const relativePath = './images/background.jpg';
                const styles = getBackgroundImageStyles(relativePath);

                expect(styles).toEqual({
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                });
            });

            it('should return cover styles for absolute paths', () => {
                const absolutePath = '/assets/images/hero.jpg';
                const styles = getBackgroundImageStyles(absolutePath);

                expect(styles).toEqual({
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                });
            });

            it('should handle different image extensions', () => {
                const extensions = [
                    '.jpg',
                    '.jpeg',
                    '.png',
                    '.gif',
                    '.webp',
                    '.svg',
                    '.bmp',
                ];

                extensions.forEach((ext) => {
                    const url = `https://example.com/image${ext}`;
                    const styles = getBackgroundImageStyles(url);

                    expect(styles).toEqual({
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                    });
                });
            });
        });

        describe('edge cases', () => {
            it('should handle URLs with query parameters', () => {
                const urlWithQuery =
                    'https://example.com/image.jpg?width=300&height=200';
                const styles = getBackgroundImageStyles(urlWithQuery);

                expect(styles).toEqual({
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                });
            });

            it('should handle URLs with fragments', () => {
                const urlWithFragment = 'https://example.com/image.svg#icon';
                const styles = getBackgroundImageStyles(urlWithFragment);

                expect(styles).toEqual({
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                });
            });

            it('should handle URLs with special characters', () => {
                const urlWithSpecialChars =
                    'https://example.com/images/my image (1).jpg';
                const styles = getBackgroundImageStyles(urlWithSpecialChars);

                expect(styles).toEqual({
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                });
            });

            it('should handle empty strings', () => {
                const styles = getBackgroundImageStyles('');

                expect(styles).toEqual({
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                });
            });
        });

        describe('consistency', () => {
            it('should return consistent results for the same input', () => {
                const testUrl = 'https://example.com/test.jpg';
                const styles1 = getBackgroundImageStyles(testUrl);
                const styles2 = getBackgroundImageStyles(testUrl);

                expect(styles1).toEqual(styles2);
            });

            it('should treat similar data URLs consistently', () => {
                const dataUrls = [
                    'data:image/svg+xml,<svg></svg>',
                    'data:image/png;base64,abc123',
                    'data:image/jpeg;base64,def456',
                ];

                const expectedStyles = {
                    backgroundSize: 'auto',
                    backgroundPosition: 'top left',
                    backgroundRepeat: 'repeat',
                };

                dataUrls.forEach((url) => {
                    expect(getBackgroundImageStyles(url)).toEqual(
                        expectedStyles,
                    );
                });
            });

            it('should treat similar regular URLs consistently', () => {
                const regularUrls = [
                    'https://cdn.example.com/image.jpg',
                    'http://assets.site.com/photo.png',
                    '/static/images/banner.gif',
                ];

                const expectedStyles = {
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                };

                regularUrls.forEach((url) => {
                    expect(getBackgroundImageStyles(url)).toEqual(
                        expectedStyles,
                    );
                });
            });
        });
    });
});
