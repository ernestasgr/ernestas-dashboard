import { Button } from '@/components/ui/button';
import type { Note } from '@/hooks/useNotes';
import { WidgetItemColors } from '@/lib/utils/widget-styling/types';
import { Edit, ExternalLink, GripVertical, Trash2 } from 'lucide-react';
import { useMemo } from 'react';

interface NoteCardProps {
    note: Note;
    onEdit: (note: Note) => void;
    onDelete: (noteId: string) => void;
    onOpen: (note: Note) => void;
    maxContentLength?: number;
    isDraggable?: boolean;
    className?: string;
    widgetColors?: WidgetItemColors;
}

export const NoteCard = ({
    note,
    onEdit,
    onDelete,
    onOpen,
    maxContentLength = 150,
    isDraggable = false,
    className = '',
    widgetColors,
}: NoteCardProps) => {
    const truncatedContent = useMemo(() => {
        if (note.content.length <= maxContentLength) {
            return note.content;
        }
        return note.content.substring(0, maxContentLength) + '...';
    }, [note.content, maxContentLength]);

    const handleShare = () => {
        const noteUrl = `${window.location.origin}${window.location.pathname}?noteId=${note.id}`;
        void navigator.clipboard.writeText(noteUrl);
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
    const buttonHoverColor = widgetColors?.accentLight ?? '#F3F4F6';
    const primaryTextColor = widgetColors?.primaryText ?? '#1F2937';
    const secondaryTextColor = widgetColors?.secondaryText ?? '#6B7280';
    const accentColor = widgetColors?.accent ?? '#1E40AF';
    const accentLightColor = widgetColors?.accentLight ?? '#DBEAFE';

    return (
        <div
            className={`group relative flex h-full flex-col rounded-lg border p-4 shadow-sm transition-all hover:shadow-md ${className}`}
            style={cardStyles}
        >
            {isDraggable && (
                <div
                    className='note-drag-handle absolute top-2 right-2 z-10 cursor-move rounded p-1 opacity-0 transition-opacity group-hover:opacity-100'
                    style={{
                        backgroundColor: buttonHoverColor,
                        color: secondaryTextColor,
                    }}
                >
                    <GripVertical className='h-4 w-4' />
                </div>
            )}
            <div className='mb-2 flex items-start justify-between'>
                <h3
                    className='line-clamp-2 cursor-pointer pr-8 font-semibold transition-colors'
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
                <div className='flex space-x-1 opacity-0 transition-opacity group-hover:opacity-100'>
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
                </div>
            </div>
            {note.content && (
                <div className='min-h-0 flex-1'>
                    <p
                        className='mb-3 line-clamp-3 cursor-pointer overflow-hidden text-sm'
                        style={{
                            color: secondaryTextColor,
                        }}
                        onClick={() => {
                            onOpen(note);
                        }}
                    >
                        {truncatedContent}
                    </p>
                </div>
            )}
            {note.labels.length > 0 && (
                <div className='mt-auto mb-2 flex flex-wrap gap-1'>
                    {note.labels.map((label) => (
                        <span
                            key={label}
                            className='rounded-full px-2 py-1 text-xs'
                            style={{
                                backgroundColor: accentLightColor,
                                color: accentColor,
                            }}
                        >
                            {label}
                        </span>
                    ))}
                </div>
            )}
            <div
                className='mt-auto text-xs'
                style={{
                    color: secondaryTextColor,
                }}
            >
                {note.updatedAt.toLocaleDateString()}
            </div>
        </div>
    );
};
