import type { Note } from '@/components/dashboard/hooks/useNotes';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface NotesWidgetState {
    isCreateModalOpen: boolean;
    isViewModalOpen: boolean;
    selectedNote: Note | null;
    editingNote: Note | null;
    viewModalTransition: 'closed' | 'opening' | 'open' | 'closing';

    labelFilter: string;
    showFilters: boolean;

    containerWidth: number;

    isSyncing: boolean;
}

interface NotesWidgetActions {
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

    reset: () => void;
}

type NotesWidgetStore = NotesWidgetState & NotesWidgetActions;

const createNotesWidgetStore = () =>
    create<NotesWidgetStore>()(
        subscribeWithSelector((set) => ({
            isCreateModalOpen: false,
            isViewModalOpen: false,
            selectedNote: null,
            editingNote: null,
            viewModalTransition: 'closed',
            labelFilter: '',
            showFilters: false,
            containerWidth: 400,
            isSyncing: false,

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

            reset: () => {
                console.log('[NotesStore] reset');
                set({
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
