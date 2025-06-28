import {
    CreateNoteInput,
    CreateNoteWithObsidianSyncInput,
    DeleteNoteWithObsidianSyncInput,
    NoteType,
    ObsidianSyncInput,
    ObsidianTestConnectionInput,
    UpdateNoteInput,
    UpdateNoteLayoutInput,
    useCreateNoteMutation,
    useCreateNoteWithObsidianSyncMutation,
    useDeleteNoteMutation,
    useDeleteNoteWithObsidianSyncMutation,
    useGetNotesQuery,
    useSyncObsidianVaultMutation,
    useTestObsidianConnectionMutation,
    useUpdateNoteLayoutMutation,
    useUpdateNoteMutation,
    useUpdateNoteWithObsidianSyncMutation,
} from '@/generated/graphql';
import { ApolloError } from '@apollo/client';
import { useCallback, useEffect, useMemo, useState } from 'react';

export interface Note {
    id: string;
    widgetId: string;
    title: string;
    content: string;
    labels: string[];
    createdAt: Date;
    updatedAt: Date;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    source?: string;
    obsidianPath?: string;
}

export interface UseNotesReturn {
    notes: Note[];
    loading: boolean;
    error: ApolloError | undefined;
    createNote: (
        noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>,
        obsidianConfig?: { apiUrl: string; authKey: string },
    ) => Promise<void>;
    updateNote: (
        id: string,
        noteData: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>,
        obsidianConfig?: { apiUrl: string; authKey: string },
    ) => Promise<void>;
    updateNoteLayout: (
        id: string,
        layout: { x: number; y: number; width: number; height: number },
    ) => Promise<void>;
    deleteNote: (
        id: string,
        obsidianConfig?: { apiUrl: string; authKey: string },
    ) => Promise<void>;
    getNoteById: (id: string) => Note | undefined;
    getFilteredNotes: (
        widgetId: string,
        labelFilter?: string[],
        searchFilter?: string,
    ) => Note[];
    syncObsidianVault: (
        obsidianApiUrl: string,
        obsidianAuthKey: string,
    ) => Promise<void>;
    testObsidianConnection: (
        obsidianApiUrl: string,
        obsidianAuthKey: string,
    ) => Promise<boolean>;
    enableAutoSync: (obsidianApiUrl: string, obsidianAuthKey: string) => void;
    disableAutoSync: () => void;
    isAutoSyncEnabled: boolean;
}

// Convert GraphQL NoteType to Note interface
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
    source: noteType.source,
    obsidianPath: noteType.obsidianPath ?? undefined,
});

