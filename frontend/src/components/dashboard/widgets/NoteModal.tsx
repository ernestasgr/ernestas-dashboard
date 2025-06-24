import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Note } from '@/hooks/useNotes';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface NoteModalProps {
    note?: Note | null;
    widgetId: string;
    maxLength?: number;
    isOpen: boolean;
    onClose: () => void;
    onSave: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const NoteModal = ({
    note,
    widgetId,
    maxLength = 500,
    isOpen,
    onClose,
    onSave,
}: NoteModalProps) => {
    const [title, setTitle] = useState(note?.title ?? '');
    const [content, setContent] = useState(note?.content ?? '');
    const [labels, setLabels] = useState<string[]>(note?.labels ?? []);
    const [newLabel, setNewLabel] = useState('');

    useEffect(() => {
        setTitle(note?.title ?? '');
        setContent(note?.content ?? '');
        setLabels(note?.labels ?? []);
        setNewLabel('');
    }, [note]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave({
            widgetId,
            title: title.trim() || 'Untitled Note',
            content,
            labels,
        });
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
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
            <div className='mx-4 w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800'>
                <div className='mb-4 flex items-center justify-between'>
                    <h2 className='text-xl font-semibold'>
                        {note ? 'Edit Note' : 'Create Note'}
                    </h2>
                    <Button
                        variant='ghost'
                        size='sm'
                        onClick={onClose}
                        className='h-8 w-8 p-0'
                    >
                        <X className='h-4 w-4' />
                    </Button>
                </div>

                <div className='space-y-4'>
                    <div>
                        <Label htmlFor='note-title'>Title</Label>
                        <Input
                            id='note-title'
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                            }}
                            placeholder='Enter note title...'
                            className='mt-1'
                        />
                    </div>

                    <div>
                        <Label htmlFor='note-content'>Content</Label>
                        <Textarea
                            id='note-content'
                            value={content}
                            onChange={(e) => {
                                if (e.target.value.length <= maxLength) {
                                    setContent(e.target.value);
                                }
                            }}
                            placeholder='Enter note content...'
                            rows={8}
                            className='mt-1'
                            maxLength={maxLength}
                        />
                        <div className='mt-1 text-sm text-gray-500'>
                            {content.length}/{maxLength} characters
                        </div>
                    </div>

                    <div>
                        <Label>Labels</Label>
                        <div className='mt-1 flex flex-wrap gap-2'>
                            {labels.map((label) => (
                                <span
                                    key={label}
                                    className='inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-sm dark:bg-gray-700'
                                >
                                    {label}
                                    <button
                                        onClick={() => {
                                            removeLabel(label);
                                        }}
                                        className='ml-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600'
                                    >
                                        <X className='h-3 w-3' />
                                    </button>
                                </span>
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
                            />
                            <Button onClick={addLabel} variant='outline'>
                                Add
                            </Button>
                        </div>
                    </div>

                    <div className='flex justify-end gap-2 pt-4'>
                        <Button variant='outline' onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>
                            {note ? 'Update' : 'Create'} Note
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
