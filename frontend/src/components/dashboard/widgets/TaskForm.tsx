'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import { ItemColors } from './types';

interface TaskFormProps {
    itemColors: ItemColors;
    onCreateTask: (text: string) => Promise<void>;
}

export const TaskForm = ({ itemColors, onCreateTask }: TaskFormProps) => {
    const [newTaskText, setNewTaskText] = useState('');
    const [isAddingTask, setIsAddingTask] = useState(false);

    const handleAddTask = async () => {
        if (!newTaskText.trim()) return;

        try {
            await onCreateTask(newTaskText.trim());
            setNewTaskText('');
            setIsAddingTask(false);
        } catch (error) {
            console.error('Failed to create task:', error);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            void handleAddTask();
        } else if (e.key === 'Escape') {
            setIsAddingTask(false);
            setNewTaskText('');
        }
    };

    const handleCancel = () => {
        setIsAddingTask(false);
        setNewTaskText('');
    };

    return (
        <div
            className='border-opacity-20 mt-4 border-t pt-3'
            style={{ borderColor: itemColors.border }}
        >
            {isAddingTask ? (
                <div className='flex items-center space-x-2'>
                    <input
                        type='text'
                        value={newTaskText}
                        onChange={(e) => {
                            setNewTaskText(e.target.value);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder='Enter task...'
                        className='flex-1 rounded border px-2 py-1 text-sm'
                        style={{
                            borderColor: itemColors.border,
                            backgroundColor: itemColors.lightBackground,
                            color: itemColors.primaryText,
                        }}
                        autoFocus
                    />
                    <button
                        onClick={() => void handleAddTask()}
                        disabled={!newTaskText.trim()}
                        className='rounded px-2 py-1 text-xs hover:opacity-80 disabled:opacity-50'
                        style={{
                            backgroundColor: itemColors.accent,
                            color: 'white',
                        }}
                    >
                        Add
                    </button>
                    <button
                        onClick={handleCancel}
                        className='rounded px-2 py-1 text-xs hover:opacity-80'
                        style={{
                            color: itemColors.secondaryText,
                        }}
                    >
                        Cancel
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => {
                        setIsAddingTask(true);
                    }}
                    className='flex w-full items-center space-x-2 rounded-lg p-2 transition-all hover:opacity-80'
                    style={{
                        backgroundColor: itemColors.lightBackground,
                        color: itemColors.secondaryText,
                    }}
                >
                    <Plus className='h-4 w-4' />
                    <span className='text-sm'>Add task</span>
                </button>
            )}
        </div>
    );
};
