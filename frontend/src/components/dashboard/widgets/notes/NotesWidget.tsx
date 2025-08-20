'use client';

import { useNotes, type Note } from '@/components/dashboard/hooks/useNotes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { NotesConfig, Widget } from '@/generated/types';
import type { NotesWidgetState } from '@/lib/stores/notes-store';
import { useNotesStore } from '@/lib/stores/notes-store';
import { useUIStore } from '@/lib/stores/ui-store';
import type { WidgetItemColors } from '@/lib/utils/widget-styling/types';
import { Filter, Plus, RefreshCw, StickyNote } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useMemo as useReactMemo, useRef } from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import { useNoteLayout } from '../../hooks/useNoteLayout';
import { BaseWidget, useWidgetContext } from '../BaseWidget';
import { NoteCard } from './NoteCard';
import { NoteModal } from './NoteModal';

interface NotesWidgetProps {
    widget: Widget;
    onEdit: (widget: Widget) => void;
    onDelete: (widgetId: string) => void;
    onStyleEdit?: (widget: Widget) => void;
}

// Stable empty layout fallback to avoid creating new objects in selectors
const EMPTY_LAYOUT: Readonly<
    Record<string, { x: number; y: number; width: number; height: number }>
> = Object.freeze({});

const EMPTY_NOTES: readonly Note[] = Object.freeze([] as Note[]);

