'use client';

import { ClockConfig, Widget } from '@/generated/graphql';
import { getWidgetClasses, getWidgetStyles } from '@/lib/utils/widgetStyles';
import { Clock, GripVertical } from 'lucide-react';
import { useEffect, useState } from 'react';
import { WidgetActions } from '../WidgetActions';

interface ClockWidgetProps {
    widget: Widget;
    onEdit: (widget: Widget) => void;
    onDelete: (widgetId: string) => void;
    onStyleEdit?: (widget: Widget) => void;
}

export const ClockWidget = ({
    widget,
    onEdit,
    onDelete,
    onStyleEdit,
}: ClockWidgetProps) => {
    const [time, setTime] = useState(new Date());
    const config = widget.config as ClockConfig | null;

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, []);
    const formatTime = (date: Date) => {
        const options: Intl.DateTimeFormatOptions = {
            timeZone: config?.timezone ?? 'UTC',
            hour12: config?.format === '12h',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        };
        return date.toLocaleTimeString(undefined, options);
    };

    const baseClasses =
        'group relative h-full overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl dark:border-slate-700 dark:from-blue-900/20 dark:via-blue-800/30 dark:to-blue-700/40';
    const dynamicStyles = getWidgetStyles(widget);
    const finalClasses = getWidgetClasses(widget, baseClasses);

    return (
        <div className={finalClasses} style={dynamicStyles}>
            {' '}
            <WidgetActions
                widget={widget}
                onEdit={onEdit}
                onDelete={onDelete}
                onStyleEdit={onStyleEdit}
            />
            <div className='drag-handle absolute top-2 right-2 cursor-move opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
                <GripVertical className='h-5 w-5 text-blue-600 dark:text-blue-400' />
            </div>{' '}
            <div className='flex h-full flex-col items-center justify-center p-6'>
                <div className='mb-3 flex items-center justify-center rounded-full bg-blue-200/50 p-3 dark:bg-blue-800/50'>
                    <Clock
                        className='h-8 w-8 text-blue-700 dark:text-blue-300'
                        style={
                            widget.textColor ? { color: widget.textColor } : {}
                        }
                    />
                </div>
                <div className='text-center'>
                    <h3
                        className='mb-2 text-lg font-semibold text-blue-800 dark:text-blue-200'
                        style={
                            widget.textColor ? { color: widget.textColor } : {}
                        }
                    >
                        {widget.title}
                    </h3>
                    <div
                        className='text-4xl font-bold text-blue-800 dark:text-blue-200'
                        style={
                            widget.textColor ? { color: widget.textColor } : {}
                        }
                    >
                        {formatTime(time)}
                    </div>
                    <div
                        className='mt-2 text-sm font-medium text-blue-600 dark:text-blue-400'
                        style={
                            widget.textColor ? { color: widget.textColor } : {}
                        }
                    >
                        {time.toLocaleDateString()}
                    </div>
                </div>
            </div>
        </div>
    );
};
