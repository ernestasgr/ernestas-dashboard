'use client';

import { useTaskForm } from '@/components/dashboard/hooks/useTaskForm';
import { TaskFormData } from '@/lib/schemas/form-schemas';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { ItemColors } from './types';

interface TaskFormProps {
    itemColors: ItemColors;
    onCreateTask: (text: string) => Promise<void>;
}

export const TaskForm = ({ itemColors, onCreateTask }: TaskFormProps) => {
    const { form, resetForm } = useTaskForm();
    const { handleSubmit, control, watch } = form;
    const [isAddingTask, setIsAddingTask] = useState(false);

    const watchedText = watch('text');

    const onSubmit = async (data: TaskFormData) => {
        try {
            await onCreateTask(data.text.trim());
            resetForm();
            setIsAddingTask(false);
        } catch (error) {
            console.error('Failed to create task:', error);
        }
    };

    const handleFormSubmit = () => {
        void handleSubmit(onSubmit)();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleFormSubmit();
        } else if (e.key === 'Escape') {
            setIsAddingTask(false);
            resetForm();
        }
    };

    const handleCancel = () => {
        setIsAddingTask(false);
        resetForm();
    };

    return (
        <div
            className='border-opacity-20 mt-4 border-t pt-3'
            style={{ borderColor: itemColors.border }}
        >
            {isAddingTask ? (
                <div className='flex items-center space-x-2'>
                    <Controller
                        name='text'
                        control={control}
                        render={({ field }) => (
                            <input
                                {...field}
                                type='text'
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
                        )}
                    />
                    <button
                        onClick={handleFormSubmit}
                        disabled={!watchedText.trim()}
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
