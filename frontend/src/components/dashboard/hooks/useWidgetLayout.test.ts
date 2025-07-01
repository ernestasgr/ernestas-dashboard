import { act, renderHook } from '@testing-library/react';
import GridLayout from 'react-grid-layout';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useWidgetLayout } from './useWidgetLayout';

const mockUseMeQuery = vi.fn();
const mockUseGetWidgetsQuery = vi.fn();
const mockUseUpdateWidgetLayoutMutation = vi.fn();
const mockUpdateWidgetLayout = vi.fn();

/* eslint-disable @typescript-eslint/no-unsafe-return */
vi.mock('@/generated/Auth.generated', () => ({
    useMeQuery: () => mockUseMeQuery(),
    useGetWidgetsQuery: (options: unknown) => mockUseGetWidgetsQuery(options),
    useUpdateWidgetLayoutMutation: () => mockUseUpdateWidgetLayoutMutation(),
}));
vi.mock('@/generated/Widgets.generated', () => ({
    useGetWidgetsQuery: (options: unknown) => mockUseGetWidgetsQuery(options),
    useUpdateWidgetLayoutMutation: () => mockUseUpdateWidgetLayoutMutation(),
}));
/* eslint-enable @typescript-eslint/no-unsafe-return */

const mockMeData = {
    me: {
        __typename: 'User' as const,
        email: 'test@example.com',
        id: 'user-1',
    },
};

const mockWidgetsData = {
    widgets: [
        {
            __typename: 'Widget' as const,
            id: 'widget-1',
            type: 'clock',
            title: 'Clock Widget',
            x: 0,
            y: 0,
            width: 2,
            height: 2,
            backgroundColor: '#ffffff',
            textColor: '#000000',
            iconColor: '#333333',
            backgroundImage: null,
            config: { timezone: 'UTC', format: '24h' },
        },
    ],
};

