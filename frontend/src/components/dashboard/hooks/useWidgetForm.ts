import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Widget } from '@/generated/types';
import {
    WidgetFormData,
    createConfigSchema,
    widgetFormSchema,
} from '@/lib/schemas/form-schemas';

interface UseWidgetFormProps {
    widget?: Widget | null;
    open: boolean;
    isEditing: boolean;
}

const DEFAULT_CONFIGS = {
    clock: { timezone: 'UTC', format: '24h' },
    weather: { location: 'New York, NY', units: 'metric' },
    notes: { maxLength: 500, showGrid: true, gridColumns: 3 },
    tasks: {
        categories: ['personal', 'work', 'urgent'],
        defaultCategory: 'personal',
    },
} as const;

export function useWidgetForm({ widget, open, isEditing }: UseWidgetFormProps) {
    const form = useForm<WidgetFormData>({
        resolver: zodResolver(widgetFormSchema),
        defaultValues: {
            type: 'clock',
            title: '',
            x: 0,
            y: 0,
            width: 3,
            height: 4,
            config: DEFAULT_CONFIGS.clock,
        },
        mode: 'onChange',
    });

    const { reset, setValue, watch, clearErrors, setError } = form;
    const watchedType = watch('type');

    useEffect(() => {
        if (open) {
            if (widget && isEditing) {
                reset({
                    id: widget.id,
                    type: widget.type as
                        | 'clock'
                        | 'weather'
                        | 'notes'
                        | 'tasks',
                    title: widget.title ?? '',
                    x: widget.x,
                    y: widget.y,
                    width: widget.width,
                    height: widget.height,
                    config: widget.config
                        ? (widget.config as unknown as Record<string, unknown>)
                        : {},
                });
            } else {
                reset({
                    type: 'clock',
                    title: '',
                    x: 0,
                    y: 0,
                    width: 3,
                    height: 4,
                    config: DEFAULT_CONFIGS.clock,
                });
            }
        }
    }, [open, widget, isEditing, reset]);

    // Handle type change - reset config when widget type changes
    useEffect(() => {
        if (open && !isEditing) {
            const configMap = DEFAULT_CONFIGS as Record<
                string,
                Record<string, unknown>
            >;
            const newConfig = configMap[watchedType];
            setValue('config', newConfig);
            clearErrors('config');
        }
    }, [watchedType, setValue, clearErrors, open, isEditing]);

    // Validate config separately since it's dynamic based on type
    const validateConfig = (type: string, config: Record<string, unknown>) => {
        try {
            const configSchema = createConfigSchema(type);
            const result = configSchema.safeParse(config);

            if (!result.success) {
                const errors = result.error.errors
                    .map((err) => `${err.path.join('.')}: ${err.message}`)
                    .join(', ');

                setError('config', {
                    type: 'validation',
                    message: errors,
                });
                return false;
            }

            clearErrors('config');
            return true;
        } catch (error) {
            console.error('Config validation error:', error);
            setError('config', {
                type: 'validation',
                message: 'Invalid configuration',
            });
            return false;
        }
    };

    return {
        form,
        validateConfig,
        watchedType,
    };
}
