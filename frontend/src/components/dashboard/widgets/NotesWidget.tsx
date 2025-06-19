'use client';

import { NotesConfig, Widget } from '@/generated/graphql';
import { getWidgetClasses, getWidgetStyles } from '@/lib/utils/widgetStyles';
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
                <GripVertical className='h-5 w-5 text-yellow-600 dark:text-yellow-400' />
            </div>
            <div className='flex h-full flex-col p-6'>
                <div className='mb-4 flex items-center space-x-3'>
                    <div className='flex items-center justify-center rounded-full bg-yellow-200/50 p-2 dark:bg-yellow-800/50'>
                        <StickyNote className='h-6 w-6 text-yellow-700 dark:text-yellow-300' />
                    </div>
                    <h3 className='text-lg font-semibold text-yellow-800 dark:text-yellow-200'>
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
                    className='flex-1 resize-none rounded-lg border border-yellow-300/50 bg-yellow-50/80 p-3 text-sm text-yellow-800 placeholder-yellow-500 backdrop-blur-sm transition-all focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 focus:outline-none dark:border-yellow-600/30 dark:bg-yellow-900/20 dark:text-yellow-200 dark:placeholder-yellow-400'
                    placeholder='Add your notes here...'
                    maxLength={config?.maxLength ?? undefined}
                />
                {config?.maxLength && (
                    <div className='mt-2 text-xs text-yellow-600 dark:text-yellow-400'>
                        {notes.length}/{config.maxLength} characters
                    </div>
                )}
            </div>
        </div>
    );
};
