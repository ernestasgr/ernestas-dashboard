import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useWidgetValidation } from './useWidgetValidation';

describe('useWidgetValidation', () => {
    describe('initialization', () => {
        it('should initialize with empty errors', () => {
            const { result } = renderHook(() =>
                useWidgetValidation({ isEditing: false }),
            );

            expect(result.current.errors).toEqual({});
            expect(result.current.hasErrors).toBe(false);
        });

        it('should initialize with correct editing mode', () => {
            const { result: createResult } = renderHook(() =>
                useWidgetValidation({ isEditing: false }),
            );
            const { result: editResult } = renderHook(() =>
                useWidgetValidation({ isEditing: true }),
            );

            expect(createResult.current.errors).toEqual({});
            expect(editResult.current.errors).toEqual({});
        });
    });

    describe('validateForm - create mode', () => {
        it('should validate successfully with valid create form data', () => {
            const { result } = renderHook(() =>
                useWidgetValidation({ isEditing: false }),
            );

            const validFormData = {
                type: 'clock',
                title: 'My Clock Widget',
                x: 0,
                y: 0,
                width: 3,
                height: 4,
                config: {
                    timezone: 'UTC',
                    format: '24h',
                },
            };

            let isValid = false;
            act(() => {
                isValid = result.current.validateForm(validFormData);
            });

            expect(isValid).toBe(true);
            expect(result.current.errors).toEqual({});
            expect(result.current.hasErrors).toBe(false);
        });

        it('should validate weather widget config in create mode', () => {
            const { result } = renderHook(() =>
                useWidgetValidation({ isEditing: false }),
            );

            const validWeatherData = {
                type: 'weather',
                title: 'Weather Widget',
                x: 2,
                y: 1,
                width: 4,
                height: 3,
                config: {
                    location: 'London, UK',
                    units: 'metric',
                },
            };

            let isValid = false;
            act(() => {
                isValid = result.current.validateForm(validWeatherData);
            });

            expect(isValid).toBe(true);
            expect(result.current.errors).toEqual({});
        });

        it('should validate form schema separately from config validation', () => {
            const { result } = renderHook(() =>
                useWidgetValidation({ isEditing: false }),
            );

            const invalidFormData = {
                type: 'clock',
                title: 'Test Widget',
                x: 0,
                y: 0,
                width: 3,
                height: 4,
                config: {}, // Empty config should cause config validation to fail
            };

            let isValid = true;
            act(() => {
                isValid = result.current.validateForm(invalidFormData);
            });

            expect(isValid).toBe(false);
            expect(result.current.hasErrors).toBe(true);
            expect(result.current.errors.config).toBeDefined();
            expect(result.current.errors.config[0]).toContain('timezone');
        });

        it('should fail validation with invalid position values', () => {
            const { result } = renderHook(() =>
                useWidgetValidation({ isEditing: false }),
            );

            const invalidPositionData = {
                type: 'clock',
                title: 'Clock Widget',
                x: -1,
                y: 0,
                width: 0,
                height: 4,
                config: {
                    timezone: 'UTC',
                    format: '24h',
                },
            };

            let isValid = true;
            act(() => {
                isValid = result.current.validateForm(invalidPositionData);
            });

            expect(isValid).toBe(false);
            expect(result.current.hasErrors).toBe(true);
            expect(result.current.errors.x).toBeDefined();
            expect(result.current.errors.width).toBeDefined();
        });

        it('should fail validation with invalid config', () => {
            const { result } = renderHook(() =>
                useWidgetValidation({ isEditing: false }),
            );

            const invalidConfigData = {
                type: 'clock',
                title: 'Clock Widget',
                x: 0,
                y: 0,
                width: 3,
                height: 4,
                config: {
                    timezone: '',
                    format: 'invalid',
                },
            };

            let isValid = true;
            act(() => {
                isValid = result.current.validateForm(invalidConfigData);
            });

            expect(isValid).toBe(false);
            expect(result.current.hasErrors).toBe(true);
            expect(result.current.errors.config).toBeDefined();
            expect(result.current.errors.config).toEqual(
                expect.arrayContaining([
                    expect.stringContaining('timezone'),
                    expect.stringContaining('format'),
                ]),
            );
        });
    });

    describe('validateForm - edit mode', () => {
        it('should validate successfully with valid edit form data', () => {
            const { result } = renderHook(() =>
                useWidgetValidation({ isEditing: true }),
            );

            const validEditData = {
                type: 'weather',
                title: 'Updated Weather Widget',
                x: 1,
                y: 2,
                width: 5,
                height: 3,
                config: {
                    location: 'New York, NY',
                    units: 'imperial',
                },
                id: 'widget-123',
            };

            let isValid = false;
            act(() => {
                isValid = result.current.validateForm(validEditData);
            });

            expect(isValid).toBe(true);
            expect(result.current.errors).toEqual({});
            expect(result.current.hasErrors).toBe(false);
        });

        it('should fail validation without required id in edit mode', () => {
            const { result } = renderHook(() =>
                useWidgetValidation({ isEditing: true }),
            );

            const invalidEditData = {
                type: 'weather',
                title: 'Weather Widget',
                x: 1,
                y: 2,
                width: 5,
                height: 3,
                config: {
                    location: 'New York, NY',
                    units: 'imperial',
                },
                // Missing id
            };

            let isValid = true;
            act(() => {
                isValid = result.current.validateForm(invalidEditData);
            });

            expect(isValid).toBe(false);
            expect(result.current.hasErrors).toBe(true);
            expect(result.current.errors.id).toBeDefined();
        });
    });

    describe('widget-specific config validation', () => {
        it('should validate notes widget config', () => {
            const { result } = renderHook(() =>
                useWidgetValidation({ isEditing: false }),
            );

            const notesData = {
                type: 'notes',
                title: 'Notes Widget',
                x: 0,
                y: 0,
                width: 4,
                height: 5,
                config: {
                    content: 'My notes content',
                    maxLength: 1000,
                },
            };

            let isValid = false;
            act(() => {
                isValid = result.current.validateForm(notesData);
            });

            expect(isValid).toBe(true);
            expect(result.current.errors).toEqual({});
        });

        it('should validate tasks widget config', () => {
            const { result } = renderHook(() =>
                useWidgetValidation({ isEditing: false }),
            );

            const tasksData = {
                type: 'tasks',
                title: 'Tasks Widget',
                x: 0,
                y: 0,
                width: 4,
                height: 6,
                config: {
                    categories: ['Work', 'Personal'],
                    defaultCategory: 'Work',
                },
            };

            let isValid = false;
            act(() => {
                isValid = result.current.validateForm(tasksData);
            });

            expect(isValid).toBe(true);
            expect(result.current.errors).toEqual({});
        });

        it('should fail validation for tasks widget without categories', () => {
            const { result } = renderHook(() =>
                useWidgetValidation({ isEditing: false }),
            );

            const invalidTasksData = {
                type: 'tasks',
                title: 'Tasks Widget',
                x: 0,
                y: 0,
                width: 4,
                height: 6,
                config: {
                    categories: [],
                },
            };

            let isValid = true;
            act(() => {
                isValid = result.current.validateForm(invalidTasksData);
            });

            expect(isValid).toBe(false);
            expect(result.current.hasErrors).toBe(true);
            expect(result.current.errors.config).toBeDefined();
            expect(result.current.errors.config[0]).toContain('categories');
        });
    });

    describe('error management', () => {
        it('should clear all errors', () => {
            const { result } = renderHook(() =>
                useWidgetValidation({ isEditing: false }),
            );

            const invalidData = {
                type: 'clock',
                title: 'Invalid Widget',
                x: -1,
                width: 0,
                height: 4,
                config: {
                    timezone: '',
                    format: '24h',
                },
            };

            act(() => {
                result.current.validateForm(invalidData);
            });

            expect(result.current.hasErrors).toBe(true);

            act(() => {
                result.current.clearErrors();
            });

            expect(result.current.errors).toEqual({});
            expect(result.current.hasErrors).toBe(false);
        });
        it('should clear specific field errors', () => {
            const { result } = renderHook(() =>
                useWidgetValidation({ isEditing: false }),
            );

            const invalidData = {
                type: 'clock',
                title: 'Invalid Widget',
                x: -1,
                y: 0,
                width: 0,
                height: 4,
                config: {
                    timezone: '',
                    format: '24h',
                },
            };

            act(() => {
                result.current.validateForm(invalidData);
            });

            expect(result.current.errors.x).toBeDefined();
            expect(result.current.errors.width).toBeDefined();
            expect(result.current.errors.config).toBeDefined();

            act(() => {
                result.current.clearFieldError('x');
            });

            expect(result.current.errors.x).toBeUndefined();
            expect(result.current.errors.width).toBeDefined();
            expect(result.current.errors.config).toBeDefined();
            expect(result.current.hasErrors).toBe(true);
        });

        it('should handle clearing non-existent field errors gracefully', () => {
            const { result } = renderHook(() =>
                useWidgetValidation({ isEditing: false }),
            );

            act(() => {
                result.current.clearFieldError('nonexistent');
            });

            expect(result.current.errors).toEqual({});
            expect(result.current.hasErrors).toBe(false);
        });
    });

    describe('edge cases', () => {
        it('should handle boundary position values', () => {
            const { result } = renderHook(() =>
                useWidgetValidation({ isEditing: false }),
            );

            const boundaryData = {
                type: 'clock',
                title: 'Boundary Widget',
                x: 11, // Max allowed
                y: 0, // Min allowed
                width: 12, // Max allowed
                height: 1, // Min allowed
                config: {
                    timezone: 'UTC',
                    format: '24h',
                },
            };

            let isValid = false;
            act(() => {
                isValid = result.current.validateForm(boundaryData);
            });

            expect(isValid).toBe(true);
            expect(result.current.errors).toEqual({});
        });

        it('should handle empty strings in required fields', () => {
            const { result } = renderHook(() =>
                useWidgetValidation({ isEditing: false }),
            );

            const emptyStringData = {
                type: 'weather',
                title: '',
                x: 0,
                y: 0,
                width: 3,
                height: 4,
                config: {
                    location: '', // Required field
                    units: 'metric',
                },
            };

            let isValid = true;
            act(() => {
                isValid = result.current.validateForm(emptyStringData);
            });

            expect(isValid).toBe(false);
            expect(result.current.hasErrors).toBe(true);
            expect(result.current.errors.config).toBeDefined();
            expect(result.current.errors.config[0]).toContain('location');
        });

        it('should handle undefined config values', () => {
            const { result } = renderHook(() =>
                useWidgetValidation({ isEditing: false }),
            );

            const undefinedConfigData = {
                type: 'clock',
                title: 'Clock Widget',
                x: 0,
                y: 0,
                width: 3,
                height: 4,
                config: {}, // Missing required fields
            };

            let isValid = true;
            act(() => {
                isValid = result.current.validateForm(undefinedConfigData);
            });

            expect(isValid).toBe(false);
            expect(result.current.hasErrors).toBe(true);
            expect(result.current.errors.config).toBeDefined();
        });
    });

    describe('callback stability', () => {
        it('should maintain stable callback references', () => {
            const { result, rerender } = renderHook(
                ({ isEditing }) => useWidgetValidation({ isEditing }),
                { initialProps: { isEditing: false } },
            );

            const initialValidateForm = result.current.validateForm;
            const initialClearErrors = result.current.clearErrors;
            const initialClearFieldError = result.current.clearFieldError;

            rerender({ isEditing: false });

            expect(result.current.validateForm).toBe(initialValidateForm);
            expect(result.current.clearErrors).toBe(initialClearErrors);
            expect(result.current.clearFieldError).toBe(initialClearFieldError);
        });

        it('should update validateForm callback when isEditing changes', () => {
            const { result, rerender } = renderHook(
                ({ isEditing }) => useWidgetValidation({ isEditing }),
                { initialProps: { isEditing: false } },
            );

            const initialValidateForm = result.current.validateForm;

            rerender({ isEditing: true });

            expect(result.current.validateForm).not.toBe(initialValidateForm);
        });
    });
});
