'use client';

import { Task } from '@/components/dashboard/hooks/useTasks';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { TaskContent } from './TaskContent';
import { TaskDropZone } from './TaskDropZone';
import { ItemColors } from './types';

interface FlatTask extends Task {
    level: number;
    parentId?: string;
    isVisible: boolean;
}

interface TaskItemProps {
    task: FlatTask;
    itemColors: ItemColors;
    expandedStates: Record<string, boolean>;
    isAddingSubtaskStates: Record<string, boolean>;
    onToggle: (taskId: string) => Promise<void>;
    onDelete: (taskId: string) => Promise<void>;
    onCreateSubtask: (parentId: string, text: string) => Promise<void>;
    onToggleExpanded: (taskId: string) => void;
    onChangeLevel?: (taskId: string, newLevel: number) => Promise<void>;
    onSetAddingSubtask: (taskId: string, isAdding: boolean) => void;
    maxLevel?: number;
    isPotentialParent?: boolean;
    isDragActive?: boolean;
    activeOverId?: string | null;
    isBeingDragged?: boolean;
}

export const TaskItem = ({
    task,
    itemColors,
    expandedStates,
    isAddingSubtaskStates,
    onToggle,
    onDelete,
    onCreateSubtask,
    onToggleExpanded,
    onChangeLevel,
    onSetAddingSubtask,
    maxLevel = 5,
    isPotentialParent = false,
    isDragActive = false,
    activeOverId = null,
    isBeingDragged = false,
}: TaskItemProps) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: task.id,
    });

    const style = {
        transform: isBeingDragged ? 'none' : CSS.Transform.toString(transform),
        opacity: isBeingDragged ? 0 : 1,
    };

    // Generate potential parent visual feedback styles
    const getPotentialParentStyles = () => {
        if (!isPotentialParent || !isDragActive) return {};

        return {
            boxShadow: `0 0 0 2px ${itemColors.accent}40, 0 0 8px ${itemColors.accent}60`,
            backgroundColor: `${itemColors.accent}10`,
        };
    };

    return (
        <div className='relative'>
            {/* Above drop zone */}
            {isDragActive && (
                <TaskDropZone
                    taskId={task.id}
                    zone='above'
                    level={task.level}
                    itemColors={itemColors}
                    isActive={isDragActive}
                    isOver={activeOverId === `task-${task.id}-above`}
                >
                    <div className='h-2' />
                </TaskDropZone>
            )}

            {/* Main task with child drop zone */}
            <TaskDropZone
                taskId={task.id}
                zone='child'
                level={task.level}
                itemColors={itemColors}
                isActive={isDragActive}
                isOver={activeOverId === `task-${task.id}-child`}
            >
                <div
                    ref={setNodeRef}
                    style={{
                        ...style,
                        border: `1px solid ${itemColors.border}`,
                        backgroundColor: 'transparent',
                        ...getPotentialParentStyles(),
                    }}
                    className={`task-item-wrapper group relative rounded-md border bg-transparent transition-all duration-200 ease-out hover:border-gray-300 hover:shadow-sm ${
                        isPotentialParent && isDragActive
                            ? 'potential-parent-highlight'
                            : ''
                    }`}
                >
                    <div className='h-full w-full'>
                        <TaskContent
                            task={task}
                            itemColors={itemColors}
                            expandedStates={expandedStates}
                            isAddingSubtaskStates={isAddingSubtaskStates}
                            onToggle={onToggle}
                            onDelete={onDelete}
                            onCreateSubtask={onCreateSubtask}
                            onToggleExpanded={onToggleExpanded}
                            onChangeLevel={onChangeLevel}
                            onSetAddingSubtask={onSetAddingSubtask}
                            maxLevel={maxLevel}
                            isPotentialParent={isPotentialParent}
                            isDragActive={isDragActive}
                            dragAttributes={attributes}
                            dragListeners={listeners}
                        />
                    </div>
                </div>
            </TaskDropZone>

            {/* Below drop zone */}
            {isDragActive && (
                <TaskDropZone
                    taskId={task.id}
                    zone='below'
                    level={task.level}
                    itemColors={itemColors}
                    isActive={isDragActive}
                    isOver={activeOverId === `task-${task.id}-below`}
                >
                    <div className='h-2' />
                </TaskDropZone>
            )}
        </div>
    );
};
