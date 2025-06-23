'use client';

import { NotesConfig, Widget } from '@/generated/graphql';
import {
    getWidgetClasses,
    getWidgetIconStyles,
    getWidgetItemColors,
    getWidgetStyles,
} from '@/lib/utils/widgetStyles';
import { GripVertical, StickyNote } from 'lucide-react';
import { useState } from 'react';
import { WidgetActions } from '../WidgetActions';

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
    const [notes, setNotes] = useState(
        config?.content ?? 'Click to add notes...',
    );
    const baseClasses =
        'group relative h-full overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-200 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl dark:border-slate-700 dark:from-yellow-900/20 dark:via-yellow-800/30 dark:to-yellow-700/40';
    const dynamicStyles = getWidgetStyles(widget);
    const { foregroundStyles, backgroundStyles } = getWidgetIconStyles(widget);
    const itemColors = getWidgetItemColors(widget);
    const finalClasses = getWidgetClasses(widget, baseClasses);

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
            <div className='flex h-full flex-col p-6'>
                <div className='mb-4 flex items-center space-x-3'>
                    <div
                        className='flex items-center justify-center rounded-full p-2'
                        style={backgroundStyles}
                    >
                        <StickyNote
                            className='h-6 w-6'
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
                            widget.textColor ? { color: widget.textColor } : {}
                        }
                    >
                        {widget.title}
                    </h3>
                </div>
                <textarea
                    value={notes}
                    onChange={(e) => {
                        if (
                            !config?.maxLength ||
                            e.target.value.length <= config.maxLength
                        ) {
                            setNotes(e.target.value);
                        }
                    }}
                    className='flex-1 resize-none rounded-lg border backdrop-blur-sm transition-all focus:ring-2 focus:outline-none'
                    style={{
                        backgroundColor: itemColors.lightBackground,
                        borderColor: itemColors.border,
                        color: itemColors.primaryText,
                        padding: '0.75rem',
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = itemColors.accent;
                        e.target.style.boxShadow = `0 0 0 2px ${itemColors.focusRing}`;
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = itemColors.border;
                        e.target.style.boxShadow = 'none';
                    }}
                    placeholder='Add your notes here...'
                    maxLength={config?.maxLength ?? undefined}
                />
                {config?.maxLength && (
                    <div
                        className='mt-2 text-xs'
                        style={{ color: itemColors.secondaryText }}
                    >
                        {notes.length}/{config.maxLength} characters
                    </div>
                )}
            </div>
        </div>
    );
};
