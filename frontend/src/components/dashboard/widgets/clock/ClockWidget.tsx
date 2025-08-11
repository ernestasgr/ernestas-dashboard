'use client';

import { ClockConfig, Widget } from '@/generated/types';
import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BaseWidget, useWidgetContext } from '../BaseWidget';

interface ClockWidgetProps {
    widget: Widget;
    onEdit: (widget: Widget) => void;
    onDelete: (widgetId: string) => void;
    onStyleEdit?: (widget: Widget) => void;
}

const ClockContent = () => {
    const { widget, styling } = useWidgetContext();
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

    return (
        <div className='flex h-full flex-col items-center justify-center'>
            <div className='mb-3'>
                <BaseWidget.Icon icon={Clock} className='h-8 w-8' />
            </div>
            <div className='text-center'>
                <BaseWidget.Title className='mb-2 text-lg font-semibold'>
                    {widget.title}
                </BaseWidget.Title>
                <div
                    className='text-4xl font-bold'
                    style={{ color: styling.textColor ?? undefined }}
                >
                    {formatTime(time)}
                </div>
                <div
                    className='mt-2 text-sm font-medium'
                    style={{ color: styling.textColor ?? undefined }}
                >
                    {time.toLocaleDateString()}
                </div>
            </div>
        </div>
    );
};

export const ClockWidget = ({
    widget,
    onEdit,
    onDelete,
    onStyleEdit,
}: ClockWidgetProps) => {
    const baseClasses =
        'group relative h-full overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl dark:border-slate-700 dark:from-blue-900/20 dark:via-blue-800/30 dark:to-blue-700/40 flex items-center justify-center';

    return (
        <BaseWidget
            widget={widget}
            baseClasses={baseClasses}
            onEdit={onEdit}
            onDelete={onDelete}
            onStyleEdit={onStyleEdit}
        >
            <BaseWidget.Content className='flex h-full items-center justify-center overflow-hidden p-6'>
                <div className='min-h-0'>
                    <ClockContent />
                </div>
            </BaseWidget.Content>
        </BaseWidget>
    );
};
