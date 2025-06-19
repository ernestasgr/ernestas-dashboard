'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
    CreateWidgetInput,
    UpdateWidgetInput,
    Widget,
    useCreateWidgetMutation,
    useMeQuery,
    useUpdateWidgetMutation,
} from '@/generated/graphql';
import { useEffect, useState } from 'react';

interface WidgetFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    widget?: Widget | null;
    onWidgetCreated?: (widget: Widget) => void;
    onWidgetUpdated?: (widget: Widget) => void;
}

const WIDGET_TYPES = [
    { value: 'clock', label: 'Clock' },
    { value: 'weather', label: 'Weather' },
    { value: 'notes', label: 'Notes' },
    { value: 'tasks', label: 'Tasks' },
];

const DEFAULT_CONFIGS = {
    clock: { timezone: 'UTC', format: '24h' },
    weather: { location: 'New York, NY', units: 'metric' },
    notes: { content: '', maxLength: 500 },
    tasks: {
        categories: ['personal', 'work', 'urgent'],
        defaultCategory: 'personal',
    },
};

export function WidgetForm({
    open,
    onOpenChange,
    widget,
    onWidgetCreated,
    onWidgetUpdated,
}: WidgetFormProps) {
    const { data: meData } = useMeQuery();
    const [createWidget, { loading: creating }] = useCreateWidgetMutation();
    const [updateWidget, { loading: updating }] = useUpdateWidgetMutation();
    const isEditing = !!widget;
    const loading = creating || updating;
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
                setFormData({
                    type: 'clock',
                    title: '',
                    x: 0,
                    y: 0,
                    width: 3,
                    height: 4,
                    config: DEFAULT_CONFIGS.clock as Record<string, unknown>,
                });
            }
        }
    }, [open, widget]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!meData?.me.email) return;

        try {
            if (isEditing) {
                const input: UpdateWidgetInput = {
                    id: widget.id,
                    title: formData.title || undefined,
                    x: formData.x,
                    y: formData.y,
                    width: formData.width,
                    height: formData.height,
                    config: formData.config,
                };

                const result = await updateWidget({ variables: { input } });
                if (result.data?.updateWidget && onWidgetUpdated) {
                    onWidgetUpdated(result.data.updateWidget);
                }
            } else {
                const input: CreateWidgetInput = {
                    type: formData.type,
                    title: formData.title || undefined,
                    x: formData.x,
                    y: formData.y,
                    width: formData.width,
                    height: formData.height,
                    config: formData.config,
                };

                const result = await createWidget({
                    variables: {
                        userId: meData.me.email,
                        input,
                    },
                });

                if (result.data?.createWidget && onWidgetCreated) {
                    onWidgetCreated(result.data.createWidget);
                }
            }

            onOpenChange(false);
            setFormData({
                type: 'clock',
                title: '',
                x: 0,
                y: 0,
                width: 3,
                height: 4,
                config: DEFAULT_CONFIGS.clock,
            });
        } catch (error) {
            console.error('Error saving widget:', error);
        }
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
    const updateConfigField = (field: string, value: unknown) => {
        setFormData((prev) => ({
            ...prev,
            config: {
                ...prev.config,
                [field]: value,
            },
        }));
    };
    const renderConfigFields = () => {
        switch (formData.type) {
            case 'clock':
                const clockConfig = formData.config as {
                    timezone?: string;
                    format?: string;
                };
                return (
                    <>
                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label htmlFor='timezone'>Timezone</Label>
                                <Input
                                    id='timezone'
                                    value={clockConfig.timezone ?? 'UTC'}
                                    onChange={(e) => {
                                        updateConfigField(
                                            'timezone',
                                            e.target.value,
                                        );
                                    }}
                                    placeholder='UTC'
                                />
                            </div>
                            <div className='space-y-2'>
                                <Label htmlFor='format'>Format</Label>
                                <Select
                                    value={clockConfig.format ?? '24h'}
                                    onValueChange={(value) => {
                                        updateConfigField('format', value);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='12h'>
                                            12 Hour
                                        </SelectItem>
                                        <SelectItem value='24h'>
                                            24 Hour
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </>
                );

            case 'weather':
                const weatherConfig = formData.config as {
                    location?: string;
                    units?: string;
                };
                return (
                    <>
                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label htmlFor='location'>Location</Label>
                                <Input
                                    id='location'
                                    value={weatherConfig.location ?? ''}
                                    onChange={(e) => {
                                        updateConfigField(
                                            'location',
                                            e.target.value,
                                        );
                                    }}
                                    placeholder='New York, NY'
                                />
                            </div>
                            <div className='space-y-2'>
                                <Label htmlFor='units'>Units</Label>
                                <Select
                                    value={weatherConfig.units ?? 'metric'}
                                    onValueChange={(value) => {
                                        updateConfigField('units', value);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='metric'>
                                            Celsius
                                        </SelectItem>
                                        <SelectItem value='imperial'>
                                            Fahrenheit
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </>
                );

            case 'notes':
                const notesConfig = formData.config as {
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
                                    updateConfigField(
                                        'content',
                                        e.target.value,
                                    );
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
                                    updateConfigField(
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

            case 'tasks':
                const tasksConfig = formData.config as {
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
                                    updateConfigField(
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
                            <Label htmlFor='defaultCategory'>
                                Default Category
                            </Label>
                            <Input
                                id='defaultCategory'
                                value={tasksConfig.defaultCategory ?? ''}
                                onChange={(e) => {
                                    updateConfigField(
                                        'defaultCategory',
                                        e.target.value,
                                    );
                                }}
                                placeholder='personal'
                            />
                        </div>
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[500px]'>
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Edit Widget' : 'Add New Widget'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Update the widget settings.'
                            : 'Create a new widget for your dashboard.'}
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={(e) => {
                        void handleSubmit(e);
                    }}
                    className='space-y-6'
                >
                    <div className='space-y-4'>
                        <div className='space-y-2'>
                            <Label htmlFor='title'>Title</Label>
                            <Input
                                id='title'
                                value={formData.title}
                                onChange={(e) => {
                                    setFormData((prev) => ({
                                        ...prev,
                                        title: e.target.value,
                                    }));
                                }}
                                placeholder='Widget title'
                            />
                        </div>

                        {!isEditing && (
                            <div className='space-y-2'>
                                <Label htmlFor='type'>Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={handleTypeChange}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {WIDGET_TYPES.map((type) => (
                                            <SelectItem
                                                key={type.value}
                                                value={type.value}
                                            >
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className='grid grid-cols-4 gap-4'>
                            <div className='space-y-2'>
                                <Label htmlFor='x'>X Position</Label>
                                <Input
                                    id='x'
                                    type='number'
                                    value={formData.x}
                                    onChange={(e) => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            x: parseInt(e.target.value) || 0,
                                        }));
                                    }}
                                    min={0}
                                    max={11}
                                />
                            </div>
                            <div className='space-y-2'>
                                <Label htmlFor='y'>Y Position</Label>
                                <Input
                                    id='y'
                                    type='number'
                                    value={formData.y}
                                    onChange={(e) => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            y: parseInt(e.target.value) || 0,
                                        }));
                                    }}
                                    min={0}
                                />
                            </div>
                            <div className='space-y-2'>
                                <Label htmlFor='width'>Width</Label>
                                <Input
                                    id='width'
                                    type='number'
                                    value={formData.width}
                                    onChange={(e) => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            width:
                                                parseInt(e.target.value) || 1,
                                        }));
                                    }}
                                    min={1}
                                    max={12}
                                />
                            </div>
                            <div className='space-y-2'>
                                <Label htmlFor='height'>Height</Label>
                                <Input
                                    id='height'
                                    type='number'
                                    value={formData.height}
                                    onChange={(e) => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            height:
                                                parseInt(e.target.value) || 1,
                                        }));
                                    }}
                                    min={1}
                                />
                            </div>
                        </div>

                        {renderConfigFields()}
                    </div>

                    <DialogFooter>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={() => {
                                onOpenChange(false);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button type='submit' disabled={loading}>
                            {loading
                                ? 'Saving...'
                                : isEditing
                                  ? 'Update Widget'
                                  : 'Create Widget'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