// Sibling component that subscribes only to view-modal related state
const NoteViewModal = ({
    widgetId,
    widgetItemColors,
}: {
    widgetId: string;
    widgetItemColors: WidgetItemColors;
}) => {
    // Select only modal-related fields to avoid triggering list re-renders
    const isViewModalOpen = useNotesStore((s) => {
        const slice = (
            s.notesByWidgetId as Record<string, NotesWidgetState | undefined>
        )[widgetId];
        return slice?.isViewModalOpen ?? false;
    });
    const selectedNote = useNotesStore((s) => {
        const slice = (
            s.notesByWidgetId as Record<string, NotesWidgetState | undefined>
        )[widgetId];
        return slice?.selectedNote ?? null;
    });
    const viewModalTransition = useNotesStore((s) => {
        const slice = (
            s.notesByWidgetId as Record<string, NotesWidgetState | undefined>
        )[widgetId];
        return slice?.viewModalTransition ?? 'closed';
    });

    const closeViewModal_ = useNotesStore((s) => s.closeViewModal);
    const openEditModal_ = useNotesStore((s) => s.openEditModal);

    const closeViewModal = useReactMemo(() => {
        return () => {
            closeViewModal_(widgetId);
        };
    }, [closeViewModal_, widgetId]);
    const openEditModal = useReactMemo(() => {
        return (note: Note) => {
            openEditModal_(widgetId, note);
        };
    }, [openEditModal_, widgetId]);

    // Handle escape key for view modal only when open
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isViewModalOpen) {
                closeViewModal();
            }
        };

        if (isViewModalOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isViewModalOpen, closeViewModal]);

    if (!isViewModalOpen || !selectedNote) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-start justify-center overflow-hidden p-4 ${
                viewModalTransition === 'open'
                    ? 'backdrop-enter'
                    : viewModalTransition === 'closing'
                      ? 'backdrop-exit'
                      : ''
            }`}
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    closeViewModal();
                }
            }}
        >
            <div
                className={`flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-lg shadow-xl ${
                    viewModalTransition === 'open'
                        ? 'modal-enter'
                        : viewModalTransition === 'closing'
                          ? 'modal-exit'
                          : 'translate-y-8 scale-95 opacity-0'
                }`}
                style={{
                    backgroundColor:
                        widgetItemColors.lightBackground || '#FFFFFF',
                    borderColor: widgetItemColors.border || '#E5E7EB',
                    border: '1px solid',
                }}
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                <div
                    className={`flex flex-shrink-0 items-center justify-between border-b p-6 pb-4 ${
                        viewModalTransition === 'open'
                            ? 'modal-content-enter'
                            : ''
                    }`}
                    style={{
                        borderColor: widgetItemColors.border || '#E5E7EB',
                    }}
                >
                    <h2
                        className='mr-4 truncate text-xl font-semibold'
                        style={{
                            color: widgetItemColors.primaryText || '#1F2937',
                        }}
                    >
                        {selectedNote.title}
                    </h2>
                    <div className='flex flex-shrink-0 space-x-2'>
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={() => {
                                closeViewModal();
                                openEditModal(selectedNote);
                            }}
                        >
                            Edit
                        </Button>
                        <Button
                            variant='ghost'
                            size='sm'
                            onClick={closeViewModal}
                        >
                            Close
                        </Button>
                    </div>
                </div>
                <div
                    className={`min-h-0 flex-1 overflow-y-auto p-6 pt-4 ${
                        viewModalTransition === 'open'
                            ? 'modal-content-enter'
                            : ''
                    }`}
                >
                    <div className='space-y-4'>
                        <div className='prose prose-sm max-w-none'>
                            <MarkdownRenderer
                                content={selectedNote.content}
                                widgetColors={widgetItemColors}
                                variant='modal'
                            />
                        </div>
                        {selectedNote.labels.length > 0 && (
                            <div className='flex flex-wrap gap-2'>
                                {selectedNote.labels.map((label) => (
                                    <Badge
                                        key={label}
                                        variant='default'
                                        style={{
                                            backgroundColor: 'transparent',
                                            color:
                                                widgetItemColors.primaryText ||
                                                '#1E40AF',
                                            borderColor:
                                                widgetItemColors.accent,
                                        }}
                                    >
                                        {label}
                                    </Badge>
                                ))}
                            </div>
                        )}
                        <div
                            className='text-sm'
                            style={{
                                color:
                                    widgetItemColors.secondaryText || '#6B7280',
                            }}
                        >
                            Created:{' '}
                            {new Date(selectedNote.createdAt)
                                .toISOString()
                                .slice(0, 16)
                                .replace('T', ' ')}{' '}
                            {selectedNote.updatedAt >
                                selectedNote.createdAt && (
                                <>
                                    • Updated:{' '}
                                    {new Date(selectedNote.updatedAt)
                                        .toISOString()
                                        .slice(0, 16)
                                        .replace('T', ' ')}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const NoteViewParamWatcher = ({ widgetId }: { widgetId: string }) => {
    const searchParams = useSearchParams();
    const notes = useNotesStore((s) => {
        const slice = (
            s.notesByWidgetId as Record<string, NotesWidgetState | undefined>
        )[widgetId];
        return slice?.notes ?? EMPTY_NOTES;
    });
    const openViewModal_ = useNotesStore((s) => s.openViewModal);
    const isViewModalOpen = useNotesStore((s) => {
        const slice = (
            s.notesByWidgetId as Record<string, NotesWidgetState | undefined>
        )[widgetId];
        return slice?.isViewModalOpen ?? false;
    });
    const selectedNoteId = useNotesStore((s) => {
        const slice = (
            s.notesByWidgetId as Record<string, NotesWidgetState | undefined>
        )[widgetId];
        return slice?.selectedNote?.id ?? null;
    });

    useEffect(() => {
        const noteId = searchParams.get('noteId');
        if (!noteId) return;
        const note = notes.find((n) => n.id === noteId);
        if (!note) return;
        // Guard: avoid redundant open if already open for the same note
        if (isViewModalOpen && selectedNoteId === note.id) return;
        openViewModal_(widgetId, note);
    }, [
        searchParams,
        notes,
        openViewModal_,
        widgetId,
        isViewModalOpen,
        selectedNoteId,
    ]);

    return null;
};

const NotesContent = () => {
    const { widget, styling } = useWidgetContext();
    const config = widget.config as NotesConfig | null;
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetItemColors = styling.itemColors;
    const notify = useUIStore((s) => s.notify);

    const isCreateModalOpen = useNotesStore((s) => {
        const slice = (
            s.notesByWidgetId as Record<string, NotesWidgetState | undefined>
        )[widget.id];
        return slice?.isCreateModalOpen ?? false;
    });
    const editingNote = useNotesStore((s) => {
        const slice = (
            s.notesByWidgetId as Record<string, NotesWidgetState | undefined>
        )[widget.id];
        return slice?.editingNote ?? null;
    });
    const labelFilter = useNotesStore((s) => {
        const slice = (
            s.notesByWidgetId as Record<string, NotesWidgetState | undefined>
        )[widget.id];
        return slice?.labelFilter ?? '';
    });
    const showFilters = useNotesStore((s) => {
        const slice = (
            s.notesByWidgetId as Record<string, NotesWidgetState | undefined>
        )[widget.id];
        return slice?.showFilters ?? false;
    });
    const containerWidth = useNotesStore((s) => {
        const slice = (
            s.notesByWidgetId as Record<string, NotesWidgetState | undefined>
        )[widget.id];
        return slice?.containerWidth ?? 400;
    });
    const isSyncing = useNotesStore((s) => {
        const slice = (
            s.notesByWidgetId as Record<string, NotesWidgetState | undefined>
        )[widget.id];
        return slice?.isSyncing ?? false;
    });

    const openCreateModal_ = useNotesStore((s) => s.openCreateModal);
    const closeCreateModal_ = useNotesStore((s) => s.closeCreateModal);
    const openEditModal_ = useNotesStore((s) => s.openEditModal);
    const openViewModal_ = useNotesStore((s) => s.openViewModal);
    const clearSelectedNote_ = useNotesStore((s) => s.clearSelectedNote);
    const setLabelFilter_ = useNotesStore((s) => s.setLabelFilter);
    const toggleFilters_ = useNotesStore((s) => s.toggleFilters);
    const setContainerWidth_ = useNotesStore((s) => s.setContainerWidth);
    const setSyncing_ = useNotesStore((s) => s.setSyncing);

    const openCreateModal = useReactMemo(() => {
        return () => {
            openCreateModal_(widget.id);
        };
    }, [openCreateModal_, widget.id]);
    const closeCreateModal = useReactMemo(() => {
        return () => {
            closeCreateModal_(widget.id);
        };
    }, [closeCreateModal_, widget.id]);
    const openEditModal = useReactMemo(() => {
        return (note: Note) => {
            openEditModal_(widget.id, note);
        };
    }, [openEditModal_, widget.id]);
    const openViewModal = useReactMemo(() => {
        return (note: Note) => {
            openViewModal_(widget.id, note);
        };
    }, [openViewModal_, widget.id]);
    const clearSelectedNote = useReactMemo(() => {
        return () => {
            clearSelectedNote_(widget.id);
        };
    }, [clearSelectedNote_, widget.id]);
    const setLabelFilter = useReactMemo(() => {
        return (filter: string) => {
            setLabelFilter_(widget.id, filter);
        };
    }, [setLabelFilter_, widget.id]);
    const toggleFilters = useReactMemo(() => {
        return () => {
            toggleFilters_(widget.id);
        };
    }, [toggleFilters_, widget.id]);
    const setContainerWidth = useReactMemo(() => {
        return (w: number) => {
            setContainerWidth_(widget.id, w);
        };
    }, [setContainerWidth_, widget.id]);
    const setSyncing = useReactMemo(() => {
        return (v: boolean) => {
            setSyncing_(widget.id, v);
        };
    }, [setSyncing_, widget.id]);

    const {
        createNote,
        updateNote,
        updateNoteLayout,
        deleteNote,
        getFilteredNotes,
        syncObsidianVault,
        enableAutoSync,
        disableAutoSync,
        isAutoSyncEnabled,
        loading,
        error,
    } = useNotes(widget.id);

    const filteredNotes = useMemo(() => {
        const visibleLabels = config?.visibleLabels as string[] | undefined;
        return getFilteredNotes(widget.id, visibleLabels, labelFilter);
    }, [getFilteredNotes, widget.id, config?.visibleLabels, labelFilter]);

    const gridColumns = config?.gridColumns ?? 3;
    const showGrid = config?.showGrid ?? true;

    const { handleLayoutChange } = useNoteLayout({
        notes: filteredNotes,
        gridColumns,
        onUpdateNoteLayout: (noteId, layout) => {
            void updateNoteLayout(noteId, layout);
        },
    });

    // Handle auto-sync configuration
    useEffect(() => {
        if (
            config?.enableObsidianSync &&
            config.obsidianApiUrl &&
            config.obsidianAuthKey
        ) {
            if (!isAutoSyncEnabled) {
                enableAutoSync(config.obsidianApiUrl, config.obsidianAuthKey);
            }
        } else {
            if (isAutoSyncEnabled) {
                disableAutoSync();
            }
        }
    }, [
        config?.enableObsidianSync,
        config?.obsidianApiUrl,
        config?.obsidianAuthKey,
        isAutoSyncEnabled,
        enableAutoSync,
        disableAutoSync,
    ]);

    useEffect(() => {
        if (containerRef.current) {
            const width = containerRef.current.offsetWidth - 16;
            setContainerWidth(width);
        }
    }, [filteredNotes.length, showGrid, setContainerWidth]);

    // Helper function to get Obsidian config
    const getObsidianConfig = () => {
        return config?.enableObsidianSync &&
            config.obsidianApiUrl &&
            config.obsidianAuthKey
            ? {
                  apiUrl: config.obsidianApiUrl,
                  authKey: config.obsidianAuthKey,
              }
            : undefined;
    };

    // Note CRUD handlers
    const handleCreateNote = async (
        noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>,
    ) => {
        try {
            await createNote(noteData, getObsidianConfig());
            notify({ type: 'success', message: 'Note created successfully' });
        } catch (error: unknown) {
            console.error('Failed to create note:', error);
            notify({ type: 'error', message: 'Failed to create note' });
        }
    };

    const handleUpdateNote = async (
        noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>,
        noteId: string,
    ) => {
        try {
            await updateNote(noteId, noteData, getObsidianConfig());
            notify({ type: 'success', message: 'Note updated successfully' });
        } catch (error: unknown) {
            console.error('Failed to update note:', error);
            notify({ type: 'error', message: 'Failed to update note' });
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        try {
            await deleteNote(noteId, getObsidianConfig());
            notify({ type: 'success', message: 'Note deleted successfully' });
        } catch (error: unknown) {
            console.error('Failed to delete note:', error);
            notify({ type: 'error', message: 'Failed to delete note' });
        }
    };

    const handleNoteModalSave = (
        noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>,
        existingNote?: Note | null,
    ) => {
        // Use editingNote if existingNote is not provided
        const noteToUpdate = existingNote ?? editingNote;

        if (noteToUpdate) {
            void handleUpdateNote(noteData, noteToUpdate.id);
        } else {
            void handleCreateNote(noteData);
        }

        clearSelectedNote();
    };

    const handleObsidianSync = async () => {
        const obsidianConfig = getObsidianConfig();
        if (!obsidianConfig) {
            console.warn('Obsidian API URL and Auth Key are required for sync');
            notify({
                type: 'error',
                message: 'Obsidian API URL and Auth Key are required for sync',
            });
            return;
        }

        setSyncing(true);
        try {
            await syncObsidianVault(
                obsidianConfig.apiUrl,
                obsidianConfig.authKey,
            );
            console.log('Obsidian vault synced successfully');
            notify({
                type: 'success',
                message: 'Obsidian vault synced successfully',
            });
        } catch (error) {
            console.error('Failed to sync Obsidian vault:', error);
            notify({ type: 'error', message: 'Failed to sync Obsidian vault' });
        } finally {
            setSyncing(false);
        }
    };

    // Event handlers using store actions
    const handleEditNote = (note: Note) => {
        openEditModal(note);
    };

    const handleViewNote = (note: Note) => {
        openViewModal(note);
    };

    const handleDeleteNoteWrapper = (noteId: string) => {
        void handleDeleteNote(noteId);
    };

    // Subscribe only to layout map; default to empty record when slice is missing
    const layoutMap = useNotesStore((s) => {
        const slice = (
            s.notesByWidgetId as Record<string, NotesWidgetState | undefined>
        )[widget.id];
        return slice?.layout ?? EMPTY_LAYOUT;
    });
    const layout = filteredNotes.map((note, index) => {
        const l:
            | { x: number; y: number; width: number; height: number }
            | undefined = layoutMap[note.id];
        const x = l === undefined ? (note.x ?? index % gridColumns) : l.x;
        const y =
            l === undefined ? (note.y ?? Math.floor(index / gridColumns)) : l.y;
        const w = l === undefined ? (note.width ?? 1) : l.width;
        const h = l === undefined ? (note.height ?? 4) : l.height;
        return { i: note.id, x, y, w, h } as GridLayout.Layout;
    });

    if (loading) {
        return (
            <div className='flex h-full items-center justify-center'>
                <div className='text-center'>
                    <StickyNote className='mx-auto h-8 w-8 animate-pulse text-gray-400' />
                    <p className='mt-2 text-sm text-gray-500'>
                        Loading notes...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='flex h-full items-center justify-center'>
                <div className='text-center'>
                    <StickyNote className='mx-auto h-8 w-8 text-red-400' />
                    <p className='mt-2 text-sm text-red-500'>
                        Error loading notes: {error.message}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className='flex h-full min-h-0 flex-col'>
            <div className='mb-4 flex flex-shrink-0 items-center justify-between'>
                <div className='flex items-center space-x-3'>
                    <BaseWidget.Icon icon={StickyNote} />
                    <BaseWidget.Title>{widget.title}</BaseWidget.Title>
                </div>
                <BaseWidget.CustomActions>
                    <div className='flex items-center space-x-1'>
                        {config?.enableObsidianSync &&
                            config.obsidianApiUrl &&
                            config.obsidianAuthKey && (
                                <Button
                                    variant='outline'
                                    size='icon'
                                    onClick={() => {
                                        void handleObsidianSync();
                                    }}
                                    className='bg-background/70 supports-[backdrop-filter]:bg-background/60 h-8 w-8 backdrop-blur'
                                    disabled={isSyncing}
                                    title='Sync with Obsidian'
                                >
                                    <RefreshCw
                                        className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`}
                                    />
                                </Button>
                            )}
                        <Button
                            variant='outline'
                            size='icon'
                            onClick={toggleFilters}
                            className='bg-background/70 supports-[backdrop-filter]:bg-background/60 h-8 w-8 backdrop-blur'
                        >
                            <Filter className='h-4 w-4' />
                        </Button>
                        <Button
                            variant='outline'
                            size='icon'
                            onClick={openCreateModal}
                            className='bg-background/70 supports-[backdrop-filter]:bg-background/60 h-8 w-8 backdrop-blur'
                        >
                            <Plus className='h-4 w-4' />
                        </Button>
                    </div>
                </BaseWidget.CustomActions>
            </div>

            {showFilters && (
                <div className='mb-3 flex-shrink-0'>
                    <Input
                        placeholder='Filter notes by title, content, or labels...'
                        value={labelFilter}
                        onChange={(e) => {
                            setLabelFilter(e.target.value);
                        }}
                        className='text-sm'
                    />
                </div>
            )}

            <div className='min-h-0 flex-1 overflow-y-auto'>
                {filteredNotes.length === 0 ? (
                    <div className='flex h-full items-center justify-center text-center'>
                        <div>
                            <StickyNote className='text-muted-foreground mx-auto h-12 w-12' />
                            <p className='text-muted-foreground mt-2 text-sm'>
                                No notes yet. Click the + button to create one!
                            </p>
                        </div>
                    </div>
                ) : showGrid ? (
                    <div
                        ref={containerRef}
                        className='notes-grid-container h-full w-full overflow-y-auto p-1'
                    >
                        <GridLayout
                            className='layout'
                            layout={layout}
                            cols={gridColumns}
                            rowHeight={80}
                            width={containerWidth}
                            margin={[10, 10]}
                            containerPadding={[2, 2]}
                            isDraggable={true}
                            isResizable={true}
                            useCSSTransforms={true}
                            onLayoutChange={handleLayoutChange}
                            draggableHandle='.note-drag-handle'
                            resizeHandles={['se']}
                        >
                            {layout.map((layoutItem) => {
                                const note = filteredNotes.find(
                                    (n) => n.id === layoutItem.i,
                                );
                                if (!note) return null;
                                return (
                                    <div
                                        key={note.id}
                                        className='h-full w-full'
                                    >
                                        <NoteCard
                                            note={note}
                                            onEdit={handleEditNote}
                                            onDelete={handleDeleteNoteWrapper}
                                            onOpen={handleViewNote}
                                            isDraggable={true}
                                            className='note-card'
                                            widgetColors={widgetItemColors}
                                        />
                                    </div>
                                );
                            })}
                        </GridLayout>
                    </div>
                ) : (
                    <div className='h-full space-y-3.5 overflow-y-auto px-1'>
                        {filteredNotes.map((note) => (
                            <NoteCard
                                key={note.id}
                                note={note}
                                onEdit={handleEditNote}
                                onDelete={handleDeleteNoteWrapper}
                                onOpen={handleViewNote}
                                widgetColors={widgetItemColors}
                            />
                        ))}
                    </div>
                )}
            </div>

            <NoteModal
                note={editingNote}
                widgetId={widget.id}
                widgetColors={widgetItemColors}
                maxLength={config?.maxLength ?? 500}
                isOpen={isCreateModalOpen}
                onClose={() => {
                    closeCreateModal();
                    clearSelectedNote();
                }}
                onSave={handleNoteModalSave}
            />
            <NoteViewParamWatcher widgetId={widget.id} />
            <NoteViewModal
                widgetId={widget.id}
                widgetItemColors={widgetItemColors}
            />
        </div>
    );
};

export const NotesWidget = ({
    widget,
    onEdit,
    onDelete,
    onStyleEdit,
}: NotesWidgetProps) => {
    const baseClasses =
        'group relative h-full overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-200 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl dark:border-slate-700 dark:from-yellow-900/20 dark:via-yellow-800/30 dark:to-yellow-700/40';

    return (
        <BaseWidget
            widget={widget}
            baseClasses={baseClasses}
            onEdit={onEdit}
            onDelete={onDelete}
            onStyleEdit={onStyleEdit}
        >
            <BaseWidget.Content>
                <NotesContent />
            </BaseWidget.Content>
        </BaseWidget>
    );
};