describe('useWidgetLayout', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockUseMeQuery.mockReturnValue({
            data: mockMeData,
        });

        mockUseGetWidgetsQuery.mockReturnValue({
            data: mockWidgetsData,
            loading: false,
            error: null,
            refetch: vi.fn(),
        });

        mockUseUpdateWidgetLayoutMutation.mockReturnValue([
            mockUpdateWidgetLayout,
        ]);
        mockUpdateWidgetLayout.mockResolvedValue({
            data: { updateWidgetLayout: mockWidgetsData.widgets[0] },
        });

        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1024,
        });

        vi.spyOn(window, 'addEventListener');
        vi.spyOn(window, 'removeEventListener');
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('initialization', () => {
        it('should initialize with correct default values', () => {
            const { result } = renderHook(() => useWidgetLayout());

            expect(result.current.windowWidth).toBe(992);
            expect(result.current.loading).toBe(false);
            expect(result.current.error).toBe(null);
            expect(result.current.widgetsData).toEqual(mockWidgetsData);
        });

        it('should handle missing user data gracefully', () => {
            mockUseMeQuery.mockReturnValue({ data: null });

            renderHook(() => useWidgetLayout());

            expect(mockUseGetWidgetsQuery).toHaveBeenCalledWith({
                variables: { userId: '' },
                skip: true,
            });
        });
    });

    describe('window resize handling', () => {
        it('should set up window resize listener', () => {
            renderHook(() => useWidgetLayout());
            expect(window.addEventListener).toHaveBeenCalledWith(
                'resize',
                expect.any(Function),
            );
        });

        it('should clean up window resize listener on unmount', () => {
            const { unmount } = renderHook(() => useWidgetLayout());

            unmount();

            expect(window.removeEventListener).toHaveBeenCalledWith(
                'resize',
                expect.any(Function),
            );
        });

        it('should update window width on resize', () => {
            const { result } = renderHook(() => useWidgetLayout());

            act(() => {
                Object.defineProperty(window, 'innerWidth', {
                    writable: true,
                    configurable: true,
                    value: 1400,
                });
                window.dispatchEvent(new Event('resize'));
            });

            expect(result.current.windowWidth).toBe(1368); // 1400 - 32
        });
    });

    describe('layout changes', () => {
        it('should handle layout changes without errors', () => {
            const { result } = renderHook(() => useWidgetLayout());

            const newLayout: GridLayout.Layout[] = [
                { i: 'widget-1', x: 1, y: 1, w: 2, h: 2 },
            ];

            expect(() => {
                result.current.handleLayoutChange(newLayout);
            }).not.toThrow();
        });

        it('should debounce layout updates', () => {
            vi.useFakeTimers();
            const { result } = renderHook(() => useWidgetLayout());

            const newLayout: GridLayout.Layout[] = [
                { i: 'widget-1', x: 1, y: 1, w: 2, h: 2 },
            ];

            act(() => {
                result.current.handleLayoutChange(newLayout);
                result.current.handleLayoutChange(newLayout);
                result.current.handleLayoutChange(newLayout);
            });

            expect(mockUpdateWidgetLayout).not.toHaveBeenCalled();

            act(() => {
                vi.advanceTimersByTime(350);
            });

            vi.useRealTimers();
        });
    });

    describe('GraphQL state handling', () => {
        it('should pass loading state correctly', () => {
            mockUseGetWidgetsQuery.mockReturnValue({
                data: null,
                loading: true,
                error: null,
                refetch: vi.fn(),
            });

            const { result } = renderHook(() => useWidgetLayout());

            expect(result.current.loading).toBe(true);
        });

        it('should pass error state correctly', () => {
            const mockError = new Error('GraphQL error');
            mockUseGetWidgetsQuery.mockReturnValue({
                data: null,
                loading: false,
                error: mockError,
                refetch: vi.fn(),
            });

            const { result } = renderHook(() => useWidgetLayout());

            expect(result.current.error).toBe(mockError);
        });

        it('should expose refetch function', () => {
            const mockRefetch = vi.fn();
            mockUseGetWidgetsQuery.mockReturnValue({
                data: mockWidgetsData,
                loading: false,
                error: null,
                refetch: mockRefetch,
            });

            const { result } = renderHook(() => useWidgetLayout());

            expect(result.current.refetch).toBe(mockRefetch);
        });
    });

    describe('hook interface', () => {
        it('should return all expected properties', () => {
            const { result } = renderHook(() => useWidgetLayout());

            expect(result.current).toHaveProperty('windowWidth');
            expect(result.current).toHaveProperty('widgetsData');
            expect(result.current).toHaveProperty('loading');
            expect(result.current).toHaveProperty('error');
            expect(result.current).toHaveProperty('refetch');
            expect(result.current).toHaveProperty('handleLayoutChange');
        });

        it('should return handleLayoutChange as a function', () => {
            const { result } = renderHook(() => useWidgetLayout());

            expect(typeof result.current.handleLayoutChange).toBe('function');
        });
    });

    describe('edge cases', () => {
        it('should handle empty widgets array', () => {
            mockUseGetWidgetsQuery.mockReturnValue({
                data: { widgets: [] },
                loading: false,
                error: null,
                refetch: vi.fn(),
            });

            const { result } = renderHook(() => useWidgetLayout());

            expect(result.current.widgetsData).toEqual({ widgets: [] });
        });

        it('should handle null widgets data', () => {
            mockUseGetWidgetsQuery.mockReturnValue({
                data: null,
                loading: false,
                error: null,
                refetch: vi.fn(),
            });

            const { result } = renderHook(() => useWidgetLayout());

            expect(result.current.widgetsData).toBe(null);
        });

        it('should cleanup timeout on unmount', () => {
            vi.useFakeTimers();
            const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

            const { result, unmount } = renderHook(() => useWidgetLayout());

            act(() => {
                result.current.handleLayoutChange([
                    { i: 'widget-1', x: 1, y: 1, w: 2, h: 2 },
                ]);
            });

            unmount();

            expect(clearTimeoutSpy).toHaveBeenCalled();

            clearTimeoutSpy.mockRestore();
            vi.useRealTimers();
        });
    });
});
