import { Widget } from '@/generated/graphql';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useWidgetForm } from './useWidgetForm';

const mockWidget: Widget = {
    __typename: 'Widget',
    id: 'widget-1',
    type: 'weather',
    title: 'Weather Widget',
    x: 2,
    y: 1,
    width: 4,
    height: 3,
    backgroundColor: '#ffffff',
    textColor: '#000000',
    iconColor: '#333333',
    backgroundImage: null,
    config: {
        __typename: 'WeatherConfig',
        location: 'London, UK',
        units: 'metric',
    },
};

describe('useWidgetForm', () => {
    describe('initialization', () => {
        it('should initialize with default form data when not open', () => {
            const { result } = renderHook(() =>
                useWidgetForm({ widget: null, open: false }),
            );

            expect(result.current.formData).toEqual({
                type: 'clock',
                title: '',
                x: 0,
                y: 0,
                width: 3,
                height: 4,
                config: { timezone: 'UTC', format: '24h' },
            });
        });

        it('should initialize with default form data when open with no widget', () => {
            const { result } = renderHook(() =>
                useWidgetForm({ widget: null, open: true }),
            );

            expect(result.current.formData).toEqual({
                type: 'clock',
                title: '',
                x: 0,
                y: 0,
                width: 3,
                height: 4,
                config: { timezone: 'UTC', format: '24h' },
            });
        });
        it('should initialize with widget data when open with a widget', () => {
            const { result } = renderHook(() =>
                useWidgetForm({ widget: mockWidget, open: true }),
            );

            expect(result.current.formData).toEqual({
                type: 'weather',
                title: 'Weather Widget',
                x: 2,
                y: 1,
                width: 4,
                height: 3,
                config: {
                    __typename: 'WeatherConfig',
                    location: 'London, UK',
                    units: 'metric',
                },
            });
        });

        it('should use default config when widget config is null', () => {
            const widgetWithoutConfig: Widget = {
                ...mockWidget,
                config: null,
            };

            const { result } = renderHook(() =>
                useWidgetForm({ widget: widgetWithoutConfig, open: true }),
            );

            expect(result.current.formData.config).toEqual({
                location: 'New York, NY',
                units: 'metric',
            });
        });
    });
    describe('form updates on prop changes', () => {
        it('should update form data when widget changes', () => {
            const { result, rerender } = renderHook(
                ({ widget, open }: { widget?: Widget | null; open: boolean }) =>
                    useWidgetForm({ widget, open }),
                {
                    initialProps: { widget: null, open: true },
                },
            );
            expect(result.current.formData.type).toBe('clock');
            // @ts-expect-error - TODO: fix
            rerender({ widget: mockWidget, open: true });

            expect(result.current.formData.type).toBe('weather');
            expect(result.current.formData.title).toBe('Weather Widget');
        });
        it('should reset form when dialog closes and opens again without widget', () => {
            const { result, rerender } = renderHook(
                ({ widget, open }: { widget?: Widget | null; open: boolean }) =>
                    useWidgetForm({ widget, open }),
                {
                    initialProps: { widget: mockWidget, open: true },
                },
            );

            expect(result.current.formData.type).toBe('weather');

            // Close dialog
            rerender({ widget: mockWidget, open: false }); // Open dialog without widget
            // @ts-expect-error - TODO: fix
            rerender({ widget: null, open: true });

            expect(result.current.formData).toEqual({
                type: 'clock',
                title: '',
                x: 0,
                y: 0,
                width: 3,
                height: 4,
                config: { timezone: 'UTC', format: '24h' },
            });
        });
    });

    describe('updateField', () => {
        it('should update individual form fields', () => {
            const { result } = renderHook(() =>
                useWidgetForm({ widget: null, open: true }),
            );

            act(() => {
                result.current.updateField('title', 'New Title');
            });

            expect(result.current.formData.title).toBe('New Title');

            act(() => {
                result.current.updateField('type', 'weather');
            });

            expect(result.current.formData.type).toBe('weather');
        });

        it('should preserve other fields when updating one field', () => {
            const { result } = renderHook(() =>
                useWidgetForm({ widget: null, open: true }),
            );

            const initialData = result.current.formData;

            act(() => {
                result.current.updateField('title', 'Test Title');
            });

            expect(result.current.formData).toEqual({
                ...initialData,
                title: 'Test Title',
            });
        });
    });

    describe('updateConfigField', () => {
        it('should update config field for clock widget', () => {
            const { result } = renderHook(() =>
                useWidgetForm({ widget: null, open: true }),
            );

            act(() => {
                result.current.updateConfigField(
                    'timezone',
                    'America/New_York',
                );
            });

            expect(result.current.formData.config).toEqual({
                timezone: 'America/New_York',
                format: '24h',
            });
        });
        it('should update config field for weather widget', () => {
            const { result } = renderHook(() =>
                useWidgetForm({ widget: mockWidget, open: true }),
            );

            act(() => {
                result.current.updateConfigField('location', 'Paris, France');
            });

            expect(result.current.formData.config).toEqual({
                __typename: 'WeatherConfig',
                location: 'Paris, France',
                units: 'metric',
            });
        });

        it('should preserve other config fields when updating one', () => {
            const { result } = renderHook(() =>
                useWidgetForm({ widget: mockWidget, open: true }),
            );

            act(() => {
                result.current.updateConfigField('units', 'imperial');
            });

            expect(result.current.formData.config).toEqual({
                __typename: 'WeatherConfig',
                location: 'London, UK',
                units: 'imperial',
            });
        });
    });

    describe('updatePositionField', () => {
        it('should update position and size fields', () => {
            const { result } = renderHook(() =>
                useWidgetForm({ widget: null, open: true }),
            );

            act(() => {
                result.current.updatePositionField('x', 5);
            });

            expect(result.current.formData.x).toBe(5);

            act(() => {
                result.current.updatePositionField('y', 3);
            });

            expect(result.current.formData.y).toBe(3);

            act(() => {
                result.current.updatePositionField('width', 6);
            });

            expect(result.current.formData.width).toBe(6);

            act(() => {
                result.current.updatePositionField('height', 2);
            });

            expect(result.current.formData.height).toBe(2);
        });
    });

    describe('handleTypeChange', () => {
        it('should change type and reset config for clock widget', () => {
            const { result } = renderHook(() =>
                useWidgetForm({ widget: mockWidget, open: true }),
            );

            expect(result.current.formData.type).toBe('weather');

            act(() => {
                result.current.handleTypeChange('clock');
            });

            expect(result.current.formData.type).toBe('clock');
            expect(result.current.formData.config).toEqual({
                timezone: 'UTC',
                format: '24h',
            });
        });

        it('should change type and reset config for weather widget', () => {
            const { result } = renderHook(() =>
                useWidgetForm({ widget: null, open: true }),
            );

            expect(result.current.formData.type).toBe('clock');

            act(() => {
                result.current.handleTypeChange('weather');
            });

            expect(result.current.formData.type).toBe('weather');
            expect(result.current.formData.config).toEqual({
                location: 'New York, NY',
                units: 'metric',
            });
        });

        it('should change type and reset config for notes widget', () => {
            const { result } = renderHook(() =>
                useWidgetForm({ widget: null, open: true }),
            );

            act(() => {
                result.current.handleTypeChange('notes');
            });

            expect(result.current.formData.type).toBe('notes');
            expect(result.current.formData.config).toEqual({
                content: '',
                maxLength: 500,
            });
        });

        it('should change type and reset config for tasks widget', () => {
            const { result } = renderHook(() =>
                useWidgetForm({ widget: null, open: true }),
            );

            act(() => {
                result.current.handleTypeChange('tasks');
            });

            expect(result.current.formData.type).toBe('tasks');
            expect(result.current.formData.config).toEqual({
                categories: ['personal', 'work', 'urgent'],
                defaultCategory: 'personal',
            });
        });

        it('should preserve non-config fields when changing type', () => {
            const { result } = renderHook(() =>
                useWidgetForm({ widget: mockWidget, open: true }),
            );

            act(() => {
                result.current.handleTypeChange('clock');
            });

            expect(result.current.formData.title).toBe('Weather Widget');
            expect(result.current.formData.x).toBe(2);
            expect(result.current.formData.y).toBe(1);
            expect(result.current.formData.width).toBe(4);
            expect(result.current.formData.height).toBe(3);
        });
    });

    describe('resetForm', () => {
        it('should reset form to default values', () => {
            const { result } = renderHook(() =>
                useWidgetForm({ widget: mockWidget, open: true }),
            );

            act(() => {
                result.current.updateField('title', 'Modified Title');
                result.current.updatePositionField('x', 10);
            });

            act(() => {
                result.current.resetForm();
            });

            expect(result.current.formData).toEqual({
                type: 'clock',
                title: '',
                x: 0,
                y: 0,
                width: 3,
                height: 4,
                config: { timezone: 'UTC', format: '24h' },
            });
        });
    });

    describe('edge cases', () => {
        it('should handle widget with null title', () => {
            const widgetWithNullTitle: Widget = {
                ...mockWidget,
                title: null,
            };

            const { result } = renderHook(() =>
                useWidgetForm({ widget: widgetWithNullTitle, open: true }),
            );

            expect(result.current.formData.title).toBe('');
        });
        it('should handle unknown widget type gracefully', () => {
            const widgetWithUnknownType: Widget = {
                ...mockWidget,
                type: 'unknown',
                config: null,
            };

            const { result } = renderHook(() =>
                useWidgetForm({ widget: widgetWithUnknownType, open: true }),
            );

            expect(result.current.formData.type).toBe('unknown');
            expect(result.current.formData.config).toEqual(undefined);
        });
        it('should not update form when dialog is closed', () => {
            const { result, rerender } = renderHook(
                ({ widget, open }: { widget?: Widget | null; open: boolean }) =>
                    useWidgetForm({ widget, open }),
                {
                    initialProps: { widget: null, open: false },
                },
            );

            const initialData = result.current.formData; // Update props with a widget but keep dialog closed
            // @ts-expect-error - TODO: fix
            rerender({ widget: mockWidget, open: false });
            expect(result.current.formData).toEqual(initialData);
        });
    });
});
