'use client';

import { useDroppable } from '@dnd-kit/core';
import { ItemColors } from './types';

interface TaskDropZoneProps {
    taskId: string;
    zone: 'above' | 'child' | 'below';
    level: number;
    itemColors: ItemColors;
    isActive: boolean;
    isOver: boolean;
    children?: React.ReactNode;
}

export const TaskDropZone = ({
    taskId,
    zone,
    level: _level, // eslint-disable-line @typescript-eslint/no-unused-vars
    itemColors,
    isActive,
    isOver,
    children,
}: TaskDropZoneProps) => {
    const dropId = `task-${taskId}-${zone}`;

    const { setNodeRef } = useDroppable({
        id: dropId,
    });

    const getZoneStyles = () => {
        if (!isActive) return {};

        const baseStyles = {
            transition: 'all 200ms ease',
            borderRadius: '6px',
        };

        if (isOver) {
            switch (zone) {
                case 'above':
                    return {
                        ...baseStyles,
                        borderTop: `2px solid ${itemColors.accent}`,
                        backgroundColor: `${itemColors.accent}10`,
                        marginTop: '2px',
                    };
                case 'child':
                    return {
                        ...baseStyles,
                        borderLeft: `3px solid ${itemColors.accent}`,
                        backgroundColor: `${itemColors.accent}14`,
                        paddingLeft: '5px',
                    };
                case 'below':
                    return {
                        ...baseStyles,
                        borderBottom: `2px solid ${itemColors.accent}`,
                        backgroundColor: `${itemColors.accent}10`,
                        marginBottom: '2px',
                    };
            }
        }

        return baseStyles;
    };

    const getDropIndicator = () => {
        if (!isActive || !isOver) return null;

        switch (zone) {
            case 'above':
                return (
                    <div
                        className='absolute -top-1 right-0 left-0 z-10 h-0.5'
                        style={{ backgroundColor: itemColors.accent }}
                    />
                );
            case 'child':
                return (
                    <div
                        className='absolute top-0 -right-2 bottom-0 z-10 w-1'
                        style={{ backgroundColor: itemColors.accent }}
                    />
                );
            case 'below':
                return (
                    <div
                        className='absolute right-0 -bottom-1 left-0 z-10 h-0.5'
                        style={{ backgroundColor: itemColors.accent }}
                    />
                );
        }
    };

    return (
        <div ref={setNodeRef} className='relative' style={getZoneStyles()}>
            {getDropIndicator()}
            {children}
        </div>
    );
};
