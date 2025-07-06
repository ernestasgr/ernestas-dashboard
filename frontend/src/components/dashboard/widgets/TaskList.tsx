'use client';

import { Task } from '@/components/dashboard/hooks/useTasks';
import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { TaskContent } from './TaskContent';
import { TaskItem } from './TaskItem';
import { ItemColors } from './types';

interface FlatTask extends Task {
    level: number;
    parentId?: string;
    isVisible: boolean;
}

interface TaskListProps {
    tasks: Task[];
    itemColors: ItemColors;
    loading: boolean;
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
    onChangeLevel?: (taskId: string, newLevel: number) => Promise<void>;
}

export const TaskList = ({
    tasks,
    itemColors,
    loading,
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
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
    const [activeOverId, setActiveOverId] = useState<string | null>(null);
    const [isReordering, setIsReordering] = useState(false);
    const reorderTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (reorderTimeoutRef.current) {
                clearTimeout(reorderTimeoutRef.current);
            }
        };
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3,
            },
        }),
    );

    const handleSetAddingSubtask = useCallback(
        (taskId: string, isAdding: boolean) => {
            setIsAddingSubtaskStates((prev) => ({
                ...prev,
                [taskId]: isAdding,
            }));
        },
        [],
    );

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

    // Get all subtasks recursively for a given task
    const getTaskWithSubtasks = useCallback(
        (taskId: string): FlatTask[] => {
            const result: FlatTask[] = [];

            const addTaskAndChildren = (currentTaskId: string) => {
                const task = flatTasks.find((t) => t.id === currentTaskId);
                if (!task) return;

                result.push(task);

                // Find all direct children
                const children = flatTasks.filter(
                    (t) => t.parentId === currentTaskId,
                );
                for (const child of children) {
                    addTaskAndChildren(child.id);
                }
            };

            addTaskAndChildren(taskId);
            return result;
        },
        [flatTasks],
    );

    // Parse drop zone ID to get task ID and zone type
    const parseDropId = (dropId: string) => {
        const parts = dropId.split('-');
        if (parts.length >= 3 && parts[0] === 'task') {
            return {
                taskId: parts[1],
                zone: parts.slice(2).join('-') as 'above' | 'child' | 'below',
            };
        }
        return { taskId: dropId, zone: 'below' as const };
    };

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

    // Render a task group (main task + all its subtasks) for the overlay
    const renderTaskGroup = useCallback(
        (tasks: FlatTask[]) => {
            if (tasks.length === 0) return null;

            return (
                <div className='space-y-1'>
                    {tasks.map((task, index) => (
                        <div
                            key={task.id}
                            className='task-overlay-item'
                            style={{
                                opacity: index === 0 ? 1 : 0.85, // First task (main dragged task) fully opaque, subtasks slightly transparent
                                transform:
                                    index > 0
                                        ? `translateX(${String(task.level * 2)}px)`
                                        : 'none',
                            }}
                        >
                            <TaskContent
                                task={task}
                                itemColors={itemColors}
                                expandedStates={expandedStates}
                                isAddingSubtaskStates={isAddingSubtaskStates}
                                onToggle={onToggleTask}
                                onDelete={onDeleteTask}
                                onCreateSubtask={onCreateSubtask}
                                onToggleExpanded={onToggleExpanded}
                                onChangeLevel={handleChangeLevel}
                                onSetAddingSubtask={handleSetAddingSubtask}
                                maxLevel={5}
                                isPotentialParent={false}
                                isDragActive={false}
                                isOverlay={true}
                            />
                        </div>
                    ))}
                </div>
            );
        },
        [
            itemColors,
            expandedStates,
            isAddingSubtaskStates,
            onToggleTask,
            onDeleteTask,
            onCreateSubtask,
            onToggleExpanded,
            handleChangeLevel,
            handleSetAddingSubtask,
        ],
    );

    // Calculate new parent and position based on drop zone
    const calculateNewParentAndPosition = (
        activeTaskId: string,
        dropId: string,
    ): { newParentId?: number; newDisplayOrder: number } => {
        const { taskId: targetTaskId, zone } = parseDropId(dropId);

        const targetTask = flatTasks.find((t) => t.id === targetTaskId);

        if (!targetTask) {
            return { newParentId: undefined, newDisplayOrder: 0 };
        }

        switch (zone) {
            case 'above':
                // Insert above target task, same parent as target
                // Use target's display order
                return {
                    newParentId: targetTask.parentId
                        ? parseInt(targetTask.parentId)
                        : undefined,
                    newDisplayOrder: targetTask.displayOrder,
                };
            case 'child':
                // Become child of target task
                // Find the highest display order among target's children and add 1
                const targetChildren = flatTasks.filter(
                    (t) => t.parentId === targetTask.id,
                );
                const maxChildOrder =
                    targetChildren.length > 0
                        ? Math.max(...targetChildren.map((t) => t.displayOrder))
                        : -1;
                return {
                    newParentId: parseInt(targetTask.id),
                    newDisplayOrder: maxChildOrder + 1,
                };
            case 'below':
                // Insert below target task, same parent as target
                // Use target's display order + 1
                return {
                    newParentId: targetTask.parentId
                        ? parseInt(targetTask.parentId)
                        : undefined,
                    newDisplayOrder: targetTask.displayOrder + 1,
                };
            default:
                return {
                    newParentId: targetTask.parentId
                        ? parseInt(targetTask.parentId)
                        : undefined,
                    newDisplayOrder: targetTask.displayOrder + 1,
                };
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveTaskId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { over } = event;
        setActiveOverId(over?.id ? String(over.id) : null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        setActiveTaskId(null);
        setActiveOverId(null);

        if (!over) {
            console.log('No drop target');
            return;
        }

        const activeTaskId = active.id as string;
        const overDropId = over.id as string;

        console.log('Drag end:', { activeTaskId, overDropId });

        // Don't do anything if dropping on itself or its descendants
        if (overDropId.includes(activeTaskId)) {
            console.log('Dropping on itself, ignoring');
            return;
        }

        // Check if we're trying to make a task a child of its own descendant
        const { taskId: targetTaskId, zone } = parseDropId(overDropId);
        if (zone === 'child') {
            // Find all descendants of the active task
            const findDescendants = (taskId: string): string[] => {
                const descendants: string[] = [];
                const children = flatTasks.filter((t) => t.parentId === taskId);
                for (const child of children) {
                    descendants.push(child.id);
                    descendants.push(...findDescendants(child.id));
                }
                return descendants;
            };

            const descendants = findDescendants(activeTaskId);
            if (descendants.includes(targetTaskId)) {
                console.log(
                    'Cannot make task a child of its own descendant, ignoring',
                );
                return;
            }
        }

        const { newParentId, newDisplayOrder } = calculateNewParentAndPosition(
            activeTaskId,
            overDropId,
        );

        console.log('Calculated new position:', {
            activeTaskId,
            newParentId,
            newDisplayOrder,
            overDropId,
        });

        // Get current task data for comparison
        const currentTask = flatTasks.find((t) => t.id === activeTaskId);
        const currentParentId = currentTask?.parentTaskId;

        // Normalize parent IDs for comparison (both could be undefined, string, or number)
        const normalizedCurrentParent = currentParentId
            ? parseInt(String(currentParentId))
            : undefined;
        const normalizedNewParent = newParentId;

        console.log('Current task state:', {
            currentParentId: normalizedCurrentParent,
            currentDisplayOrder: currentTask?.displayOrder,
            newParentId: normalizedNewParent,
            newDisplayOrder,
        });

        // Only proceed if something actually changed and we're not already reordering
        const parentChanged = normalizedCurrentParent !== normalizedNewParent;
        const orderChanged = newDisplayOrder !== currentTask?.displayOrder;

        if (isReordering || (!parentChanged && !orderChanged)) {
            console.log(
                'No actual change detected or already reordering, skipping reorder',
                {
                    isReordering,
                    parentChanged,
                    orderChanged,
                },
            );
            return;
        }

        if (reorderTimeoutRef.current) {
            clearTimeout(reorderTimeoutRef.current);
        }

        // Set reordering state and perform the reorder with a small delay
        setIsReordering(true);
        reorderTimeoutRef.current = setTimeout(() => {
            onReorderTask(activeTaskId, newDisplayOrder, newParentId)
                .then(() => {
                    console.log('Reorder completed successfully');
                })
                .catch((error: unknown) => {
                    console.error('Failed to reorder task:', error);
                })
                .finally(() => {
                    setIsReordering(false);
                });
        }, 100); // Small delay to prevent rapid successive calls
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

    // Get potential parent ID for visual feedback
    const getPotentialParentId = () => {
        if (!activeOverId || !activeTaskId) return null;

        const { taskId, zone } = parseDropId(activeOverId);

        if (zone === 'child') {
            return taskId;
        }

        const targetTask = flatTasks.find((t) => t.id === taskId);
        return targetTask?.parentId ?? null;
    };

    const potentialParentId = getPotentialParentId();

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className='space-y-1'>
                {flatTasks.map((task) => {
                    const draggedTasksIds = activeTaskId
                        ? getTaskWithSubtasks(activeTaskId).map((t) => t.id)
                        : [];
                    const isPartOfDraggedGroup = draggedTasksIds.includes(
                        task.id,
                    );

                    return (
                        <TaskItem
                            key={task.id}
                            task={task}
                            itemColors={itemColors}
                            expandedStates={expandedStates}
                            isAddingSubtaskStates={isAddingSubtaskStates}
                            onToggle={onToggleTask}
                            onDelete={onDeleteTask}
                            onCreateSubtask={onCreateSubtask}
                            onToggleExpanded={onToggleExpanded}
                            onChangeLevel={handleChangeLevel}
                            onSetAddingSubtask={handleSetAddingSubtask}
                            maxLevel={5}
                            isPotentialParent={potentialParentId === task.id}
                            isDragActive={activeTaskId !== null}
                            activeOverId={activeOverId}
                            isBeingDragged={isPartOfDraggedGroup}
                        />
                    );
                })}
            </div>

            {typeof document !== 'undefined' &&
                createPortal(
                    <DragOverlay
                        dropAnimation={{
                            duration: 250,
                            easing: 'ease',
                        }}
                    >
                        {activeTaskId
                            ? (() => {
                                  const tasksToRender =
                                      getTaskWithSubtasks(activeTaskId);
                                  if (tasksToRender.length === 0) return null;

                                  return (
                                      <div
                                          className='task-overlay-wrapper rounded-md border shadow-xl'
                                          style={{
                                              backgroundColor:
                                                  itemColors.lightBackground,
                                              borderColor: itemColors.border,
                                              opacity: 0.95,
                                              cursor: 'grabbing',
                                          }}
                                      >
                                          {renderTaskGroup(tasksToRender)}
                                      </div>
                                  );
                              })()
                            : null}
                    </DragOverlay>,
                    document.body,
                )}
        </DndContext>
    );
};
