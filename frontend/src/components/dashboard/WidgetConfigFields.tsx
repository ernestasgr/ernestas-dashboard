'use client';

import { ErrorDisplay } from '@/components/ui/error-display';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    validateWidgetConfig,
    WidgetType,
} from '@/lib/validation/widget-schemas';
import { useEffect, useState } from 'react';

interface WidgetConfigFieldsProps {
    type: string;
    config: Record<string, unknown>;
    onConfigUpdate: (field: string, value: unknown) => void;
    onValidationChange?: (hasErrors: boolean) => void;
}

export function WidgetConfigFields({
    type,
    config,
    onConfigUpdate,
    onValidationChange,
}: WidgetConfigFieldsProps) {
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    useEffect(() => {
        const validation = validateWidgetConfig(type as WidgetType, config);
        if (validation.success) {
            setValidationErrors([]);
            onValidationChange?.(false);
        } else {
            setValidationErrors(validation.errors);
            onValidationChange?.(true);
        }
    }, [config, type, onValidationChange]);
    const renderClockConfig = () => {
        const clockConfig = config as {
            timezone?: string;
            format?: string;
        };

        const timezoneError =
            !clockConfig.timezone || clockConfig.timezone.trim() === '';

        return (
            <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                    <Label htmlFor='timezone'>Timezone</Label>
                    <Input
                        id='timezone'
                        value={clockConfig.timezone ?? 'UTC'}
                        onChange={(e) => {
                            onConfigUpdate('timezone', e.target.value);
                        }}
                        placeholder='UTC'
                        className={timezoneError ? 'border-red-500' : ''}
                    />
                    {timezoneError && (
                        <p className='text-sm text-red-600'>
                            Timezone is required
                        </p>
                    )}
                </div>
                <div className='space-y-2'>
                    <Label htmlFor='format'>Format</Label>
                    <Select
                        value={clockConfig.format ?? '24h'}
                        onValueChange={(value) => {
                            onConfigUpdate('format', value);
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='12h'>12 Hour</SelectItem>
                            <SelectItem value='24h'>24 Hour</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        );
    };
    const renderWeatherConfig = () => {
        const weatherConfig = config as {
            location?: string;
            units?: string;
        };

        const locationError =
            !weatherConfig.location || weatherConfig.location.trim() === '';

        return (
            <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                    <Label htmlFor='location'>Location</Label>
                    <Input
                        id='location'
                        value={weatherConfig.location ?? ''}
                        onChange={(e) => {
                            onConfigUpdate('location', e.target.value);
                        }}
                        placeholder='New York, NY'
                        className={locationError ? 'border-red-500' : ''}
                    />
                    {locationError && (
                        <p className='text-sm text-red-600'>
                            Location is required
                        </p>
                    )}
                </div>
                <div className='space-y-2'>
                    <Label htmlFor='units'>Units</Label>
                    <Select
                        value={weatherConfig.units ?? 'metric'}
                        onValueChange={(value) => {
                            onConfigUpdate('units', value);
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='metric'>Celsius</SelectItem>
                            <SelectItem value='imperial'>Fahrenheit</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        );
    };

    const renderNotesConfig = () => {
        const notesConfig = config as {
            content?: string;
            maxLength?: number;
        };

        return (
            <>
                <div className='space-y-2'>
                    <Label htmlFor='content'>Content</Label>
                    <Textarea
                        id='content'
                        value={notesConfig.content ?? ''}
                        onChange={(e) => {
                            onConfigUpdate('content', e.target.value);
                        }}
                        placeholder='Enter your notes...'
                        rows={4}
                    />
                </div>
                <div className='space-y-2'>
                    <Label htmlFor='maxLength'>Max Length</Label>
                    <Input
                        id='maxLength'
                        type='number'
                        value={notesConfig.maxLength ?? 500}
                        onChange={(e) => {
                            onConfigUpdate(
                                'maxLength',
                                parseInt(e.target.value) || 500,
                            );
                        }}
                        min={1}
                        max={2000}
                    />
                </div>
            </>
        );
    };
    const renderTasksConfig = () => {
        const tasksConfig = config as {
            categories?: string[];
            defaultCategory?: string;
        };

        const categoriesError =
            !tasksConfig.categories || tasksConfig.categories.length === 0;

        return (
            <>
                <div className='space-y-2'>
                    <Label htmlFor='categories'>
                        Categories (comma-separated)
                    </Label>
                    <Input
                        id='categories'
                        value={tasksConfig.categories?.join(', ') ?? ''}
                        onChange={(e) => {
                            onConfigUpdate(
                                'categories',
                                e.target.value
                                    .split(',')
                                    .map((c) => c.trim())
                                    .filter((c) => c),
                            );
                        }}
                        placeholder='personal, work, urgent'
                        className={categoriesError ? 'border-red-500' : ''}
                    />
                    {categoriesError && (
                        <p className='text-sm text-red-600'>
                            At least one category is required
                        </p>
                    )}
                </div>
                <div className='space-y-2'>
                    <Label htmlFor='defaultCategory'>Default Category</Label>
                    <Input
                        id='defaultCategory'
                        value={tasksConfig.defaultCategory ?? ''}
                        onChange={(e) => {
                            onConfigUpdate('defaultCategory', e.target.value);
                        }}
                        placeholder='personal'
                    />
                </div>
            </>
        );
    };
    switch (type) {
        case 'clock':
            return (
                <>
                    {renderClockConfig()}
                    <ErrorDisplay errors={validationErrors} />
                </>
            );
        case 'weather':
            return (
                <>
                    {renderWeatherConfig()}
                    <ErrorDisplay errors={validationErrors} />
                </>
            );
        case 'notes':
            return (
                <>
                    {renderNotesConfig()}
                    <ErrorDisplay errors={validationErrors} />
                </>
            );
        case 'tasks':
            return (
                <>
                    {renderTasksConfig()}
                    <ErrorDisplay errors={validationErrors} />
                </>
            );
        default:
            return null;
    }
}
