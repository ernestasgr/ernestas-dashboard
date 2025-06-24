import {
    CreateNoteInput,
    NoteType,
    UpdateNoteInput,
    UpdateNoteLayoutInput,
    useCreateNoteMutation,
    useDeleteNoteMutation,
    useGetNotesQuery,
    useUpdateNoteLayoutMutation,
    useUpdateNoteMutation,
} from '@/generated/graphql';
import { ApolloError } from '@apollo/client';
import { useCallback, useMemo } from 'react';

export interface Note {
    id: string;
    widgetId: string;
    title: string;
    content: string;
    labels: string[];
    createdAt: Date;
    updatedAt: Date;
    // Layout properties for grid positioning
    x?: number;
    y?: number;
    width?: number;
    height?: number;
}

export interface UseNotesReturn {
    notes: Note[];
    loading: boolean;
    error: ApolloError | undefined;
    createNote: (
        noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>,
    ) => Promise<void>;
    updateNote: (
        id: string,
        noteData: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>,
    ) => Promise<void>;
    updateNoteLayout: (
        id: string,
        layout: { x: number; y: number; width: number; height: number },
    ) => Promise<void>;
    deleteNote: (id: string) => Promise<void>;
    getNoteById: (id: string) => Note | undefined;
    getFilteredNotes: (
        widgetId: string,
        labelFilter?: string[],
        searchFilter?: string,
    ) => Note[];
}

// Convert GraphQL NoteType to our Note interface
const convertNote = (noteType: NoteType): Note => ({
    id: noteType.id,
    widgetId: noteType.widgetId,
    title: noteType.title,
    content: noteType.content,
    labels: noteType.labels,
    createdAt: new Date(noteType.createdAt as string),
    updatedAt: new Date(noteType.updatedAt as string),
    x: typeof noteType.x === 'number' ? noteType.x : undefined,
    y: typeof noteType.y === 'number' ? noteType.y : undefined,
    width: typeof noteType.width === 'number' ? noteType.width : undefined,
    height: typeof noteType.height === 'number' ? noteType.height : undefined,
});

export const useNotes = (widgetId: string): UseNotesReturn => {
    const { data, loading, error, refetch } = useGetNotesQuery({
        variables: { filter: { widgetId } },
        fetchPolicy: 'cache-and-network',
    });

    const [createNoteMutation] = useCreateNoteMutation();
    const [updateNoteMutation] = useUpdateNoteMutation();
    const [updateNoteLayoutMutation] = useUpdateNoteLayoutMutation();
    const [deleteNoteMutation] = useDeleteNoteMutation();

    const notes = useMemo(() => {
        return data?.notes.map(convertNote) ?? [];
    }, [data?.notes]);

    const createNote = useCallback(
        async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
            const input: CreateNoteInput = {
                title: noteData.title,
                content: noteData.content,
                labels: noteData.labels,
                widgetId: noteData.widgetId,
                x: noteData.x,
                y: noteData.y,
                width: noteData.width,
                height: noteData.height,
            };

            await createNoteMutation({
                variables: { input },
                onCompleted: () => {
                    void refetch();
                },
            });
        },
        [createNoteMutation, refetch],
    );

    const updateNote = useCallback(
        async (
            id: string,
            noteData: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>,
        ) => {
            const input: UpdateNoteInput = {
                id,
                ...(noteData.title && { title: noteData.title }),
                ...(noteData.content && { content: noteData.content }),
                ...(noteData.labels && { labels: noteData.labels }),
                ...(noteData.x !== undefined && { x: noteData.x }),
                ...(noteData.y !== undefined && { y: noteData.y }),
                ...(noteData.width !== undefined && { width: noteData.width }),
                ...(noteData.height !== undefined && {
                    height: noteData.height,
                }),
            };

            await updateNoteMutation({
                variables: { input },
                onCompleted: () => {
                    void refetch();
                },
            });
        },
        [updateNoteMutation, refetch],
    );
    const updateNoteLayout = useCallback(
        async (
            id: string,
            layout: { x: number; y: number; width: number; height: number },
        ) => {
            const input: UpdateNoteLayoutInput = {
                id,
                x: layout.x,
                y: layout.y,
                width: layout.width,
                height: layout.height,
            };

            await updateNoteLayoutMutation({
                variables: { input },
                optimisticResponse: {
                    updateNoteLayout: {
                        __typename: 'NoteType',
                        id,
                        title: '', // Will be overridden by real response
                        content: '', // Will be overridden by real response
                        labels: [], // Will be overridden by real response
                        widgetId, // Will be overridden by real response
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        x: layout.x,
                        y: layout.y,
                        width: layout.width,
                        height: layout.height,
                    },
                },
            });
        },
        [updateNoteLayoutMutation, widgetId],
    );

    const deleteNote = useCallback(
        async (id: string) => {
            await deleteNoteMutation({
                variables: { id },
                onCompleted: () => {
                    void refetch();
                },
            });
        },
        [deleteNoteMutation, refetch],
    );

    const getNoteById = useCallback(
        (id: string) => {
            return notes.find((note) => note.id === id);
        },
        [notes],
    );

    const getFilteredNotes = useCallback(
        (
            targetWidgetId: string,
            labelFilter?: string[],
            searchFilter?: string,
        ) => {
            let filtered = notes.filter(
                (note) => note.widgetId === targetWidgetId,
            );

            // Filter by labels
            if (labelFilter && labelFilter.length > 0) {
                filtered = filtered.filter((note) =>
                    note.labels.some((label) => labelFilter.includes(label)),
                );
            }

            // Filter by search term
            if (searchFilter) {
                const search = searchFilter.toLowerCase();
                filtered = filtered.filter(
                    (note) =>
                        note.title.toLowerCase().includes(search) ||
                        note.content.toLowerCase().includes(search) ||
                        note.labels.some((label) =>
                            label.toLowerCase().includes(search),
                        ),
                );
            }

            return filtered.sort(
                (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
            );
        },
        [notes],
    );

    return {
        notes,
        loading,
        error,
        createNote,
        updateNote,
        updateNoteLayout,
        deleteNote,
        getNoteById,
        getFilteredNotes,
    };
};
