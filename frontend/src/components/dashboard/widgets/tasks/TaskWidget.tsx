'use client';

import { useTasks } from '@/components/dashboard/hooks/useTasks';
import { TasksConfig, Widget } from '@/generated/types';
import { CheckSquare } from 'lucide-react';
import { BaseWidget, useWidgetContext } from '../BaseWidget';
import { TaskForm } from './TaskForm';
import { TaskList } from './TaskList';
import { ItemColors } from './types';

interface TaskWidgetProps {
    widget: Widget;
    onEdit: (widget: Widget) => void;
    onDelete: (widgetId: string) => void;
    onStyleEdit?: (widget: Widget) => void;
}

const TaskContent = () => {
    const { widget, styling } = useWidgetContext();
    const config = widget.config as TasksConfig | null;

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
    const itemColors: ItemColors = styling.itemColors;

    const handleToggleTask = async (taskId: string) => {
        try {
            await toggleTaskCompletion(taskId);
        } catch (error) {
            console.error('Failed to toggle task:', error);
        }
    };

    const handleCreateTask = async (text: string) => {
        try {
            // Find the maximum display order among root tasks (tasks without parent)
            const rootTasks = widgetTasks.filter((task) => !task.parentTaskId);
            const maxDisplayOrder =
                rootTasks.length > 0
                    ? Math.max(...rootTasks.map((task) => task.displayOrder))
                    : -1;

            await createTask({
                text: text,
                category: config?.defaultCategory ?? 'personal',
                widgetId: widget.id,
                priority: 0,
                completed: false,
                displayOrder: maxDisplayOrder + 1,
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
            // Get all existing subtasks for the parent to find the highest display order
            const parentTask = widgetTasks.find((task) => task.id === parentId);
            const existingSubtasks = parentTask?.subTasks ?? [];
            const maxDisplayOrder =
                existingSubtasks.length > 0
                    ? Math.max(
                          ...existingSubtasks.map(
                              (subtask) => subtask.displayOrder,
                          ),
                      )
                    : -1;

            await createTask({
                text: text,
                category: config?.defaultCategory ?? 'personal',
                widgetId: widget.id,
                priority: 0,
                completed: false,
                displayOrder: maxDisplayOrder + 1,
                parentTaskId: parseInt(parentId),
            });
        } catch (error) {
            console.error('Failed to create subtask:', error);
        }
    };

    return (
        <div className='flex h-full min-h-0 flex-col'>
            <div className='mb-4 flex flex-shrink-0 items-center space-x-3'>
                <BaseWidget.Icon icon={CheckSquare} />
                <BaseWidget.Title>{widget.title}</BaseWidget.Title>
            </div>
            <div className='min-h-0 flex-1 space-y-3 overflow-y-auto'>
                <TaskList
                    tasks={widgetTasks}
                    itemColors={itemColors}
                    loading={loading}
                    onToggleTask={handleToggleTask}
                    onDeleteTask={handleDeleteTask}
                    onCreateSubtask={handleCreateSubtask}
                    onReorderTask={reorderTask}
                />

                <div className='px-2 py-3'>
                    <TaskForm
                        itemColors={itemColors}
                        onCreateTask={handleCreateTask}
                    />
                </div>
            </div>
        </div>
    );
};

export const TaskWidget = ({
    widget,
    onEdit,
    onDelete,
    onStyleEdit,
}: TaskWidgetProps) => {
    const baseClasses =
        'group relative h-full overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl dark:border-slate-700 dark:from-purple-900/20 dark:via-purple-800/30 dark:to-purple-700/40';

    return (
        <BaseWidget
            widget={widget}
            baseClasses={baseClasses}
            onEdit={onEdit}
            onDelete={onDelete}
            onStyleEdit={onStyleEdit}
        >
            <BaseWidget.Content className='flex h-full flex-col overflow-hidden p-5'>
                <TaskContent />
            </BaseWidget.Content>
        </BaseWidget>
    );
};
