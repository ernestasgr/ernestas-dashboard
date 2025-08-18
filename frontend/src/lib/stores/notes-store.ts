import { useMemo } from 'react';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

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

export interface LayoutEntry {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface NotesWidgetState {
    notes: Note[];
    layout: Partial<Record<string, LayoutEntry>>;
    isCreateModalOpen: boolean;
    isViewModalOpen: boolean;
    selectedNote: Note | null;
    editingNote: Note | null;
    viewModalTransition: 'closed' | 'opening' | 'open' | 'closing';
    labelFilter: string;
    showFilters: boolean;
    containerWidth: number;
    isSyncing: boolean;
    autoSyncConfig: { apiUrl: string; authKey: string } | null;
    hasAutoSynced: boolean;
}

const defaultWidgetState = (): NotesWidgetState => ({
    notes: [],
    layout: {},
    isCreateModalOpen: false,
    isViewModalOpen: false,
    selectedNote: null,
    editingNote: null,
    viewModalTransition: 'closed',
    labelFilter: '',
    showFilters: false,
    containerWidth: 400,
    isSyncing: false,
    autoSyncConfig: null,
    hasAutoSynced: false,
});

const DEFAULT_WIDGET_STATE: Readonly<NotesWidgetState> =
    Object.freeze(defaultWidgetState());

type NotesByWidgetId = Record<string, NotesWidgetState>;

interface NotesStoreState {
    notesByWidgetId: NotesByWidgetId;

    // Actions explicitly take widgetId and operate on its slice
    setNotes: (widgetId: string, notes: Note[]) => void;
    upsertNote: (widgetId: string, note: Note) => void;
    removeNote: (widgetId: string, id: string) => void;
    updateNoteLayoutLocal: (
        widgetId: string,
        id: string,
        layout: LayoutEntry,
    ) => void;

    openCreateModal: (widgetId: string) => void;
    closeCreateModal: (widgetId: string) => void;
    openEditModal: (widgetId: string, note: Note) => void;
    openViewModal: (widgetId: string, note: Note) => void;
    closeViewModal: (widgetId: string) => void;
    clearSelectedNote: (widgetId: string) => void;

    setLabelFilter: (widgetId: string, filter: string) => void;
    toggleFilters: (widgetId: string) => void;

    setContainerWidth: (widgetId: string, width: number) => void;

    setSyncing: (widgetId: string, syncing: boolean) => void;

    enableAutoSync: (widgetId: string, apiUrl: string, authKey: string) => void;
    disableAutoSync: (widgetId: string) => void;
    markAutoSynced: (widgetId: string) => void;

