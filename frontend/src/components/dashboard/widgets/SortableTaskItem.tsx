'use client';

import { Task } from '@/components/dashboard/hooks/useTasks';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskItem } from './TaskItem';
import { ItemColors } from './types';

interface FlatTask extends Task {
    level: number;
    parentId?: string;
    isVisible: boolean;
}

interface SortableTaskItemProps {
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
}

export const SortableTaskItem = ({
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
}: SortableTaskItemProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={{
                ...style,
                border: `1px solid ${itemColors.border}`,
                backgroundColor: 'transparent',
            }}
            className='task-item-wrapper group relative rounded-md border bg-transparent transition-all duration-200 ease-out hover:shadow-md'
        >
            <div className='h-full w-full'>
                <TaskItem
                    task={task}
                    level={task.level}
                    itemColors={itemColors}
                    onToggle={onToggle}
                    onDelete={onDelete}
                    onCreateSubtask={onCreateSubtask}
                    onToggleExpanded={onToggleExpanded}
                    onChangeLevel={onChangeLevel}
                    expandedStates={expandedStates}
                    isAddingSubtaskStates={isAddingSubtaskStates}
                    onSetAddingSubtask={onSetAddingSubtask}
                    maxLevel={maxLevel}
                    dragAttributes={attributes}
                    dragListeners={listeners}
                />
            </div>
        </div>
    );
};
