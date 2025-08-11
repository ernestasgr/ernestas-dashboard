import type { Note } from '@/components/dashboard/hooks/useNotes';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface LayoutEntry {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface NotesWidgetState {
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

interface NotesWidgetActions {
    setNotes: (notes: Note[]) => void;
    upsertNote: (note: Note) => void;
    removeNote: (id: string) => void;
    updateNoteLayoutLocal: (id: string, layout: LayoutEntry) => void;
    openCreateModal: () => void;
    closeCreateModal: () => void;
    openEditModal: (note: Note) => void;
    openViewModal: (note: Note) => void;
    closeViewModal: () => void;
    clearSelectedNote: () => void;

    setLabelFilter: (filter: string) => void;
    toggleFilters: () => void;

    setContainerWidth: (width: number) => void;

    setSyncing: (syncing: boolean) => void;

    enableAutoSync: (apiUrl: string, authKey: string) => void;
    disableAutoSync: () => void;
    markAutoSynced: () => void;

    reset: () => void;
}

type NotesWidgetStore = NotesWidgetState & NotesWidgetActions;

const createNotesWidgetStore = () =>
    create<NotesWidgetStore>()(
        subscribeWithSelector((set) => ({
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

            setNotes: (notes: Note[]) => {
                set((state) => {
                    const nextLayout = { ...state.layout };
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
                    return { notes, layout: nextLayout };
                });
            },

            upsertNote: (note: Note) => {
                set((state) => {
                    const idx = state.notes.findIndex((n) => n.id === note.id);
                    const notes = [...state.notes];
                    if (idx === -1) notes.push(note);
                    else notes[idx] = note;
                    const layout = { ...state.layout };
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
                        };
                    }
                    return { notes, layout };
                });
            },

            removeNote: (id: string) => {
                set((state) => {
                    const notes = state.notes.filter((n) => n.id !== id);
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { [id]: _, ...rest } = state.layout;
                    return { notes, layout: rest };
                });
            },

            updateNoteLayoutLocal: (id, layout) => {
                set((state) => ({ layout: { ...state.layout, [id]: layout } }));
            },

            openCreateModal: () => {
                console.log('[NotesStore] openCreateModal');
                set({
                    isCreateModalOpen: true,
                    selectedNote: null,
                    editingNote: null,
                });
            },

            closeCreateModal: () => {
                console.log('[NotesStore] closeCreateModal');
                set({
                    isCreateModalOpen: false,
                    editingNote: null,
                });
            },

            openEditModal: (note: Note) => {
                console.log('[NotesStore] openEditModal', note);
                set({
                    isCreateModalOpen: true,
                    selectedNote: note,
                    editingNote: note,
                });
            },

            openViewModal: (note: Note) => {
                console.log('[NotesStore] openViewModal', note);
                set({
                    selectedNote: note,
                    viewModalTransition: 'opening',
                    isViewModalOpen: true,
                });

                const url = new URL(window.location.href);
                url.searchParams.set('noteId', note.id);
                window.history.pushState({}, '', url.toString());

                requestAnimationFrame(() => {
                    setTimeout(() => {
                        set({ viewModalTransition: 'open' });
                        console.log(
                            '[NotesStore] viewModalTransition set to open',
                        );
                    }, 10);
                });
            },

            closeViewModal: () => {
                console.log('[NotesStore] closeViewModal');
                set({ viewModalTransition: 'closing' });

                setTimeout(() => {
                    set({
                        isViewModalOpen: false,
                        selectedNote: null,
                        viewModalTransition: 'closed',
                    });
                    console.log('[NotesStore] viewModal closed');
                }, 250);

                const url = new URL(window.location.href);
                url.searchParams.delete('noteId');
                window.history.pushState({}, '', url.toString());
            },

            clearSelectedNote: () => {
                console.log('[NotesStore] clearSelectedNote');
                set({ selectedNote: null });
            },

            setLabelFilter: (filter: string) => {
                console.log('[NotesStore] setLabelFilter', filter);
                set({ labelFilter: filter });
            },

            toggleFilters: () => {
                console.log('[NotesStore] toggleFilters');
                set((state) => ({
                    showFilters: !state.showFilters,
                }));
            },

            setContainerWidth: (width: number) => {
                console.log('[NotesStore] setContainerWidth', width);
                set({ containerWidth: width });
            },

            setSyncing: (syncing: boolean) => {
                console.log('[NotesStore] setSyncing', syncing);
                set({ isSyncing: syncing });
            },

            enableAutoSync: (apiUrl, authKey) => {
                console.log('[NotesStore] enableAutoSync');
                set({
                    autoSyncConfig: { apiUrl, authKey },
                    hasAutoSynced: false,
                });
            },
            disableAutoSync: () => {
                console.log('[NotesStore] disableAutoSync');
                set({ autoSyncConfig: null, hasAutoSynced: false });
            },
            markAutoSynced: () => {
                set({ hasAutoSynced: true });
            },

            reset: () => {
                console.log('[NotesStore] reset');
                set({
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
                });
            },
        })),
    );

type StoreRegistry = Record<string, ReturnType<typeof createNotesWidgetStore>>;

const storeRegistry: StoreRegistry = {};

export const useNotesWidgetStore = (widgetId: string) => {
    if (!(widgetId in storeRegistry)) {
        console.log(`[NotesStore] Creating store for widgetId: ${widgetId}`);
        storeRegistry[widgetId] = createNotesWidgetStore();
    }
    return storeRegistry[widgetId]();
};

export const cleanupNotesWidgetStore = (widgetId: string) => {
    if (widgetId in storeRegistry) {
        console.log(`[NotesStore] Cleaning up store for widgetId: ${widgetId}`);
        storeRegistry[widgetId].getState().reset();
        Reflect.deleteProperty(storeRegistry, widgetId);
    }
};

export const getRegisteredWidgetIds = () => {
    const ids = Object.keys(storeRegistry);
    console.log('[NotesStore] Registered widget IDs:', ids);
    return ids;
};

// Testing/utility: access the underlying zustand store instance (non-hook)
export const getNotesWidgetStoreInstance = (widgetId: string) => {
    if (!(widgetId in storeRegistry)) {
        storeRegistry[widgetId] = createNotesWidgetStore();
    }
    return storeRegistry[widgetId];
};
