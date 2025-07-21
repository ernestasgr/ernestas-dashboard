'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { WidgetFormData } from '@/lib/schemas/form-schemas';
import { Controller, UseFormReturn } from 'react-hook-form';

const WIDGET_TYPES = [
    { value: 'clock', label: 'Clock' },
    { value: 'weather', label: 'Weather' },
    { value: 'notes', label: 'Notes' },
    { value: 'tasks', label: 'Tasks' },
];

interface WidgetBasicFieldsProps {
    form: UseFormReturn<WidgetFormData>;
    isEditing: boolean;
}

export function WidgetBasicFields({ form, isEditing }: WidgetBasicFieldsProps) {
    const {
        control,
        formState: { errors },
    } = form;

    return (
        <>
            <div className='space-y-2'>
                <Label htmlFor='title'>Title</Label>
                <Controller
                    name='title'
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            id='title'
                            placeholder='Widget title'
                            value={field.value ?? ''}
                        />
                    )}
                />
                {errors.title && (
                    <p className='text-destructive text-sm'>
                        {errors.title.message}
                    </p>
                )}
            </div>

            {!isEditing && (
                <div className='space-y-2'>
                    <Label htmlFor='type'>Type</Label>
                    <Controller
                        name='type'
                        control={control}
                        render={({ field }) => (
                            <Select
                                value={field.value}
                                onValueChange={field.onChange}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {WIDGET_TYPES.map((widgetType) => (
                                        <SelectItem
                                            key={widgetType.value}
                                            value={widgetType.value}
                                        >
                                            {widgetType.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
            )}
        </>
    );
}