    reset: (widgetId: string) => void;
}

const ensureSlice = (
    notesByWidgetId: NotesByWidgetId,
    widgetId: string,
): NotesWidgetState => notesByWidgetId[widgetId] ?? defaultWidgetState();

export const useNotesStore = create<NotesStoreState>()(
    subscribeWithSelector((set) => ({
        notesByWidgetId: {},

        setNotes: (widgetId, notes) => {
            set((state) => {
                const prev = ensureSlice(state.notesByWidgetId, widgetId);
                const nextLayout = { ...prev.layout };
                for (const n of notes) {
                    if (
                        typeof n.x === 'number' &&
                        typeof n.y === 'number' &&
                        typeof n.width === 'number' &&
                        typeof n.height === 'number'
                    ) {
                        nextLayout[n.id] = {
                            x: n.x,
                            y: n.y,
                            width: n.width,
                            height: n.height,
                        };
                    }
                }
                return {
                    notesByWidgetId: {
                        ...state.notesByWidgetId,
                        [widgetId]: { ...prev, notes, layout: nextLayout },
                    },
                };
            });
        },

        upsertNote: (widgetId, note) => {
            set((state) => {
                const prev = ensureSlice(state.notesByWidgetId, widgetId);
                const idx = prev.notes.findIndex((n) => n.id === note.id);
                const notes = [...prev.notes];
                if (idx === -1) notes.push(note);
                else notes[idx] = note;
                const layout = { ...prev.layout };
                if (
                    typeof note.x === 'number' &&
                    typeof note.y === 'number' &&
                    typeof note.width === 'number' &&
                    typeof note.height === 'number'
                ) {
                    layout[note.id] = {
                        x: note.x,
                        y: note.y,
                        width: note.width,
                        height: note.height,
                    } as LayoutEntry;
                }
                return {
                    notesByWidgetId: {
                        ...state.notesByWidgetId,
                        [widgetId]: { ...prev, notes, layout },
                    },
                };
            });
        },

        removeNote: (widgetId, id) => {
            set((state) => {
                const prev = ensureSlice(state.notesByWidgetId, widgetId);
                const notes = prev.notes.filter((n) => n.id !== id);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { [id]: _removed, ...rest } = prev.layout;
                return {
                    notesByWidgetId: {
                        ...state.notesByWidgetId,
                        [widgetId]: { ...prev, notes, layout: rest },
                    },
                };
            });
        },

        updateNoteLayoutLocal: (widgetId, id, layoutEntry) => {
            set((state) => {
                const prev = ensureSlice(state.notesByWidgetId, widgetId);
                return {
                    notesByWidgetId: {
                        ...state.notesByWidgetId,
                        [widgetId]: {
                            ...prev,
                            layout: { ...prev.layout, [id]: layoutEntry },
                        },
                    },
                };
            });
        },

        openCreateModal: (widgetId) => {
            console.log('[NotesStore] openCreateModal', widgetId);
            set((state) => {
                const prev = ensureSlice(state.notesByWidgetId, widgetId);
                return {
                    notesByWidgetId: {
                        ...state.notesByWidgetId,
                        [widgetId]: {
                            ...prev,
                            isCreateModalOpen: true,
                            selectedNote: null,
                            editingNote: null,
                        },
                    },
                };
            });
        },

        closeCreateModal: (widgetId) => {
            console.log('[NotesStore] closeCreateModal', widgetId);
            set((state) => {
                const prev = ensureSlice(state.notesByWidgetId, widgetId);
                return {
                    notesByWidgetId: {
                        ...state.notesByWidgetId,
                        [widgetId]: {
                            ...prev,
                            isCreateModalOpen: false,
                            editingNote: null,
                        },
                    },
                };
            });
        },

        openEditModal: (widgetId, note) => {
            console.log('[NotesStore] openEditModal', widgetId, note);
            set((state) => {
                const prev = ensureSlice(state.notesByWidgetId, widgetId);
                return {
                    notesByWidgetId: {
                        ...state.notesByWidgetId,
                        [widgetId]: {
                            ...prev,
                            isCreateModalOpen: true,
                            selectedNote: note,
                            editingNote: note,
                        },
                    },
                };
            });
        },

        openViewModal: (widgetId, note) => {
            console.log('[NotesStore] openViewModal', widgetId, note);
            set((state) => {
                const prev = ensureSlice(state.notesByWidgetId, widgetId);
                return {
                    notesByWidgetId: {
                        ...state.notesByWidgetId,
                        [widgetId]: {
                            ...prev,
                            selectedNote: note,
                            viewModalTransition: 'opening',
                            isViewModalOpen: true,
                        },
                    },
                };
            });

            // Update URL with noteId
            try {
                const url = new URL(window.location.href);
                url.searchParams.set('noteId', note.id);
                window.history.pushState({}, '', url.toString());
            } catch {
                // no-op for non-browser/test envs
            }

            // Transition to open on next frame
            if (typeof window !== 'undefined') {
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        set((state2) => {
                            const prev2 = ensureSlice(
                                state2.notesByWidgetId,
                                widgetId,
                            );
                            if (prev2.viewModalTransition !== 'opening') {
                                return state2;
                            }
                            return {
                                notesByWidgetId: {
                                    ...state2.notesByWidgetId,
                                    [widgetId]: {
                                        ...prev2,
                                        viewModalTransition: 'open',
                                    },
                                },
                            };
                        });
                    }, 10);
                });
            }
        },

