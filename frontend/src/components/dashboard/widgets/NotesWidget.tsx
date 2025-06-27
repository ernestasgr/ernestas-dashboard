'use client';

import { useNotes, type Note } from '@/components/dashboard/hooks/useNotes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { NotesConfig, Widget } from '@/generated/graphql';
import {
    getWidgetClasses,
    getWidgetIconStyles,
    getWidgetItemColors,
    getWidgetStyles,
} from '@/lib/utils/widgetStyles';
import {
    Filter,
    GripVertical,
    Plus,
    RefreshCw,
    StickyNote,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import { toast } from 'sonner';
import { WidgetActions } from '../WidgetActions';
import { useNoteLayout } from '../hooks/useNoteLayout';
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

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [viewNoteModal, setViewNoteModal] = useState(false);
    const [viewNoteModalTransition, setViewNoteModalTransition] = useState<
        'closed' | 'opening' | 'open' | 'closing'
    >('closed');
    const [labelFilter, setLabelFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [containerWidth, setContainerWidth] = useState(400);
    const [isSyncing, setIsSyncing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

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

    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                const width = containerRef.current.offsetWidth - 16;
                setContainerWidth(Math.max(width, 300));
            }
        };

        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => {
            window.removeEventListener('resize', updateWidth);
        };
    }, []);

    // Recalculate width when notes change to ensure proper grid sizing
    useEffect(() => {
        if (containerRef.current) {
            const width = containerRef.current.offsetWidth - 16;
            setContainerWidth(Math.max(width, 300));
        }
    }, [filteredNotes.length, showGrid]);

    const baseClasses =
        'group relative h-full overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-200 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl dark:border-slate-700 dark:from-yellow-900/20 dark:via-yellow-800/30 dark:to-yellow-700/40';
    const dynamicStyles = getWidgetStyles(widget);
    const { foregroundStyles, backgroundStyles } = getWidgetIconStyles(widget);
    const widgetItemColors = getWidgetItemColors(widget);
    const finalClasses = getWidgetClasses(widget, baseClasses);

    useEffect(() => {
        const noteId = searchParams.get('noteId');
        if (noteId) {
            const note = getNoteById(noteId);
            if (note) {
                setSelectedNote(note);
                setViewNoteModalTransition('opening');
                setViewNoteModal(true);

                requestAnimationFrame(() => {
                    setTimeout(() => {
                        setViewNoteModalTransition('open');
                    }, 10);
                });
            }
        }
    }, [searchParams, getNoteById]);

    // Enable auto-sync when config is available
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
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && viewNoteModal) {
                closeViewModal();
            }
        };

        if (viewNoteModal) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [viewNoteModal]);

    const handleCreateNote = (
        noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>,
    ) => {
        const obsidianConfig =
            config?.enableObsidianSync &&
            config.obsidianApiUrl &&
            config.obsidianAuthKey
                ? {
                      apiUrl: config.obsidianApiUrl,
                      authKey: config.obsidianAuthKey,
                  }
                : undefined;

        void createNote(noteData, obsidianConfig)
            .then(() => {
                toast.success('Note created successfully');
            })
            .catch((error: unknown) => {
                console.error('Failed to create note:', error);
                toast.error('Failed to create note');
            });
    };

    const handleUpdateNote = (
        noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>,
    ) => {
        if (!selectedNote) return;

        const obsidianConfig =
            config?.enableObsidianSync &&
            config.obsidianApiUrl &&
            config.obsidianAuthKey
                ? {
                      apiUrl: config.obsidianApiUrl,
                      authKey: config.obsidianAuthKey,
                  }
                : undefined;

        void updateNote(selectedNote.id, noteData, obsidianConfig)
            .then(() => {
                toast.success('Note updated successfully');
            })
            .catch((error: unknown) => {
                console.error('Failed to update note:', error);
                toast.error('Failed to update note');
            });
    };

    const handleDeleteNote = (noteId: string) => {
        const obsidianConfig =
            config?.enableObsidianSync &&
            config.obsidianApiUrl &&
            config.obsidianAuthKey
                ? {
                      apiUrl: config.obsidianApiUrl,
                      authKey: config.obsidianAuthKey,
                  }
                : undefined;

        void deleteNote(noteId, obsidianConfig)
            .then(() => {
                toast.success('Note deleted successfully');
            })
            .catch((error: unknown) => {
                console.error('Failed to delete note:', error);
                toast.error('Failed to delete note');
            });
    };

    const handleEditNote = (note: Note) => {
        setSelectedNote(note);
        setModalOpen(true);
    };

    const handleViewNote = (note: Note) => {
        setSelectedNote(note);
        setViewNoteModalTransition('opening');
        setViewNoteModal(true);

        requestAnimationFrame(() => {
            setTimeout(() => {
                setViewNoteModalTransition('open');
            }, 10);
        });

        const url = new URL(window.location.href);
        url.searchParams.set('noteId', note.id);
        window.history.pushState({}, '', url.toString());
    };

    const closeViewModal = () => {
        setViewNoteModalTransition('closing');

        setTimeout(() => {
            setViewNoteModal(false);
            setSelectedNote(null);
            setViewNoteModalTransition('closed');
        }, 250);

        const url = new URL(window.location.href);
        url.searchParams.delete('noteId');
        window.history.pushState({}, '', url.toString());
    };

    const handleObsidianSync = async () => {
        if (!config?.obsidianApiUrl || !config.obsidianAuthKey) {
            console.warn('Obsidian API URL and Auth Key are required for sync');
            toast.error('Obsidian API URL and Auth Key are required for sync');
            return;
        }

        setIsSyncing(true);
        try {
            await syncObsidianVault(
                config.obsidianApiUrl,
                config.obsidianAuthKey,
            );
            console.log('Obsidian vault synced successfully');
            toast.success('Obsidian vault synced successfully');
        } catch (error) {
            console.error('Failed to sync Obsidian vault:', error);
            toast.error('Failed to sync Obsidian vault');
        } finally {
            setIsSyncing(false);
        }
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
                    </div>{' '}
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
                            onClick={() => {
                                setShowFilters(!showFilters);
                            }}
                            className='h-8 w-8 p-0'
                        >
                            <Filter className='h-4 w-4' />
                        </Button>
                        <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                                setSelectedNote(null);
                                setModalOpen(true);
                            }}
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
                                autoSize={true}
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
                                                onDelete={handleDeleteNote}
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
                                    onDelete={handleDeleteNote}
                                    onOpen={handleViewNote}
                                    widgetColors={widgetItemColors}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <NoteModal
                note={selectedNote}
                widgetId={widget.id}
                maxLength={config?.maxLength ?? 500}
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setSelectedNote(null);
                }}
                onSave={selectedNote ? handleUpdateNote : handleCreateNote}
            />
            {viewNoteModal && selectedNote && (
                <div
                    className={`fixed inset-0 z-50 flex items-start justify-center overflow-hidden p-4 ${
                        viewNoteModalTransition === 'open'
                            ? 'backdrop-enter'
                            : viewNoteModalTransition === 'closing'
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
                            viewNoteModalTransition === 'open'
                                ? 'modal-enter'
                                : viewNoteModalTransition === 'closing'
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
                                viewNoteModalTransition === 'open'
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
                                        closeViewModal();
                                        handleEditNote(selectedNote);
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
                                viewNoteModalTransition === 'open'
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
                                    {selectedNote.createdAt.toLocaleDateString()}
                                    {selectedNote.updatedAt >
                                        selectedNote.createdAt && (
                                        <>
                                            • Updated:{' '}
                                            {selectedNote.updatedAt.toLocaleDateString()}
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
