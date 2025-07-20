import type { Note } from '@/components/dashboard/hooks/useNotes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { Textarea } from '@/components/ui/textarea';
import { WidgetItemColors } from '@/lib/utils/widget-styling/types';
import { Edit3, Eye, X } from 'lucide-react';
import { useEffect, useState } from 'react';

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
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [labels, setLabels] = useState<string[]>([]);
    const [newLabel, setNewLabel] = useState('');
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [hasInitialized, setHasInitialized] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [originalNote, setOriginalNote] = useState<Note | null>(null);

    useEffect(() => {
        if (isOpen && !hasInitialized) {
            const isEdit = Boolean(note);
            setIsEditMode(isEdit);
            setOriginalNote(note ?? null);
            setTitle(note?.title ?? '');
            setContent(note?.content ?? '');
            setLabels(note?.labels ?? []);
            setNewLabel('');
            setIsPreviewMode(false);
            setHasInitialized(true);
        }

        if (!isOpen) {
            setHasInitialized(false);
            setIsEditMode(false);
            setOriginalNote(null);
        }
    }, [isOpen, note, hasInitialized]);

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

    const handleSave = () => {
        onSave(
            {
                widgetId,
                title: title.trim() || 'Untitled Note',
                content,
                labels,
            },
            originalNote,
        );
        onClose();
    };

    const addLabel = () => {
        const trimmedLabel = newLabel.trim();
        if (trimmedLabel && !labels.includes(trimmedLabel)) {
            setLabels([...labels, trimmedLabel]);
            setNewLabel('');
        }
    };

    const removeLabel = (labelToRemove: string) => {
        setLabels(labels.filter((label) => label !== labelToRemove));
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
                        {isEditMode ? 'Edit Note' : 'Create Note'}
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
                            <Input
                                id='note-title'
                                value={title}
                                onChange={(e) => {
                                    setTitle(e.target.value);
                                }}
                                placeholder='Enter note title...'
                                className='mt-1'
                                style={{
                                    borderColor:
                                        widgetColors?.border ?? '#E5E7EB',
                                    color:
                                        widgetColors?.primaryText ?? '#1F2937',
                                }}
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
                                            widgetColors?.darkBackground ??
                                            '#F9FAFB',
                                        borderColor:
                                            widgetColors?.border ?? '#E5E7EB',
                                    }}
                                >
                                    {content.trim() ? (
                                        <MarkdownRenderer
                                            content={content}
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
                                <Textarea
                                    id='note-content'
                                    value={content}
                                    onChange={(e) => {
                                        if (
                                            e.target.value.length <= maxLength
                                        ) {
                                            setContent(e.target.value);
                                        }
                                    }}
                                    placeholder='Enter note content...'
                                    rows={6}
                                    className='mt-1 max-h-64 min-h-[8rem] resize-y'
                                    style={{
                                        borderColor:
                                            widgetColors?.border ?? '#E5E7EB',
                                        color:
                                            widgetColors?.primaryText ??
                                            '#1F2937',
                                    }}
                                    maxLength={maxLength}
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
                                {content.length}/{maxLength} characters
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
                                {labels.map((label) => (
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
                        onClick={handleSave}
                        className='w-full sm:w-auto'
                        style={{
                            backgroundColor: widgetColors?.accent ?? '#3B82F6',
                            borderColor: widgetColors?.accent ?? '#3B82F6',
                            color: '#FFFFFF',
                        }}
                    >
                        {isEditMode ? 'Update' : 'Create'} Note
                    </Button>
                </div>
            </div>
        </div>
    );
};
