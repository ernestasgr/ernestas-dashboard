'use client';

import { Task } from '@/components/dashboard/hooks/useTasks';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useCallback, useMemo, useState } from 'react';
import { SortableTaskItem } from './SortableTaskItem';
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

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3,
            },
        }),
    );

    const handleSetAddingSubtask = (taskId: string, isAdding: boolean) => {
        setIsAddingSubtaskStates((prev) => ({
            ...prev,
            [taskId]: isAdding,
        }));
    };

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

    // Determine the new parent and level for a task based on its new position
    const calculateNewParentAndLevel = useCallback(
        (
            taskId: string,
            newPosition: number,
            allVisibleTasks: FlatTask[],
        ): { newParentId?: number; newLevel: number } => {
            // If moved to position 0, it becomes a root task
            if (newPosition === 0) {
                return { newParentId: undefined, newLevel: 0 };
            }

            const currentTask = allVisibleTasks.find((t) => t.id === taskId);
            if (!currentTask) {
                return { newParentId: undefined, newLevel: 0 };
            }

            // Look at the task immediately above the new position
            const taskAbove = allVisibleTasks[newPosition - 1];

            // Don't allow a task to become a child of its own descendant
            const isDescendantOfCurrent = (
                potentialAncestorId: string,
            ): boolean => {
                const allFlatTasks = flattenTasks(tasks);
                const descendants = findDescendantIds(taskId, allFlatTasks);
                return descendants.includes(potentialAncestorId);
            };

            if (isDescendantOfCurrent(taskAbove.id)) {
                // If trying to move above a descendant, become a sibling at the same level
                const parentId = taskAbove.parentId
                    ? parseInt(taskAbove.parentId)
                    : undefined;
                return {
                    newParentId: parentId,
                    newLevel: taskAbove.level,
                };
            }

            // Look at the task immediately below (if it exists) to understand context
            const taskBelow =
                newPosition < allVisibleTasks.length
                    ? allVisibleTasks[newPosition]
                    : null;

            // If the task above has no children yet, and we're inserting right after it,
            // make this task a child (unless it would create too deep nesting)
            if (!taskAbove.subTasks || taskAbove.subTasks.length === 0) {
                if (taskAbove.level < 4) {
                    // Max depth check
                    // Check if the task below is at the same level as taskAbove (indicating we're at the end of a group)
                    if (!taskBelow || taskBelow.level <= taskAbove.level) {
                        return {
                            newParentId: parseInt(taskAbove.id),
                            newLevel: taskAbove.level + 1,
                        };
                    }
                }
            }

            // Check if the task below is a child of the task above
            const taskBelowIsChildOfAbove =
                taskBelow && taskBelow.parentId === taskAbove.id;

            // If we're dropping between a parent and its first child, become a child too
            if (
                taskBelowIsChildOfAbove &&
                taskBelow.level === taskAbove.level + 1
            ) {
                return {
                    newParentId: parseInt(taskAbove.id),
                    newLevel: taskAbove.level + 1,
                };
            }

            // Otherwise, become a sibling of the task above
            const parentId = taskAbove.parentId
                ? parseInt(taskAbove.parentId)
                : undefined;
            return {
                newParentId: parentId,
                newLevel: taskAbove.level,
            };
        },
        [findDescendantIds, flattenTasks, tasks],
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveTaskId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTaskId(null);

        if (!over || active.id === over.id) {
            return;
        }

        const activeTaskId = active.id as string;
        const overTaskId = over.id as string;

        const activeIndex = flatTasks.findIndex(
            (task) => task.id === activeTaskId,
        );
        const overIndex = flatTasks.findIndex((task) => task.id === overTaskId);

        if (activeIndex === -1 || overIndex === -1) {
            return;
        }

        const activeTask = flatTasks[activeIndex];
        const allFlatTasks = flattenTasks(tasks);

        console.log(
            `Task ${activeTaskId} (${activeTask.text}) moved from ${String(activeIndex)} to ${String(overIndex)}`,
        );

        // Check if we're trying to drop a task onto its own descendant
        const descendants = findDescendantIds(activeTaskId, allFlatTasks);
        if (descendants.includes(overTaskId)) {
            console.log('Cannot drop task onto its own descendant');
            return;
        }

        let newParentId: number | undefined;
        let newLevel: number;
        let finalPosition = overIndex;

        // If dragging to a different position, calculate new parent and level
        if (activeIndex !== overIndex) {
            // Special case: if dropping onto a task at the end of its children,
            // make it a child of that task
            const overTask = flatTasks[overIndex];

            // Check if we should make this task a child of the task we're dropping on
            const shouldBecomeChild = () => {
                // If the over task has no children and we're dropping below it, make it a child
                const overTaskHasChildren =
                    overTask.subTasks && overTask.subTasks.length > 0;
                const nextTask =
                    overIndex + 1 < flatTasks.length
                        ? flatTasks[overIndex + 1]
                        : null;

                // If there's no next task or the next task is not a child of the over task,
                // we can make the dropped task a child
                if (
                    !overTaskHasChildren ||
                    (nextTask && nextTask.parentId !== overTask.id)
                ) {
                    return overTask.level < 4; // Max depth limit
                }
                return false;
            };

            if (activeIndex < overIndex && shouldBecomeChild()) {
                // Moving down and should become a child
                newParentId = parseInt(overTask.id);
                newLevel = overTask.level + 1;
                finalPosition = overIndex + 1; // Insert after the parent
            } else {
                // Use the existing logic for other cases
                const targetPosition = overIndex;
                ({ newParentId, newLevel } = calculateNewParentAndLevel(
                    activeTaskId,
                    targetPosition,
                    flatTasks,
                ));
                finalPosition = targetPosition;
            }
        } else {
            // No position change, just return
            return;
        }

        const currentParentId = activeTask.parentTaskId;
        const parentChanged = newParentId !== currentParentId;
        const levelChanged = newLevel !== activeTask.level;
        const positionChanged = activeIndex !== finalPosition;

        if (parentChanged || levelChanged || positionChanged) {
            console.log(
                `Task ${activeTaskId} changes: parent ${String(currentParentId)} -> ${String(newParentId)}, level ${String(activeTask.level)} -> ${String(newLevel)}, position ${String(activeIndex)} -> ${String(finalPosition)}`,
            );

            console.log(`Moving descendants: ${descendants.join(', ')}`);

            onReorderTask(activeTaskId, finalPosition, newParentId).catch(
                (error: unknown) => {
                    console.error('Failed to reorder task:', error);
                },
            );
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
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={flatTasks.map((task) => task.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className='space-y-1'>
                    {flatTasks.map((task) => (
                        <SortableTaskItem
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
                        />
                    ))}
                </div>
            </SortableContext>
            <DragOverlay>
                {activeTaskId ? (
                    <div className='task-item-wrapper group relative rounded-md border bg-transparent opacity-80 transition-all duration-200 ease-out hover:shadow-md'>
                        <div className='h-full w-full'>
                            {(() => {
                                const activeTask = flatTasks.find(
                                    (t) => t.id === activeTaskId,
                                );
                                if (!activeTask) return null;

                                return (
                                    <TaskItem
                                        task={activeTask}
                                        level={activeTask.level}
                                        itemColors={itemColors}
                                        onToggle={onToggleTask}
                                        onDelete={onDeleteTask}
                                        onCreateSubtask={onCreateSubtask}
                                        onToggleExpanded={onToggleExpanded}
                                        onChangeLevel={handleChangeLevel}
                                        expandedStates={expandedStates}
                                        isAddingSubtaskStates={
                                            isAddingSubtaskStates
                                        }
                                        onSetAddingSubtask={
                                            handleSetAddingSubtask
                                        }
                                        maxLevel={5}
                                    />
                                );
                            })()}
                        </div>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};