export const useNotes = (widgetId: string): UseNotesReturn => {
    const { data, loading, error, refetch } = useGetNotesQuery({
        variables: { filter: { widgetId } },
        fetchPolicy: 'cache-and-network',
    });

    const [createNoteMutation] = useCreateNoteMutation();
    const [createNoteWithObsidianSyncMutation] =
        useCreateNoteWithObsidianSyncMutation();
    const [updateNoteMutation] = useUpdateNoteMutation();
    const [updateNoteWithObsidianSyncMutation] =
        useUpdateNoteWithObsidianSyncMutation();
    const [updateNoteLayoutMutation] = useUpdateNoteLayoutMutation();
    const [deleteNoteMutation] = useDeleteNoteMutation();
    const [deleteNoteWithObsidianSyncMutation] =
        useDeleteNoteWithObsidianSyncMutation();
    const [syncObsidianVaultMutation] = useSyncObsidianVaultMutation();
    const [testObsidianConnectionMutation] =
        useTestObsidianConnectionMutation();

    const [autoSyncConfig, setAutoSyncConfig] = useState<{
        apiUrl: string;
        authKey: string;
    } | null>(null);
    const [hasAutoSynced, setHasAutoSynced] = useState(false);

    const notes = useMemo(() => {
        return data?.notes.map(convertNote) ?? [];
    }, [data?.notes]);

    const createNote = useCallback(
        async (
            noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>,
            obsidianConfig?: { apiUrl: string; authKey: string },
        ) => {
            const syncConfig = obsidianConfig ?? autoSyncConfig;
            const shouldSyncToObsidian = Boolean(syncConfig);

            if (shouldSyncToObsidian && syncConfig) {
                const input: CreateNoteWithObsidianSyncInput = {
                    title: noteData.title,
                    content: noteData.content,
                    labels: noteData.labels,
                    widgetId: noteData.widgetId,
                    x: noteData.x,
                    y: noteData.y,
                    width: noteData.width,
                    height: noteData.height,
                    syncToObsidian: true,
                    obsidianApiUrl: syncConfig.apiUrl,
                    obsidianAuthKey: syncConfig.authKey,
                };

                await createNoteWithObsidianSyncMutation({
                    variables: { input },
                    onCompleted: () => {
                        void refetch();
                    },
                });
            } else {
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
            }
        },
        [
            createNoteMutation,
            createNoteWithObsidianSyncMutation,
            refetch,
            autoSyncConfig,
        ],
    );

    const updateNote = useCallback(
        async (
            id: string,
            noteData: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>,
            obsidianConfig?: { apiUrl: string; authKey: string },
        ) => {
            const syncConfig = obsidianConfig ?? autoSyncConfig;
            const shouldSyncToObsidian = Boolean(
                syncConfig &&
                    (noteData.title !== undefined ||
                        noteData.content !== undefined ||
                        noteData.labels !== undefined),
            );

            if (shouldSyncToObsidian && syncConfig) {
                const input = {
                    id,
                    ...(noteData.title !== undefined && {
                        title: noteData.title,
                    }),
                    ...(noteData.content !== undefined && {
                        content: noteData.content,
                    }),
                    ...(noteData.labels !== undefined && {
                        labels: noteData.labels,
                    }),
                    ...(noteData.x !== undefined && { x: noteData.x }),
                    ...(noteData.y !== undefined && { y: noteData.y }),
                    ...(noteData.width !== undefined && {
                        width: noteData.width,
                    }),
                    ...(noteData.height !== undefined && {
                        height: noteData.height,
                    }),
                    syncToObsidian: true,
                    obsidianApiUrl: syncConfig.apiUrl,
                    obsidianAuthKey: syncConfig.authKey,
                };

                await updateNoteWithObsidianSyncMutation({
                    variables: { input },
                    onCompleted: () => {
                        void refetch();
                    },
                });
            } else {
                const input: UpdateNoteInput = {
                    id,
                    ...(noteData.title !== undefined && {
                        title: noteData.title,
                    }),
                    ...(noteData.content !== undefined && {
                        content: noteData.content,
                    }),
                    ...(noteData.labels !== undefined && {
                        labels: noteData.labels,
                    }),
                    ...(noteData.x !== undefined && { x: noteData.x }),
                    ...(noteData.y !== undefined && { y: noteData.y }),
                    ...(noteData.width !== undefined && {
                        width: noteData.width,
                    }),
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
            }
        },
        [
            updateNoteMutation,
            updateNoteWithObsidianSyncMutation,
            refetch,
            autoSyncConfig,
        ],
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
                        title: '',
                        content: '',
                        labels: [],
                        widgetId,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        x: layout.x,
                        y: layout.y,
                        width: layout.width,
                        height: layout.height,
                        source: 'local',
                        obsidianPath: null,
                    },
                },
            });
        },
        [updateNoteLayoutMutation, widgetId],
    );

    const deleteNote = useCallback(
        async (
            id: string,
            obsidianConfig?: { apiUrl: string; authKey: string },
        ) => {
            const syncConfig = obsidianConfig ?? autoSyncConfig;
            const shouldSyncToObsidian = Boolean(syncConfig);

            if (shouldSyncToObsidian && syncConfig) {
                const input: DeleteNoteWithObsidianSyncInput = {
                    id,
                    syncToObsidian: true,
                    obsidianApiUrl: syncConfig.apiUrl,
                    obsidianAuthKey: syncConfig.authKey,
                };

                await deleteNoteWithObsidianSyncMutation({
                    variables: { input },
                    onCompleted: () => {
                        void refetch();
                    },
                });
            } else {
                await deleteNoteMutation({
                    variables: { id },
                    onCompleted: () => {
                        void refetch();
                    },
                });
            }
        },
        [
            deleteNoteMutation,
            deleteNoteWithObsidianSyncMutation,
            refetch,
            autoSyncConfig,
        ],
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

            if (labelFilter && labelFilter.length > 0) {
                filtered = filtered.filter((note) =>
                    note.labels.some((label) => labelFilter.includes(label)),
                );
            }

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

    const syncObsidianVault = useCallback(
        async (obsidianApiUrl: string, obsidianAuthKey: string) => {
            try {
                const input: ObsidianSyncInput = {
                    widgetId,
                    apiUrl: obsidianApiUrl,
                    authKey: obsidianAuthKey,
                };

                await syncObsidianVaultMutation({
                    variables: { input },
                    onCompleted: () => {
                        void refetch();
                    },
                });
            } catch (error) {
                console.error('Failed to sync Obsidian vault:', error);
                throw error;
            }
        },
        [widgetId, syncObsidianVaultMutation, refetch],
    );

    const testObsidianConnection = useCallback(
        async (
            obsidianApiUrl: string,
            obsidianAuthKey: string,
        ): Promise<boolean> => {
            try {
                const input: ObsidianTestConnectionInput = {
                    apiUrl: obsidianApiUrl,
                    authKey: obsidianAuthKey,
                };

                const result = await testObsidianConnectionMutation({
                    variables: { input },
                });

                return result.data?.testObsidianConnection ?? false;
            } catch (error) {
                console.error('Failed to test Obsidian connection:', error);
                return false;
            }
        },
        [testObsidianConnectionMutation],
    );

    const enableAutoSync = useCallback((apiUrl: string, authKey: string) => {
        setAutoSyncConfig({ apiUrl, authKey });
        setHasAutoSynced(false);
    }, []);

    const disableAutoSync = useCallback(() => {
        setAutoSyncConfig(null);
        setHasAutoSynced(false);
    }, []);

    const isAutoSyncEnabled = autoSyncConfig !== null;

    useEffect(() => {
        if (autoSyncConfig && !hasAutoSynced && !loading) {
            const performAutoSync = async () => {
                try {
                    await syncObsidianVault(
                        autoSyncConfig.apiUrl,
                        autoSyncConfig.authKey,
                    );
                    setHasAutoSynced(true);
                } catch (error) {
                    console.error('Auto-sync failed:', error);
                }
            };

            void performAutoSync();
        }
    }, [autoSyncConfig, hasAutoSynced, loading, syncObsidianVault]);

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
        syncObsidianVault,
        testObsidianConnection,
        enableAutoSync,
        disableAutoSync,
        isAutoSyncEnabled,
    };
};
