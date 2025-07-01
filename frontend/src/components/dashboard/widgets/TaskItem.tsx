'use client';

import { Task } from '@/components/dashboard/hooks/useTasks';
import {
    Check,
    ChevronDown,
    ChevronRight,
    GripVertical,
    IndentDecrease,
    IndentIncrease,
    Plus,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { ItemColors } from './types';

interface TaskItemProps {
    task: Task;
    level: number;
    itemColors: ItemColors;
    onToggle: (taskId: string) => Promise<void>;
    onDelete: (taskId: string) => Promise<void>;
    onCreateSubtask: (parentId: string, text: string) => Promise<void>;
    onToggleExpanded: (taskId: string) => void;
    onChangeLevel?: (taskId: string, newLevel: number) => Promise<void>;
    expandedStates: Record<string, boolean>;
    isAddingSubtaskStates?: Record<string, boolean>;
    onSetAddingSubtask?: (taskId: string, isAdding: boolean) => void;
    maxLevel?: number;
}

export const TaskItem = ({
    task,
    level,
    itemColors,
    onToggle,
    onDelete,
    onCreateSubtask,
    onToggleExpanded,
    onChangeLevel,
    expandedStates,
    isAddingSubtaskStates,
    onSetAddingSubtask,
    maxLevel = 5,
}: TaskItemProps) => {
    const [isAddingSubtask, setIsAddingSubtask] = useState(false);
    const [newSubtaskText, setNewSubtaskText] = useState('');

    const hasSubtasks = task.subTasks && task.subTasks.length > 0;
    const isTaskExpanded = expandedStates[task.id] ?? true;

    const actualIsAddingSubtask =
        isAddingSubtaskStates?.[task.id] ?? isAddingSubtask;

    const handleSetAddingSubtask = (isAdding: boolean) => {
        if (onSetAddingSubtask) {
            onSetAddingSubtask(task.id, isAdding);
        } else {
            setIsAddingSubtask(isAdding);
        }
    };

    const handleAddSubtask = async () => {
        if (newSubtaskText.trim()) {
            try {
                await onCreateSubtask(task.id, newSubtaskText.trim());
                setNewSubtaskText('');
                handleSetAddingSubtask(false);
            } catch (error) {
                console.error('Failed to create subtask:', error);
            }
        }
    };

    const handlePromoteLevel = async () => {
        if (level > 0 && onChangeLevel) {
            try {
                await onChangeLevel(task.id, level - 1);
            } catch (error) {
                console.error('Failed to promote task level:', error);
            }
        }
    };

    const handleDemoteLevel = async () => {
        if (level < maxLevel && onChangeLevel) {
            try {
                await onChangeLevel(task.id, level + 1);
            } catch (error) {
                console.error('Failed to demote task level:', error);
            }
        }
    };

    return (
        <div className='task-item h-full'>
            <div
                className={`group/task flex h-full w-full items-center rounded-md transition-all hover:shadow-sm ${
                    task.completed ? 'opacity-70' : ''
                }`}
                style={{
                    backgroundColor:
                        level === 0
                            ? itemColors.lightBackground
                            : 'transparent',
                    paddingLeft: `${String(8 + level * 12)}px`,
                    borderLeft: 'none',
                }}
            >
                {level > 0 && (
                    <div
                        className='absolute top-0 left-0 h-full'
                        style={{
                            width: '4px',
                            backgroundColor: itemColors.accent,
                            borderTopLeftRadius: '0.25rem', // match rounded-md
                            borderBottomLeftRadius: '0.25rem', // match rounded-md
                        }}
                    />
                )}
                {hasSubtasks ? (
                    <button
                        onClick={() => {
                            onToggleExpanded(task.id);
                        }}
                        className='mr-2 flex h-4 w-4 items-center justify-center opacity-70 transition-opacity hover:opacity-100'
                        style={{ color: itemColors.secondaryText }}
                    >
                        {isTaskExpanded ? (
                            <ChevronDown className='h-3 w-3' />
                        ) : (
                            <ChevronRight className='h-3 w-3' />
                        )}
                    </button>
                ) : (
                    <div className='mr-2 h-4 w-4' />
                )}

                <button
                    onClick={() => {
                        void onToggle(task.id);
                    }}
                    className={`mr-2 flex h-4 w-4 items-center justify-center rounded border-2 transition-all ${
                        task.completed
                            ? 'border-green-500 bg-green-500'
                            : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{
                        backgroundColor: task.completed
                            ? itemColors.accent
                            : 'transparent',
                        borderColor: task.completed
                            ? itemColors.accent
                            : itemColors.border,
                    }}
                >
                    {task.completed && (
                        <Check className='h-2.5 w-2.5 text-white' />
                    )}
                </button>

                <div className='min-w-0 flex-1'>
                    <span
                        className={`block truncate text-sm ${
                            task.completed ? 'line-through' : ''
                        }`}
                        style={{
                            color: task.completed
                                ? itemColors.secondaryText
                                : itemColors.primaryText,
                        }}
                        title={task.text}
                    >
                        {task.text}
                    </span>
                </div>

                <div className='mr-2 flex items-center space-x-1 opacity-0 transition-opacity group-hover/task:opacity-100'>
                    {onChangeLevel && (
                        <>
                            {level > 0 && (
                                <button
                                    onClick={() => {
                                        void handlePromoteLevel();
                                    }}
                                    className='rounded p-1 transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/20'
                                    style={{ color: itemColors.secondaryText }}
                                    title='Promote to higher level (reduce indentation)'
                                >
                                    <IndentDecrease className='h-3 w-3' />
                                </button>
                            )}
                            {level < maxLevel && (
                                <button
                                    onClick={() => {
                                        void handleDemoteLevel();
                                    }}
                                    className='rounded p-1 transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/20'
                                    style={{ color: itemColors.secondaryText }}
                                    title='Demote to lower level (increase indentation)'
                                >
                                    <IndentIncrease className='h-3 w-3' />
                                </button>
                            )}
                        </>
                    )}
                    {level < 3 && (
                        <button
                            onClick={() => {
                                handleSetAddingSubtask(true);
                            }}
                            className='rounded p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800'
                            style={{ color: itemColors.secondaryText }}
                            title='Add subtask'
                        >
                            <Plus className='h-3 w-3' />
                        </button>
                    )}
                    <button
                        onClick={() => {
                            void onDelete(task.id);
                        }}
                        className='rounded p-1 transition-colors hover:bg-red-100 dark:hover:bg-red-900/20'
                        title='Delete task'
                    >
                        <X className='h-3 w-3 text-red-500' />
                    </button>

                    {(task.level ?? 0) > 0 && (
                        <span
                            className='rounded px-1 font-mono text-xs'
                            style={{
                                color: itemColors.secondaryText,
                                backgroundColor: itemColors.lightBackground,
                            }}
                            title={`Level ${String(task.level)}`}
                        >
                            L{task.level}
                        </span>
                    )}

                    <div className='drag-handle-task cursor-move rounded opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
                        <GripVertical
                            className='h-3 w-3'
                            style={{
                                color: itemColors.secondaryText,
                            }}
                        />
                    </div>
                </div>
            </div>

            {actualIsAddingSubtask && (
                <div
                    className='mt-1 flex items-center space-x-2 rounded-md p-2'
                    style={{
                        backgroundColor: itemColors.lightBackground,
                        marginLeft: `${String(24 + level * 12)}px`,
                    }}
                >
                    <input
                        type='text'
                        value={newSubtaskText}
                        onChange={(e) => {
                            setNewSubtaskText(e.target.value);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                void handleAddSubtask();
                            } else if (e.key === 'Escape') {
                                handleSetAddingSubtask(false);
                                setNewSubtaskText('');
                            }
                        }}
                        placeholder='Enter subtask...'
                        className='flex-1 rounded border px-2 py-1 text-xs'
                        style={{
                            borderColor: itemColors.border,
                            backgroundColor: itemColors.lightBackground,
                            color: itemColors.primaryText,
                        }}
                        autoFocus
                    />
                    <button
                        onClick={() => {
                            void handleAddSubtask();
                        }}
                        disabled={!newSubtaskText.trim()}
                        className='rounded px-2 py-1 text-xs transition-opacity hover:opacity-80 disabled:opacity-50'
                        style={{
                            backgroundColor: itemColors.accent,
                            color: 'white',
                        }}
                    >
                        Add
                    </button>
                    <button
                        onClick={() => {
                            handleSetAddingSubtask(false);
                            setNewSubtaskText('');
                        }}
                        className='rounded px-2 py-1 text-xs transition-opacity hover:opacity-80'
                        style={{
                            color: itemColors.secondaryText,
                        }}
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
};
