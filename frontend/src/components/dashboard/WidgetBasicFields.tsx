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

const WIDGET_TYPES = [
    { value: 'clock', label: 'Clock' },
    { value: 'weather', label: 'Weather' },
    { value: 'notes', label: 'Notes' },
    { value: 'tasks', label: 'Tasks' },
];

interface WidgetBasicFieldsProps {
    title: string;
    type: string;
    isEditing: boolean;
    onTitleChange: (title: string) => void;
    onTypeChange: (type: string) => void;
}

export function WidgetBasicFields({
    title,
    type,
    isEditing,
    onTitleChange,
    onTypeChange,
}: WidgetBasicFieldsProps) {
    return (
        <>
            <div className='space-y-2'>
                <Label htmlFor='title'>Title</Label>
                <Input
                    id='title'
                    value={title}
                    onChange={(e) => {
                        onTitleChange(e.target.value);
                    }}
                    placeholder='Widget title'
                />
            </div>

            {!isEditing && (
                <div className='space-y-2'>
                    <Label htmlFor='type'>Type</Label>
                    <Select value={type} onValueChange={onTypeChange}>
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
                </div>
            )}
        </>
    );
}
