'use client';

import { Task } from '@/components/dashboard/hooks/useTasks';
import { useCallback, useMemo, useState } from 'react';
import { Layout, Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { TaskItem } from './TaskItem';
import { ItemColors } from './types';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface FlatTask extends Task {
    level: number;
    parentId?: string;
    isVisible: boolean;
}

interface TaskListProps {
    tasks: Task[];
    itemColors: ItemColors;
    loading: boolean;
    layoutKey: number;
    expandedStates: Record<string, boolean>;
    onToggleTask: (taskId: string) => Promise<void>;
    onDeleteTask: (taskId: string) => Promise<void>;
    onCreateSubtask: (parentId: string, text: string) => Promise<void>;
    onToggleExpanded: (taskId: string) => void;
    onReorderTask: (
        taskId: string,
        newDisplayOrder: number,
        newParentTaskId?: number,
    ) => Promise<void>;
    onLayoutChange: (layout: Layout[]) => void;
}

export const TaskList = ({
    tasks,
    itemColors,
    loading,
    layoutKey,
    expandedStates,
    onToggleTask,
    onDeleteTask,
    onCreateSubtask,
    onToggleExpanded,
    onReorderTask,
}: TaskListProps) => {
    const [isAddingSubtaskStates, setIsAddingSubtaskStates] = useState<
        Record<string, boolean>
    >({});
    const [suppressLayoutEvents, setSuppressLayoutEvents] = useState(false);

    const handleSetAddingSubtask = (taskId: string, isAdding: boolean) => {
        // Suppress layout events during subtask form operations
        if (isAdding) {
            setSuppressLayoutEvents(true);
        }

        setIsAddingSubtaskStates((prev) => ({
            ...prev,
            [taskId]: isAdding,
        }));

        // Re-enable layout events after the layout has stabilized
        setTimeout(
            () => {
                setSuppressLayoutEvents(false);
            },
            isAdding ? 400 : 100,
        );
    };

    const ROW_HEIGHT = 36;

    // Check if all ancestors in the path are expanded
    const isTaskVisible = useCallback(
        (ancestorPath: string[]): boolean => {
            // Root tasks are always visible
            if (ancestorPath.length === 0) return true;

            // Check if all ancestors are expanded
            return ancestorPath.every(
                (ancestorId) => expandedStates[ancestorId] ?? true,
            );
        },
        [expandedStates],
    );

    // Flatten the task hierarchy into a single array while preserving parent-child relationships
    const flattenTasks = useCallback(
        (
            tasks: Task[],
            level = 0,
            parentId?: string,
            ancestorPath: string[] = [],
        ): FlatTask[] => {
            const flattened: FlatTask[] = [];

            for (const task of tasks) {
                // Check if this task should be visible based on all ancestors being expanded
                const isVisible = isTaskVisible(ancestorPath);

                flattened.push({
                    ...task,
                    level,
                    parentId,
                    isVisible,
                });

                // Recursively add subtasks with updated ancestor path
                if (task.subTasks && task.subTasks.length > 0) {
                    const newAncestorPath = [...ancestorPath, task.id];
                    flattened.push(
                        ...flattenTasks(
                            task.subTasks,
                            level + 1,
                            task.id,
                            newAncestorPath,
                        ),
                    );
                }
            }

            return flattened;
        },
        [isTaskVisible],
    );

    // Get flattened tasks that are currently visible
    const flatTasks = useMemo(() => {
        return flattenTasks(tasks).filter((task) => task.isVisible);
    }, [tasks, flattenTasks]);

    // Find all descendant task IDs for a given task
    const findDescendantIds = useCallback(
        (taskId: string, allFlatTasks: FlatTask[]): string[] => {
            const descendants: string[] = [];
            const task = allFlatTasks.find((t) => t.id === taskId);
            if (!task) return descendants;

            const level = task.level;
            const taskIndex = allFlatTasks.findIndex((t) => t.id === taskId);

            // Find all tasks that come after this task and have a higher level (are descendants)
            for (let i = taskIndex + 1; i < allFlatTasks.length; i++) {
                const nextTask = allFlatTasks[i];
                if (nextTask.level <= level) {
                    // We've reached a task at the same or higher level, stop looking
                    break;
                }
                descendants.push(nextTask.id);
            }

            return descendants;
        },
        [],
    );

    const handleChangeLevel = useCallback(
        async (taskId: string, newLevel: number) => {
            const task = flatTasks.find((t) => t.id === taskId);
            if (!task) return;

            const currentIndex = flatTasks.findIndex((t) => t.id === taskId);
            if (currentIndex === -1) return;

            let newParentTaskId: number | undefined = undefined;

            if (newLevel > 0) {
                // Look backwards to find a task at level (newLevel - 1) to be the parent
                for (let i = currentIndex - 1; i >= 0; i--) {
                    const potentialParent = flatTasks[i];
                    if (potentialParent.level === newLevel - 1) {
                        newParentTaskId = parseInt(potentialParent.id);
                        break;
                    }
                    // If we find a task at a lower level, stop looking (no valid parent)
                    if (potentialParent.level < newLevel - 1) {
                        break;
                    }
                }

                // If no parent found at the desired level, don't change level
                if (newParentTaskId === undefined && newLevel > 0) {
                    console.log(
                        `Cannot change level: No parent found at level ${String(newLevel - 1)}`,
                    );
                    return;
                }
            }

            console.log(
                `Changing task ${taskId} level from ${String(task.level)} to ${String(newLevel)}, parent: ${String(newParentTaskId)}`,
            );

            try {
                await onReorderTask(taskId, currentIndex, newParentTaskId);
            } catch (error) {
                console.error('Failed to change task level:', error);
            }
        },
        [flatTasks, onReorderTask],
    );

    // Create layout for react-grid-layout
    const layouts = useMemo(() => {
        return {
            lg: flatTasks.map((task, index) => {
                const height = isAddingSubtaskStates[task.id] ? 2 : 1;

                return {
                    i: task.id,
                    x: 0,
                    y: index,
                    w: 12,
                    h: height,
                    minH: 1,
                    minW: 3,
                };
            }),
        };
    }, [flatTasks, isAddingSubtaskStates]);

    // Determine the new parent and level for a task based on its new position
    const calculateNewParentAndLevel = useCallback(
        (
            taskId: string,
            newYPosition: number,
            allVisibleTasks: FlatTask[],
        ): { newParentId?: number; newLevel: number } => {
            // If moved to position 0, it becomes a root task
            if (newYPosition === 0) {
                return { newParentId: undefined, newLevel: 0 };
            }

            const currentTask = allVisibleTasks.find((t) => t.id === taskId);
            if (!currentTask) {
                return { newParentId: undefined, newLevel: 0 };
            }

            // Look at the task immediately above the new position
            const taskAbove = allVisibleTasks[newYPosition - 1];

            // Look at the task immediately below (if it exists) to understand context
            const taskBelow =
                newYPosition < allVisibleTasks.length
                    ? allVisibleTasks[newYPosition]
                    : null;

            // Strategy 1: If the task above is at level 0, we can either:
            // - Become a root task (level 0) as a sibling
            // - Become a subtask (level 1) as a child
            if (taskAbove.level === 0) {
                // If there's a task below and it's a subtask of the task above, we also become a subtask
                if (taskBelow && taskBelow.parentId === taskAbove.id) {
                    return {
                        newParentId: parseInt(taskAbove.id),
                        newLevel: 1,
                    };
                }
                // Default: become a sibling (root level)
                return { newParentId: undefined, newLevel: 0 };
            }

            // Strategy 2: For higher level tasks, maintain the same level as the task above
            // or become its child if it makes sense
            if (taskBelow && taskBelow.level > taskAbove.level) {
                // There are subtasks below, so we become a subtask of the task above
                return {
                    newParentId: parseInt(taskAbove.id),
                    newLevel: taskAbove.level + 1,
                };
            }

            // Default: become a sibling of the task above
            const parentId = taskAbove.parentId
                ? parseInt(taskAbove.parentId)
                : undefined;
            return {
                newParentId: parentId,
                newLevel: taskAbove.level,
            };
        },
        [],
    );

    // Handle layout changes with support for parent/level changes
    const handleLayoutChange = (layout: Layout[]) => {
        if (suppressLayoutEvents) {
            console.log('Layout change suppressed during form operation');
            return;
        }

        // Check if there are meaningful position changes
        const hasPositionChanges = layout.some((item) => {
            const taskIndex = flatTasks.findIndex((t) => t.id === item.i);
            return taskIndex !== -1 && taskIndex !== item.y;
        });

        if (!hasPositionChanges) {
            return;
        }

        const sortedLayout = [...layout].sort((a, b) => a.y - b.y);
        const allFlatTasks = flattenTasks(tasks);

        console.log(
            'Layout changed (meaningful):',
            sortedLayout.map((item) => ({ id: item.i, y: item.y })),
        );

        const reorderPromises: Promise<void>[] = [];
        const processedTasks = new Set<string>();

        sortedLayout.forEach((item, newIndex) => {
            const taskId = item.i;
            if (processedTasks.has(taskId)) return;

            const task = flatTasks.find((t) => t.id === taskId);
            const originalIndex = flatTasks.findIndex((t) => t.id === taskId);

            if (!task || originalIndex === newIndex) return;

            console.log(
                `Processing task ${taskId} (${task.text}) moved from ${String(originalIndex)} to ${String(newIndex)}`,
            );

            const { newParentId, newLevel } = calculateNewParentAndLevel(
                taskId,
                newIndex,
                flatTasks,
            );

            const currentParentId = task.parentTaskId;
            const parentChanged = newParentId !== currentParentId;
            const levelChanged = newLevel !== task.level;

            if (parentChanged || levelChanged || originalIndex !== newIndex) {
                console.log(
                    `Task ${taskId} changes: parent ${String(currentParentId)} -> ${String(newParentId)}, level ${String(task.level)} -> ${String(newLevel)}, position ${String(originalIndex)} -> ${String(newIndex)}`,
                );

                // Find all descendants of this task to move them together
                const descendants = findDescendantIds(taskId, allFlatTasks);

                processedTasks.add(taskId);
                descendants.forEach((id) => processedTasks.add(id));

                reorderPromises.push(
                    onReorderTask(taskId, newIndex, newParentId),
                );
            }
        });

        if (reorderPromises.length > 0) {
            Promise.all(reorderPromises).catch((error: unknown) => {
                console.error('Failed to reorder tasks:', error);
            });
        }
    };

    if (loading) {
        return (
            <div className='flex items-center justify-center py-8'>
                <div className='text-sm opacity-70'>Loading tasks...</div>
            </div>
        );
    }

    if (tasks.length === 0) {
        return (
            <div className='flex items-center justify-center py-8'>
                <div className='text-sm opacity-70'>No tasks yet</div>
            </div>
        );
    }

    return (
        <ResponsiveGridLayout
            key={layoutKey}
            className='layout'
            layouts={layouts}
            onLayoutChange={handleLayoutChange}
            rowHeight={ROW_HEIGHT}
            margin={[0, 4]}
            isDraggable={!suppressLayoutEvents}
            isResizable={false}
            draggableHandle='.drag-handle-task'
            style={{
                position: 'relative',
                transition: 'height 0.2s ease-out',
            }}
        >
            {flatTasks.map((task) => (
                <div
                    key={task.id}
                    className='task-grid-item group relative rounded-md border bg-transparent transition-all duration-200 ease-out hover:shadow-md'
                    style={{
                        border: `1px solid ${itemColors.border}`,
                        backgroundColor: 'transparent',
                    }}
                >
                    <div className='h-full w-full'>
                        <TaskItem
                            task={task}
                            level={task.level}
                            itemColors={itemColors}
                            onToggle={onToggleTask}
                            onDelete={onDeleteTask}
                            onCreateSubtask={onCreateSubtask}
                            onToggleExpanded={onToggleExpanded}
                            onChangeLevel={handleChangeLevel}
                            expandedStates={expandedStates}
                            isAddingSubtaskStates={isAddingSubtaskStates}
                            onSetAddingSubtask={handleSetAddingSubtask}
                            maxLevel={5}
                        />
                    </div>
                </div>
            ))}
        </ResponsiveGridLayout>
    );
};
