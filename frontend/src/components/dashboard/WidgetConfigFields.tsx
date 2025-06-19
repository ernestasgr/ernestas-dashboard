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
import { Textarea } from '@/components/ui/textarea';

interface WidgetConfigFieldsProps {
    type: string;
    config: Record<string, unknown>;
    onConfigUpdate: (field: string, value: unknown) => void;
}

export function WidgetConfigFields({
    type,
    config,
    onConfigUpdate,
}: WidgetConfigFieldsProps) {
    const renderClockConfig = () => {
        const clockConfig = config as {
            timezone?: string;
            format?: string;
        };

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
                    />
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
                    />
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
                    />
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
            return renderClockConfig();
        case 'weather':
            return renderWeatherConfig();
        case 'notes':
            return renderNotesConfig();
        case 'tasks':
            return renderTasksConfig();
        default:
            return null;
    }
}
