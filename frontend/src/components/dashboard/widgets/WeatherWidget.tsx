'use client';

import { WeatherConfig, Widget } from '@/generated/graphql';
import {
    getWidgetClasses,
    getWidgetIconStyles,
    getWidgetStyles,
} from '@/lib/utils/widgetStyles';
import { CloudSun, GripVertical } from 'lucide-react';
import { WidgetActions } from '../WidgetActions';

interface WeatherWidgetProps {
    widget: Widget;
    onEdit: (widget: Widget) => void;
    onDelete: (widgetId: string) => void;
    onStyleEdit?: (widget: Widget) => void;
}

export const WeatherWidget = ({
    widget,
    onEdit,
    onDelete,
    onStyleEdit,
}: WeatherWidgetProps) => {
    const config = widget.config as WeatherConfig | null;
    const baseClasses =
        'group relative h-full overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-green-50 via-green-100 to-green-200 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl dark:border-slate-700 dark:from-green-900/20 dark:via-green-800/30 dark:to-green-700/40';
    const dynamicStyles = getWidgetStyles(widget);
    const { foregroundStyles, backgroundStyles } = getWidgetIconStyles(widget);
    const finalClasses = getWidgetClasses(widget, baseClasses);

    return (
        <div className={finalClasses} style={dynamicStyles}>
            {' '}
            <WidgetActions
                widget={widget}
                onEdit={onEdit}
                onDelete={onDelete}
                onStyleEdit={onStyleEdit}
            />{' '}
            <div className='drag-handle absolute top-2 right-2 cursor-move opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
                <GripVertical
                    className='h-5 w-5 text-green-600 dark:text-green-400'
                    style={foregroundStyles}
                />
            </div>
            <div className='flex h-full items-center justify-between p-6'>
                <div className='flex flex-col space-y-4'>
                    {' '}
                    <div className='flex items-center space-x-3'>
                        <div
                            className='flex items-center justify-center rounded-full bg-green-200/50 p-2 dark:bg-green-800/50'
                            style={backgroundStyles}
                        >
                            <CloudSun
                                className='h-6 w-6 text-green-700 dark:text-green-300'
                                style={{
                                    ...foregroundStyles,
                                    ...(widget.textColor
                                        ? { color: widget.textColor }
                                        : {}),
                                }}
                            />
                        </div>
                        <h3
                            className='text-lg font-semibold text-green-800 dark:text-green-200'
                            style={
                                widget.textColor
                                    ? { color: widget.textColor }
                                    : {}
                            }
                        >
                            {widget.title}
                        </h3>
                    </div>{' '}
                    <div className='space-y-1'>
                        <div
                            className='text-3xl font-bold text-green-700 dark:text-green-300'
                            style={
                                widget.textColor
                                    ? { color: widget.textColor }
                                    : {}
                            }
                        >
                            22°{config?.units === 'imperial' ? 'F' : 'C'}
                        </div>
                        <div
                            className='text-sm font-medium text-green-600 dark:text-green-400'
                            style={
                                widget.textColor
                                    ? { color: widget.textColor }
                                    : {}
                            }
                        >
                            {config?.location ?? 'Unknown Location'}
                        </div>
                        <div
                            className='text-sm font-medium text-green-600 dark:text-green-400'
                            style={
                                widget.textColor
                                    ? { color: widget.textColor }
                                    : {}
                            }
                        >
                            Sunny & Clear
                        </div>
                    </div>
                </div>
                <div className='text-5xl'>☀️</div>
            </div>
        </div>
    );
};
