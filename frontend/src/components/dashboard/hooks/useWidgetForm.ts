import { Widget } from '@/generated/graphql';
import { useEffect, useState } from 'react';

const DEFAULT_CONFIGS = {
    clock: { timezone: 'UTC', format: '24h' },
    weather: { location: 'New York, NY', units: 'metric' },
    notes: { content: '', maxLength: 500 },
    tasks: {
        categories: ['personal', 'work', 'urgent'],
        defaultCategory: 'personal',
    },
};

interface UseWidgetFormProps {
    widget?: Widget | null;
    open: boolean;
}

export function useWidgetForm({ widget, open }: UseWidgetFormProps) {
    const [formData, setFormData] = useState<{
        type: string;
        title: string;
        x: number;
        y: number;
        width: number;
        height: number;
        config: Record<string, unknown>;
    }>({
        type: 'clock',
        title: '',
        x: 0,
        y: 0,
        width: 3,
        height: 4,
        config: DEFAULT_CONFIGS.clock as Record<string, unknown>,
    });

    useEffect(() => {
        if (open) {
            if (widget) {
                setFormData({
                    type: widget.type,
                    title: widget.title ?? '',
                    x: widget.x,
                    y: widget.y,
                    width: widget.width,
                    height: widget.height,
                    config: (widget.config ??
                        DEFAULT_CONFIGS[
                            widget.type as keyof typeof DEFAULT_CONFIGS
                        ]) as Record<string, unknown>,
                });
            } else {
                resetForm();
            }
        }
    }, [open, widget]);

    const resetForm = () => {
        setFormData({
            type: 'clock',
            title: '',
            x: 0,
            y: 0,
            width: 3,
            height: 4,
            config: DEFAULT_CONFIGS.clock,
        });
    };

    const updateField = (field: keyof typeof formData, value: unknown) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const updateConfigField = (field: string, value: unknown) => {
        setFormData((prev) => ({
            ...prev,
            config: {
                ...prev.config,
                [field]: value,
            },
        }));
    };

    const updatePositionField = (
        field: 'x' | 'y' | 'width' | 'height',
        value: number,
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleTypeChange = (newType: string) => {
        setFormData((prev) => ({
            ...prev,
            type: newType,
            config: DEFAULT_CONFIGS[
                newType as keyof typeof DEFAULT_CONFIGS
            ] as Record<string, unknown>,
        }));
    };

    return {
        formData,
        updateField,
        updateConfigField,
        updatePositionField,
        handleTypeChange,
        resetForm,
    };
}
