'use client';

import { clsx } from 'clsx';

interface ErrorDisplayProps {
    errors?: string[];
    className?: string;
}

export function ErrorDisplay({ errors, className }: ErrorDisplayProps) {
    if (!errors || errors.length === 0) {
        return null;
    }

    return (
        <div className={clsx('space-y-1', className)}>
            {errors.map((error, index) => (
                <p
                    key={index}
                    className='text-sm text-red-600 dark:text-red-400'
                >
                    {error}
                </p>
            ))}
        </div>
    );
}
