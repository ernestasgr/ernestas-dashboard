import { useCopyToClipboard } from '@/components/dashboard/hooks/useCopyToClipboard';
import type { Note } from '@/components/dashboard/hooks/useNotes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { WidgetItemColors } from '@/lib/utils/widget-styling/types';
import { Edit, ExternalLink, GripVertical, Trash2 } from 'lucide-react';

interface NoteCardProps {
    note: Note;
    onEdit: (note: Note) => void;
    onDelete: (noteId: string) => void;
    onOpen: (note: Note) => void;
    isDraggable?: boolean;
    className?: string;
    widgetColors?: WidgetItemColors;
}

export const NoteCard = ({
    note,
    onEdit,
    onDelete,
    onOpen,
    isDraggable = false,
    className = '',
    widgetColors,
}: NoteCardProps) => {
    const { copyToClipboard } = useCopyToClipboard({
        successMessage: 'Note link copied to clipboard',
        errorMessage: 'Failed to copy note link',
    });

    const handleShare = () => {
        const noteUrl = `${window.location.origin}${window.location.pathname}?noteId=${note.id}`;
        void copyToClipboard(noteUrl);
    };

    const cardStyles = widgetColors
        ? {
              backgroundColor: widgetColors.lightBackground,
              borderColor: widgetColors.border,
              color: widgetColors.primaryText,
          }
        : {
              backgroundColor: '#FFFFFF',
              borderColor: '#E5E7EB',
              color: '#1F2937',
          };

    const titleHoverColor = widgetColors?.accent ?? '#3B82F6';
    const primaryTextColor = widgetColors?.primaryText ?? '#1F2937';
    const secondaryTextColor = widgetColors?.secondaryText ?? '#6B7280';
    const accentColor = widgetColors?.accent ?? '#1E40AF';

    return (
        <div
            className={`group relative flex h-full flex-col rounded-lg border p-4 shadow-sm transition-all hover:shadow-md ${className}`}
            style={cardStyles}
        >
            <div className='relative mb-2 flex items-start justify-between'>
                <h3
                    className='line-clamp-2 w-full cursor-pointer pr-8 font-semibold transition-colors'
                    style={{
                        color: primaryTextColor,
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = titleHoverColor;
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = primaryTextColor;
                    }}
                    onClick={() => {
                        onOpen(note);
                    }}
                >
                    {note.title}
                </h3>
                <div className='absolute top-0 right-0 flex space-x-1 opacity-0 transition-opacity group-hover:opacity-100'>
                    <Button
                        variant='ghost'
                        size='sm'
                        onClick={handleShare}
                        className='h-6 w-6 p-0'
                        title='Copy link to note'
                        style={{
                            color: secondaryTextColor,
                        }}
                    >
                        <ExternalLink className='h-3 w-3' />
                    </Button>
                    <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => {
                            onEdit(note);
                        }}
                        className='h-6 w-6 p-0'
                        style={{
                            color: secondaryTextColor,
                        }}
                    >
                        <Edit className='h-3 w-3' />
                    </Button>
                    <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => {
                            onDelete(note.id);
                        }}
                        className='h-6 w-6 p-0'
                    >
                        <Trash2
                            className='h-3 w-3'
                            style={{
                                color: secondaryTextColor,
                            }}
                        />
                    </Button>
                    {isDraggable && (
                        <div
                            className='note-drag-handle cursor-move rounded p-1'
                            style={{
                                color: secondaryTextColor,
                            }}
                        >
                            <GripVertical className='h-4 w-4' />
                        </div>
                    )}
                </div>
            </div>
            {note.content && (
                <div className='flex min-h-0 flex-1 flex-col'>
                    <div
                        className='scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 flex-1 cursor-pointer overflow-y-auto text-sm'
                        onClick={() => {
                            onOpen(note);
                        }}
                    >
                        <MarkdownRenderer
                            content={note.content}
                            widgetColors={widgetColors}
                            variant='card'
                            className='prose prose-sm max-w-none [&_p]:mb-2 [&_p:last-child]:mb-0 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0'
                        />
                    </div>
                </div>
            )}
            {note.labels.length > 0 && (
                <div className='mt-3 flex flex-wrap gap-1'>
                    {note.labels.map((label) => (
                        <Badge
                            key={label}
                            variant='outline'
                            style={{
                                color: primaryTextColor,
                                borderColor: accentColor,
                            }}
                        >
                            {label}
                        </Badge>
                    ))}{' '}
                    {note.source === 'obsidian' && (
                        <Badge
                            variant='outline'
                            style={{
                                color: primaryTextColor,
                                borderColor: accentColor,
                            }}
                            title={`From Obsidian: ${note.obsidianPath ?? 'Unknown path'}`}
                        >
                            Obsidian
                        </Badge>
                    )}
                </div>
            )}

            <div
                className='mt-3 text-xs'
                style={{
                    color: secondaryTextColor,
                }}
            >
                {note.updatedAt
                    .toISOString()
                    .substring(0, 16)
                    .replace('T', ' ')}
            </div>
        </div>
    );
};
