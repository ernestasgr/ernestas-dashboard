import { Button } from '@/components/ui/button';
import { Grid3X3, Plus } from 'lucide-react';
import { CoordinateGrid } from './grid/CoordinateGrid';

interface EmptyDashboardStateProps {
    showCoordinates: boolean;
    onToggleCoordinates: () => void;
    onAddWidget: () => void;
    windowWidth: number;
}

export const EmptyDashboardState = ({
    showCoordinates,
    onToggleCoordinates,
    onAddWidget,
    windowWidth,
}: EmptyDashboardStateProps) => {
    return (
        <div className='w-full p-4'>
            <div className='mb-4 flex items-center justify-between'>
                <h2 className='text-2xl font-bold'>My Dashboard</h2>
                <div className='flex items-center space-x-2'>
                    <Button
                        variant={showCoordinates ? 'default' : 'outline'}
                        size='sm'
                        onClick={onToggleCoordinates}
                        className='cursor-pointer'
                    >
                        <Grid3X3 className='mr-2 h-4 w-4' />
                        {showCoordinates ? 'Hide Grid' : 'Show Grid'}
                    </Button>
                    <Button onClick={onAddWidget} className='cursor-pointer'>
                        <Plus className='mr-2 h-4 w-4' />
                        Add Your First Widget
                    </Button>
                </div>
            </div>
            <div className='relative min-h-[400px]'>
                <CoordinateGrid
                    showCoordinates={showCoordinates}
                    windowWidth={windowWidth}
                    widgets={[]}
                />
                <div className='space-y-4 pt-20 text-center'>
                    <div>No widgets available</div>
                    <div className='text-sm text-slate-600'>
                        {showCoordinates
                            ? 'Use the grid coordinates to position your first widget!'
                            : 'Toggle the grid to see coordinates for positioning.'}
                    </div>
                </div>
            </div>
        </div>
    );
};