        closeViewModal: (widgetId) => {
            console.log('[NotesStore] closeViewModal', widgetId);
            set((state) => {
                const prev = ensureSlice(state.notesByWidgetId, widgetId);
                return {
                    notesByWidgetId: {
                        ...state.notesByWidgetId,
                        [widgetId]: { ...prev, viewModalTransition: 'closing' },
                    },
                };
            });

            setTimeout(() => {
                set((state) => {
                    const prev = ensureSlice(state.notesByWidgetId, widgetId);
                    return {
                        notesByWidgetId: {
                            ...state.notesByWidgetId,
                            [widgetId]: {
                                ...prev,
                                isViewModalOpen: false,
                                selectedNote: null,
                                viewModalTransition: 'closed',
                            },
                        },
                    };
                });
                console.log('[NotesStore] viewModal closed', widgetId);
            }, 250);

            try {
                const url = new URL(window.location.href);
                url.searchParams.delete('noteId');
                window.history.pushState({}, '', url.toString());
            } catch {
                // no-op in test/non-browser envs
            }
        },

        clearSelectedNote: (widgetId) => {
            console.log('[NotesStore] clearSelectedNote', widgetId);
            set((state) => {
                const prev = ensureSlice(state.notesByWidgetId, widgetId);
                return {
                    notesByWidgetId: {
                        ...state.notesByWidgetId,
                        [widgetId]: { ...prev, selectedNote: null },
                    },
                };
            });
        },

        setLabelFilter: (widgetId, filter) => {
            console.log('[NotesStore] setLabelFilter', widgetId, filter);
            set((state) => {
                const prev = ensureSlice(state.notesByWidgetId, widgetId);
                return {
                    notesByWidgetId: {
                        ...state.notesByWidgetId,
                        [widgetId]: { ...prev, labelFilter: filter },
                    },
                };
            });
        },

        toggleFilters: (widgetId) => {
            console.log('[NotesStore] toggleFilters', widgetId);
            set((state) => {
                const prev = ensureSlice(state.notesByWidgetId, widgetId);
                return {
                    notesByWidgetId: {
                        ...state.notesByWidgetId,
                        [widgetId]: { ...prev, showFilters: !prev.showFilters },
                    },
                };
            });
        },

        setContainerWidth: (widgetId, width) => {
            console.log('[NotesStore] setContainerWidth', widgetId, width);
            set((state) => {
                const prev = ensureSlice(state.notesByWidgetId, widgetId);
                return {
                    notesByWidgetId: {
                        ...state.notesByWidgetId,
                        [widgetId]: { ...prev, containerWidth: width },
                    },
                };
            });
        },

        setSyncing: (widgetId, syncing) => {
            console.log('[NotesStore] setSyncing', widgetId, syncing);
            set((state) => {
                const prev = ensureSlice(state.notesByWidgetId, widgetId);
                return {
                    notesByWidgetId: {
                        ...state.notesByWidgetId,
                        [widgetId]: { ...prev, isSyncing: syncing },
                    },
                };
            });
        },

        enableAutoSync: (widgetId, apiUrl, authKey) => {
            console.log('[NotesStore] enableAutoSync', widgetId);
            set((state) => {
                const prev = ensureSlice(state.notesByWidgetId, widgetId);
                return {
                    notesByWidgetId: {
                        ...state.notesByWidgetId,
                        [widgetId]: {
                            ...prev,
                            autoSyncConfig: { apiUrl, authKey },
                            hasAutoSynced: false,
                        },
                    },
                };
            });
        },

        disableAutoSync: (widgetId) => {
            console.log('[NotesStore] disableAutoSync', widgetId);
            set((state) => {
                const prev = ensureSlice(state.notesByWidgetId, widgetId);
                return {
                    notesByWidgetId: {
                        ...state.notesByWidgetId,
                        [widgetId]: {
                            ...prev,
                            autoSyncConfig: null,
                            hasAutoSynced: false,
                        },
                    },
                };
            });
        },

        markAutoSynced: (widgetId) => {
            set((state) => {
                const prev = ensureSlice(state.notesByWidgetId, widgetId);
                return {
                    notesByWidgetId: {
                        ...state.notesByWidgetId,
                        [widgetId]: { ...prev, hasAutoSynced: true },
                    },
                };
            });
        },

        reset: (widgetId) => {
            console.log('[NotesStore] reset', widgetId);
            set((state) => ({
                notesByWidgetId: {
                    ...state.notesByWidgetId,
                    [widgetId]: defaultWidgetState(),
                },
            }));
        },
    })),
);

