'use client';

import { useNotes, type Note } from '@/components/dashboard/hooks/useNotes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { NotesConfig, Widget } from '@/generated/types';
import { useNotesWidgetStore } from '@/lib/stores/notes-store';
import {
    getWidgetClasses,
    getWidgetIconStyles,
    getWidgetItemColors,
    getWidgetStyles,
} from '@/lib/utils/widget-styles';
import {
    Filter,
    GripVertical,
    Plus,
    RefreshCw,
    StickyNote,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef } from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import { toast } from 'sonner';
import { useNoteLayout } from '../../hooks/useNoteLayout';
import { WidgetActions } from '../WidgetActions';
import { NoteCard } from './NoteCard';
import { NoteModal } from './NoteModal';

interface NotesWidgetProps {
    widget: Widget;
    onEdit: (widget: Widget) => void;
    onDelete: (widgetId: string) => void;
    onStyleEdit?: (widget: Widget) => void;
}

export const NotesWidget = ({
    widget,
    onEdit,
    onDelete,
    onStyleEdit,
}: NotesWidgetProps) => {
    const config = widget.config as NotesConfig | null;
    const searchParams = useSearchParams();
    const containerRef = useRef<HTMLDivElement>(null);

    const {
        isCreateModalOpen,
        isViewModalOpen,
        selectedNote,
        editingNote,
        viewModalTransition,
        labelFilter,
        showFilters,
        containerWidth,
        isSyncing,
        openCreateModal,
        closeCreateModal,
        openEditModal,
        openViewModal,
        closeViewModal,
        clearSelectedNote,
        setLabelFilter,
        toggleFilters,
        setContainerWidth,
        setSyncing,
    } = useNotesWidgetStore(widget.id);

    const {
        createNote,
        updateNote,
        updateNoteLayout,
        deleteNote,
        getNoteById,
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

    const { handleLayoutChange, getCurrentLayout } = useNoteLayout({
        notes: filteredNotes,
        gridColumns,
        onUpdateNoteLayout: (noteId, layout) => {
            void updateNoteLayout(noteId, layout);
        },
    });

    const baseClasses =
        'group relative h-full overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-200 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl dark:border-slate-700 dark:from-yellow-900/20 dark:via-yellow-800/30 dark:to-yellow-700/40';
    const dynamicStyles = getWidgetStyles(widget);
    const { foregroundStyles, backgroundStyles } = getWidgetIconStyles(widget);
    const widgetItemColors = getWidgetItemColors(widget);
    const finalClasses = getWidgetClasses(widget, baseClasses);

    // Handle URL-based note opening
    useEffect(() => {
        const noteId = searchParams.get('noteId');
        if (noteId) {
            const note = getNoteById(noteId);
            if (note) {
                openViewModal(note);
            }
        }
    }, [searchParams, getNoteById, openViewModal]);

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

    // Handle escape key for view modal
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

    // Update container width when notes change
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
            toast.success('Note created successfully');
        } catch (error: unknown) {
            console.error('Failed to create note:', error);
            toast.error('Failed to create note');
        }
    };

    const handleUpdateNote = async (
        noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>,
        noteId: string,
    ) => {
        try {
            await updateNote(noteId, noteData, getObsidianConfig());
            toast.success('Note updated successfully');
        } catch (error: unknown) {
            console.error('Failed to update note:', error);
            toast.error('Failed to update note');
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        try {
            await deleteNote(noteId, getObsidianConfig());
            toast.success('Note deleted successfully');
        } catch (error: unknown) {
            console.error('Failed to delete note:', error);
            toast.error('Failed to delete note');
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
            toast.error('Obsidian API URL and Auth Key are required for sync');
            return;
        }

        setSyncing(true);
        try {
            await syncObsidianVault(
                obsidianConfig.apiUrl,
                obsidianConfig.authKey,
            );
            console.log('Obsidian vault synced successfully');
            toast.success('Obsidian vault synced successfully');
        } catch (error) {
            console.error('Failed to sync Obsidian vault:', error);
            toast.error('Failed to sync Obsidian vault');
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

    const handleCloseViewModal = () => {
        closeViewModal();
    };

    const handleDeleteNoteWrapper = (noteId: string) => {
        void handleDeleteNote(noteId);
    };

    const layout = getCurrentLayout();

    if (loading) {
        return (
            <div className={finalClasses} style={dynamicStyles}>
                <div className='flex h-full items-center justify-center'>
                    <div className='text-center'>
                        <StickyNote className='mx-auto h-8 w-8 animate-pulse text-gray-400' />
                        <p className='mt-2 text-sm text-gray-500'>
                            Loading notes...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={finalClasses} style={dynamicStyles}>
                <div className='flex h-full items-center justify-center'>
                    <div className='text-center'>
                        <StickyNote className='mx-auto h-8 w-8 text-red-400' />
                        <p className='mt-2 text-sm text-red-500'>
                            Error loading notes: {error.message}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={finalClasses} style={dynamicStyles}>
            <WidgetActions
                widget={widget}
                onEdit={onEdit}
                onDelete={onDelete}
                onStyleEdit={onStyleEdit}
            />
            <div className='drag-handle absolute top-2 right-2 cursor-move opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
                <GripVertical className='h-5 w-5' style={foregroundStyles} />
            </div>
            <div className='flex h-full flex-col p-4'>
                {/* Header */}
                <div className='mb-4 flex items-center justify-between'>
                    <div className='flex items-center space-x-3'>
                        <div
                            className='flex items-center justify-center rounded-full p-2'
                            style={backgroundStyles}
                        >
                            <StickyNote
                                className='h-5 w-5'
                                style={{
                                    ...foregroundStyles,
                                    ...(widget.textColor
                                        ? { color: widget.textColor }
                                        : {}),
                                }}
                            />
                        </div>
                        <h3
                            className='text-lg font-semibold'
                            style={
                                widget.textColor
                                    ? { color: widget.textColor }
                                    : {}
                            }
                        >
                            {widget.title}
                        </h3>
                    </div>
                    <div className='flex items-center space-x-1'>
                        {config?.enableObsidianSync &&
                            config.obsidianApiUrl &&
                            config.obsidianAuthKey && (
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={() => {
                                        void handleObsidianSync();
                                    }}
                                    className='h-8 w-8 p-0'
                                    disabled={isSyncing}
                                    title='Sync with Obsidian'
                                >
                                    <RefreshCw
                                        className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`}
                                    />
                                </Button>
                            )}
                        <Button
                            variant='ghost'
                            size='sm'
                            onClick={toggleFilters}
                            className='h-8 w-8 p-0'
                        >
                            <Filter className='h-4 w-4' />
                        </Button>
                        <Button
                            variant='ghost'
                            size='sm'
                            onClick={openCreateModal}
                            className='h-8 w-8 p-0'
                        >
                            <Plus className='h-4 w-4' />
                        </Button>
                    </div>
                </div>

                {showFilters && (
                    <div className='mb-3'>
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

                <div className='flex-1 overflow-y-auto'>
                    {filteredNotes.length === 0 ? (
                        <div className='flex h-full items-center justify-center text-center'>
                            <div>
                                <StickyNote className='mx-auto h-12 w-12 text-gray-400' />
                                <p className='mt-2 text-sm text-gray-500'>
                                    No notes yet. Click the + button to create
                                    one!
                                </p>
                            </div>
                        </div>
                    ) : showGrid ? (
                        <div
                            ref={containerRef}
                            className='notes-grid-container h-full w-full p-1'
                        >
                            <GridLayout
                                className='layout'
                                layout={layout}
                                cols={gridColumns}
                                rowHeight={80}
                                width={containerWidth}
                                margin={[8, 8]}
                                containerPadding={[0, 0]}
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
                                                onDelete={
                                                    handleDeleteNoteWrapper
                                                }
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
                        <div className='space-y-3'>
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

            {isViewModalOpen && selectedNote && (
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
                            handleCloseViewModal();
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
                                borderColor:
                                    widgetItemColors.border || '#E5E7EB',
                            }}
                        >
                            <h2
                                className='mr-4 truncate text-xl font-semibold'
                                style={{
                                    color:
                                        widgetItemColors.primaryText ||
                                        '#1F2937',
                                }}
                            >
                                {selectedNote.title}
                            </h2>
                            <div className='flex flex-shrink-0 space-x-2'>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() => {
                                        handleCloseViewModal();
                                        handleEditNote(selectedNote);
                                    }}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={handleCloseViewModal}
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
                                                    backgroundColor:
                                                        'transparent',
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
                                            widgetItemColors.secondaryText ||
                                            '#6B7280',
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
            )}
        </div>
    );
};
