import { useNoteForm } from '@/components/dashboard/hooks/useNoteForm';
import type { Note } from '@/components/dashboard/hooks/useNotes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { Textarea } from '@/components/ui/textarea';
import { NoteFormData } from '@/lib/schemas/form-schemas';
import { WidgetItemColors } from '@/lib/utils/widget-styling/types';
import { Edit3, Eye, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';

interface NoteModalProps {
    note?: Note | null;
    widgetId: string;
    widgetColors?: WidgetItemColors;
    maxLength?: number;
    isOpen: boolean;
    onClose: () => void;
    onSave: (
        noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>,
        existingNote?: Note | null,
    ) => void;
}

export const NoteModal = ({
    note,
    widgetId,
    widgetColors,
    maxLength = 500,
    isOpen,
    onClose,
    onSave,
}: NoteModalProps) => {
    const { form, isEditing } = useNoteForm({ note, widgetId, isOpen });
    const { handleSubmit, control, watch, setValue } = form;

    const [newLabel, setNewLabel] = useState('');
    const [isPreviewMode, setIsPreviewMode] = useState(false);

    const watchedContent = watch('content');
    const watchedLabels = watch('labels');

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const onSubmit = (data: NoteFormData) => {
        onSave(
            {
                widgetId: data.widgetId,
                title: data.title.trim() || 'Untitled Note',
                content: data.content,
                labels: data.labels,
            },
            note,
        );
        onClose();
    };

    const handleFormSubmit = () => {
        void handleSubmit(onSubmit)();
    };

    const addLabel = () => {
        const trimmedLabel = newLabel.trim();
        if (trimmedLabel && !watchedLabels.includes(trimmedLabel)) {
            setValue('labels', [...watchedLabels, trimmedLabel], {
                shouldValidate: true,
            });
            setNewLabel('');
        }
    };

    const removeLabel = (labelToRemove: string) => {
        setValue(
            'labels',
            watchedLabels.filter((label) => label !== labelToRemove),
            { shouldValidate: true },
        );
    };

    return (
        <div
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm sm:p-6'
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                className='mx-auto flex h-full max-h-[95vh] w-full max-w-2xl flex-col rounded-lg shadow-xl sm:max-h-[90vh]'
                style={{
                    backgroundColor: widgetColors?.lightBackground ?? '#FFFFFF',
                    borderColor: widgetColors?.border ?? '#E5E7EB',
                    border: '1px solid',
                }}
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                <div
                    className='flex flex-shrink-0 items-center justify-between border-b p-4 sm:p-6'
                    style={{
                        borderColor: widgetColors?.border ?? '#E5E7EB',
                    }}
                >
                    <h2
                        className='text-lg font-semibold sm:text-xl'
                        style={{
                            color: widgetColors?.primaryText ?? '#1F2937',
                        }}
                    >
                        {isEditing ? 'Edit Note' : 'Create Note'}
                    </h2>
                    <Button
                        variant='ghost'
                        size='sm'
                        onClick={onClose}
                        className='h-8 w-8 p-0'
                        style={{
                            color: widgetColors?.secondaryText ?? '#6B7280',
                        }}
                    >
                        <X className='h-4 w-4' />
                    </Button>
                </div>

                <div className='flex-1 overflow-y-auto p-4 sm:p-6'>
                    <div className='space-y-4'>
                        <div>
                            <Label
                                htmlFor='note-title'
                                style={{
                                    color:
                                        widgetColors?.primaryText ?? '#1F2937',
                                }}
                            >
                                Title
                            </Label>
                            <Controller
                                name='title'
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id='note-title'
                                        placeholder='Enter note title...'
                                        className='mt-1'
                                        style={{
                                            borderColor:
                                                widgetColors?.border ??
                                                '#E5E7EB',
                                            color:
                                                widgetColors?.primaryText ??
                                                '#1F2937',
                                        }}
                                    />
                                )}
                            />
                        </div>

                        <div>
                            <div className='mb-1 flex items-center justify-between'>
                                <Label
                                    htmlFor='note-content'
                                    style={{
                                        color:
                                            widgetColors?.primaryText ??
                                            '#1F2937',
                                    }}
                                >
                                    Content
                                </Label>
                                <Button
                                    type='button'
                                    variant='ghost'
                                    size='sm'
                                    onClick={() => {
                                        setIsPreviewMode(!isPreviewMode);
                                    }}
                                    className='h-7 px-2 text-xs'
                                    style={{
                                        color:
                                            widgetColors?.accent ?? '#3B82F6',
                                    }}
                                >
                                    {isPreviewMode ? (
                                        <>
                                            <Edit3 className='mr-1 h-3 w-3' />
                                            Edit
                                        </>
                                    ) : (
                                        <>
                                            <Eye className='mr-1 h-3 w-3' />
                                            Preview
                                        </>
                                    )}
                                </Button>
                            </div>

                            {isPreviewMode ? (
                                <div
                                    className='max-h-64 min-h-[12rem] overflow-y-auto rounded-md border p-3'
                                    style={{
                                        backgroundColor:
                                            widgetColors?.lightBackground ??
                                            '#F9FAFB',
                                        borderColor:
                                            widgetColors?.border ?? '#E5E7EB',
                                    }}
                                >
                                    {watchedContent.trim() ? (
                                        <MarkdownRenderer
                                            content={watchedContent}
                                            widgetColors={widgetColors}
                                            variant='modal'
                                            className='prose prose-sm max-w-none'
                                        />
                                    ) : (
                                        <p
                                            className='italic'
                                            style={{
                                                color:
                                                    widgetColors?.secondaryText ??
                                                    '#6B7280',
                                            }}
                                        >
                                            Nothing to preview...
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <Controller
                                    name='content'
                                    control={control}
                                    render={({ field }) => (
                                        <Textarea
                                            {...field}
                                            id='note-content'
                                            onChange={(e) => {
                                                if (
                                                    e.target.value.length <=
                                                    maxLength
                                                ) {
                                                    field.onChange(
                                                        e.target.value,
                                                    );
                                                }
                                            }}
                                            placeholder='Enter note content...'
                                            rows={6}
                                            className='mt-1 max-h-64 min-h-[8rem] resize-y'
                                            style={{
                                                borderColor:
                                                    widgetColors?.border ??
                                                    '#E5E7EB',
                                                color:
                                                    widgetColors?.primaryText ??
                                                    '#1F2937',
                                            }}
                                            maxLength={maxLength}
                                        />
                                    )}
                                />
                            )}

                            <div
                                className='mt-1 text-sm'
                                style={{
                                    color:
                                        widgetColors?.secondaryText ??
                                        '#6B7280',
                                }}
                            >
                                {watchedContent.length}/{maxLength} characters
                            </div>
                        </div>

                        <div>
                            <Label
                                style={{
                                    color:
                                        widgetColors?.primaryText ?? '#1F2937',
                                }}
                            >
                                Labels
                            </Label>
                            <div className='mt-1 flex flex-wrap gap-2'>
                                {watchedLabels.map((label: string) => (
                                    <Badge
                                        key={label}
                                        variant='secondary'
                                        className='inline-flex items-center gap-1'
                                        style={{
                                            backgroundColor:
                                                widgetColors?.accentLight ??
                                                '#DBEAFE',
                                            color:
                                                widgetColors?.accent ??
                                                '#3B82F6',
                                            borderColor:
                                                widgetColors?.accent ??
                                                '#3B82F6',
                                        }}
                                    >
                                        {label}
                                        <button
                                            onClick={() => {
                                                removeLabel(label);
                                            }}
                                            className='ml-1 rounded-full'
                                            style={{
                                                color:
                                                    widgetColors?.accent ??
                                                    '#3B82F6',
                                            }}
                                        >
                                            <X className='h-3 w-3' />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                            <div className='mt-2 flex gap-2'>
                                <Input
                                    value={newLabel}
                                    onChange={(e) => {
                                        setNewLabel(e.target.value);
                                    }}
                                    placeholder='Add label...'
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addLabel();
                                        }
                                    }}
                                    className='flex-1'
                                    style={{
                                        borderColor:
                                            widgetColors?.border ?? '#E5E7EB',
                                        color:
                                            widgetColors?.primaryText ??
                                            '#1F2937',
                                    }}
                                />
                                <Button
                                    onClick={addLabel}
                                    variant='outline'
                                    style={{
                                        borderColor:
                                            widgetColors?.accent ?? '#3B82F6',
                                        color:
                                            widgetColors?.accent ?? '#3B82F6',
                                    }}
                                >
                                    Add
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className='flex flex-shrink-0 flex-col gap-2 border-t p-4 sm:flex-row sm:justify-end sm:p-6'
                    style={{
                        borderColor: widgetColors?.border ?? '#E5E7EB',
                    }}
                >
                    <Button
                        variant='outline'
                        onClick={onClose}
                        className='w-full sm:w-auto'
                        style={{
                            borderColor: widgetColors?.border ?? '#E5E7EB',
                            color: widgetColors?.secondaryText ?? '#6B7280',
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleFormSubmit}
                        className='w-full sm:w-auto'
                        style={{
                            backgroundColor: widgetColors?.accent ?? '#3B82F6',
                            borderColor: widgetColors?.accent ?? '#3B82F6',
                            color: '#FFFFFF',
                        }}
                    >
                        {isEditing ? 'Update' : 'Create'} Note
                    </Button>
                </div>
            </div>
        </div>
    );
};
