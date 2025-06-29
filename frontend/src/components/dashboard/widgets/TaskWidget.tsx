'use client';

import { TasksConfig, Widget } from '@/generated/graphql';
import { useTasks } from '@/hooks/useTasks';
import {
    getWidgetClasses,
    getWidgetIconStyles,
    getWidgetItemColors,
    getWidgetStyles,
} from '@/lib/utils/widgetStyles';
import { CheckSquare, GripVertical } from 'lucide-react';
import { useState } from 'react';
import { Layout } from 'react-grid-layout';
import { WidgetActions } from '../WidgetActions';
import { TaskForm } from './TaskForm';
import { TaskList } from './TaskList';
import { ItemColors } from './types';

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
    const [expandedStates, setExpandedStates] = useState<
        Record<string, boolean>
    >({});
    const [layoutKey] = useState(0); 

    const {
        loading,
        createTask,
        toggleTaskCompletion,
        deleteTask,
        reorderTask,
        getTaskHierarchy,
    } = useTasks({
        widgetId: widget.id,
    });

    const widgetTasks = getTaskHierarchy(widget.id);

    const handleToggleExpanded = (taskId: string) => {
        setExpandedStates((prev) => ({
            ...prev,
            [taskId]: !(prev[taskId] ?? true),
        }));
    };

    const handleLayoutChange = (layout: Layout[]) => {
        const hasPositionChanges = layout.some((item) => {
            const task = widgetTasks.find((t) => t.id === item.i);
            return task && task.displayOrder !== item.y;
        });

        if (!hasPositionChanges) {
            return;
        }

        const sortedLayout = [...layout].sort((a, b) => a.y - b.y);

        console.log(
            'Layout changed (meaningful):',
            sortedLayout.map((item) => ({ id: item.i, y: item.y })),
        );

        const reorderPromises: Promise<void>[] = [];

        sortedLayout.forEach((item, index) => {
            const task = widgetTasks.find((t) => t.id === item.i);
            if (task && task.displayOrder !== index) {
                console.log(
                    `Reordering task ${task.id} (${task.text}) from ${String(task.displayOrder)} to ${String(index)}`,
                );
                reorderPromises.push(reorderTask(task.id, index));
            }
        });

        if (reorderPromises.length > 0) {
            Promise.all(reorderPromises).catch((error: unknown) => {
                console.error('Failed to reorder tasks:', error);
            });
        }
    };

    const handleToggleTask = async (taskId: string) => {
        try {
            await toggleTaskCompletion(taskId);
        } catch (error) {
            console.error('Failed to toggle task:', error);
        }
    };

    const handleCreateTask = async (text: string) => {
        try {
            await createTask({
                text: text,
                category: config?.defaultCategory ?? 'personal',
                widgetId: widget.id,
                priority: 0,
                completed: false,
                displayOrder: widgetTasks.length, // Put at the end
            });
        } catch (error) {
            console.error('Failed to create task:', error);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        try {
            await deleteTask(taskId);
        } catch (error) {
            console.error('Failed to delete task:', error);
        }
    };

    const handleCreateSubtask = async (parentId: string, text: string) => {
        try {
            await createTask({
                text: text,
                category: config?.defaultCategory ?? 'personal',
                widgetId: widget.id,
                priority: 0,
                completed: false,
                displayOrder: 0,
                parentTaskId: parseInt(parentId),
            });
        } catch (error) {
            console.error('Failed to create subtask:', error);
        }
    };

    const baseClasses =
        'group relative h-full overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl dark:border-slate-700 dark:from-purple-900/20 dark:via-purple-800/30 dark:to-purple-700/40';
    const dynamicStyles = getWidgetStyles(widget);
    const { foregroundStyles, backgroundStyles } = getWidgetIconStyles(widget);
    const itemColors: ItemColors = getWidgetItemColors(widget);
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
                        <CheckSquare
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
                <div className='flex-1 space-y-3 overflow-y-auto'>
                    <TaskList
                        tasks={widgetTasks}
                        itemColors={itemColors}
                        loading={loading}
                        layoutKey={layoutKey}
                        expandedStates={expandedStates}
                        onToggleTask={handleToggleTask}
                        onDeleteTask={handleDeleteTask}
                        onCreateSubtask={handleCreateSubtask}
                        onToggleExpanded={handleToggleExpanded}
                        onReorderTask={reorderTask}
                        onLayoutChange={handleLayoutChange}
                    />

                    <TaskForm
                        itemColors={itemColors}
                        onCreateTask={handleCreateTask}
                    />
                </div>
            </div>
        </div>
    );
};