// Convenience hook: returns the slice for a widgetId and widget-bound action wrappers.
export const useNotesWidgetStore = (widgetId: string) => {
    const slice = useNotesStore(
        (s) => s.notesByWidgetId[widgetId] ?? DEFAULT_WIDGET_STATE,
    );

    const setNotes_ = useNotesStore((s) => s.setNotes);
    const upsertNote_ = useNotesStore((s) => s.upsertNote);
    const removeNote_ = useNotesStore((s) => s.removeNote);
    const updateNoteLayoutLocal_ = useNotesStore(
        (s) => s.updateNoteLayoutLocal,
    );
    const openCreateModal_ = useNotesStore((s) => s.openCreateModal);
    const closeCreateModal_ = useNotesStore((s) => s.closeCreateModal);
    const openEditModal_ = useNotesStore((s) => s.openEditModal);
    const openViewModal_ = useNotesStore((s) => s.openViewModal);
    const closeViewModal_ = useNotesStore((s) => s.closeViewModal);
    const clearSelectedNote_ = useNotesStore((s) => s.clearSelectedNote);
    const setLabelFilter_ = useNotesStore((s) => s.setLabelFilter);
    const toggleFilters_ = useNotesStore((s) => s.toggleFilters);
    const setContainerWidth_ = useNotesStore((s) => s.setContainerWidth);
    const setSyncing_ = useNotesStore((s) => s.setSyncing);
    const enableAutoSync_ = useNotesStore((s) => s.enableAutoSync);
    const disableAutoSync_ = useNotesStore((s) => s.disableAutoSync);
    const markAutoSynced_ = useNotesStore((s) => s.markAutoSynced);
    const reset_ = useNotesStore((s) => s.reset);

    const actions = useMemo(
        () => ({
            setNotes: (notes: Note[]) => {
                setNotes_(widgetId, notes);
            },
            upsertNote: (note: Note) => {
                upsertNote_(widgetId, note);
            },
            removeNote: (id: string) => {
                removeNote_(widgetId, id);
            },
            updateNoteLayoutLocal: (id: string, layout: LayoutEntry) => {
                updateNoteLayoutLocal_(widgetId, id, layout);
            },
            openCreateModal: () => {
                openCreateModal_(widgetId);
            },
            closeCreateModal: () => {
                closeCreateModal_(widgetId);
            },
            openEditModal: (note: Note) => {
                openEditModal_(widgetId, note);
            },
            openViewModal: (note: Note) => {
                openViewModal_(widgetId, note);
            },
            closeViewModal: () => {
                closeViewModal_(widgetId);
            },
            clearSelectedNote: () => {
                clearSelectedNote_(widgetId);
            },
            setLabelFilter: (filter: string) => {
                setLabelFilter_(widgetId, filter);
            },
            toggleFilters: () => {
                toggleFilters_(widgetId);
            },
            setContainerWidth: (width: number) => {
                setContainerWidth_(widgetId, width);
            },
            setSyncing: (syncing: boolean) => {
                setSyncing_(widgetId, syncing);
            },
            enableAutoSync: (apiUrl: string, authKey: string) => {
                enableAutoSync_(widgetId, apiUrl, authKey);
            },
            disableAutoSync: () => {
                disableAutoSync_(widgetId);
            },
            markAutoSynced: () => {
                markAutoSynced_(widgetId);
            },
            reset: () => {
                reset_(widgetId);
            },
        }),
        [
            widgetId,
            setNotes_,
            upsertNote_,
            removeNote_,
            updateNoteLayoutLocal_,
            openCreateModal_,
            closeCreateModal_,
            openEditModal_,
            openViewModal_,
            closeViewModal_,
            clearSelectedNote_,
            setLabelFilter_,
            toggleFilters_,
            setContainerWidth_,
            setSyncing_,
            enableAutoSync_,
            disableAutoSync_,
            markAutoSynced_,
            reset_,
        ],
    );

    return { ...slice, ...actions };
};

export const getRegisteredWidgetIds = () => {
    const ids = Object.keys(useNotesStore.getState().notesByWidgetId);
    console.log('[NotesStore] Registered widget IDs:', ids);
    return ids;
};
