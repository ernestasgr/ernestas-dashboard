import { Note } from '@/components/dashboard/hooks/useNotes';
import { NoteFormData, noteFormSchema } from '@/lib/schemas/form-schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

interface UseNoteFormProps {
    note?: Note | null;
    widgetId: string;
    isOpen: boolean;
}

export function useNoteForm({ note, widgetId, isOpen }: UseNoteFormProps) {
    const isEditing = Boolean(note);

    const form = useForm<NoteFormData>({
        resolver: zodResolver(noteFormSchema),
        defaultValues: {
            title: '',
            content: '',
            labels: [],
            widgetId,
        },
        mode: 'onChange',
    });

    const { reset } = form;

    useEffect(() => {
        if (isOpen) {
            if (note && isEditing) {
                reset({
                    title: note.title,
                    content: note.content,
                    labels: note.labels,
                    widgetId: note.widgetId,
                });
            } else {
                reset({
                    title: '',
                    content: '',
                    labels: [],
                    widgetId,
                });
            }
        }
    }, [isOpen, note, isEditing, widgetId, reset]);

    return {
        form,
        isEditing,
    };
}
