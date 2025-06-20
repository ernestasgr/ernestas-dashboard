'use client';

import { TasksConfig, Widget } from '@/generated/graphql';
import {
    getWidgetClasses,
    getWidgetIconStyles,
    getWidgetItemColors,
    getWidgetStyles,
} from '@/lib/utils/widgetStyles';
import { CheckSquare, GripVertical } from 'lucide-react';
import { useState } from 'react';
import { WidgetActions } from '../WidgetActions';

interface TaskWidgetProps {
    widget: Widget;
    onEdit: (widget: Widget) => void;
    onDelete: (widgetId: string) => void;
    onStyleEdit?: (widget: Widget) => void;
}

export const TaskWidget = ({
    widget,
    onEdit,
    onDelete,
    onStyleEdit,
}: TaskWidgetProps) => {
    const config = widget.config as TasksConfig | null;
    const [tasks, setTasks] = useState([
        {
            id: 1,
            text: 'Review dashboard design',
            completed: false,
            category: config?.defaultCategory ?? 'personal',
        },
        {
            id: 2,
            text: 'Update documentation',
            completed: true,
            category: 'work',
        },
        {
            id: 3,
            text: 'Test new features',
            completed: false,
            category: 'urgent',
        },
    ]);
    const toggleTask = (id: number) => {
        setTasks(
            tasks.map((task) =>
                task.id === id ? { ...task, completed: !task.completed } : task,
            ),
        );
    };
    const baseClasses =
        'group relative h-full overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl dark:border-slate-700 dark:from-purple-900/20 dark:via-purple-800/30 dark:to-purple-700/40';
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
            />{' '}
            <div className='drag-handle absolute top-2 right-2 cursor-move opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
                <GripVertical
                    className='h-5 w-5 text-purple-600 dark:text-purple-400'
                    style={foregroundStyles}
                />
            </div>
            <div className='flex h-full flex-col p-6'>
                {' '}
                <div className='mb-4 flex items-center space-x-3'>
                    <div
                        className='flex items-center justify-center rounded-full bg-purple-200/50 p-2 dark:bg-purple-800/50'
                        style={backgroundStyles}
                    >
                        <CheckSquare
                            className='h-6 w-6 text-purple-700 dark:text-purple-300'
                            style={{
                                ...foregroundStyles,
                                ...(widget.textColor
                                    ? { color: widget.textColor }
                                    : {}),
                            }}
                        />
                    </div>
                    <h3
                        className='text-lg font-semibold text-purple-800 dark:text-purple-200'
                        style={
                            widget.textColor ? { color: widget.textColor } : {}
                        }
                    >
                        {widget.title}
                    </h3>
                </div>{' '}
                <div className='flex-1 space-y-3 overflow-y-auto'>
                    {tasks.map((task) => (
                        <div
                            key={task.id}
                            className='flex items-center space-x-3 rounded-lg p-3 transition-all'
                            style={{
                                backgroundColor: itemColors.lightBackground,
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    itemColors.mediumBackground;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    itemColors.lightBackground;
                            }}
                        >
                            <input
                                type='checkbox'
                                checked={task.completed}
                                onChange={() => {
                                    toggleTask(task.id);
                                }}
                                className='h-4 w-4 rounded border transition-all'
                                style={{
                                    borderColor: itemColors.border,
                                    accentColor: itemColors.accent,
                                }}
                            />
                            <div className='flex-1'>
                                <span
                                    className={`text-sm transition-all ${task.completed ? 'line-through' : ''}`}
                                    style={{
                                        color: task.completed
                                            ? itemColors.secondaryText
                                            : itemColors.primaryText,
                                    }}
                                >
                                    {task.text}
                                </span>
                                {config?.categories &&
                                    config.categories.includes(
                                        task.category,
                                    ) && (
                                        <div
                                            className='mt-1 text-xs'
                                            style={{
                                                color: itemColors.secondaryText,
                                            }}
                                        >
                                            {task.category}
                                        </div>
                                    )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
