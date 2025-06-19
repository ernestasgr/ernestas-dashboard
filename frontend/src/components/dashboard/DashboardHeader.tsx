import { Button } from '@/components/ui/button';
import { Grid3X3, Plus } from 'lucide-react';

interface DashboardHeaderProps {
    showCoordinates: boolean;
    onToggleCoordinates: () => void;
    onAddWidget: () => void;
}

export const DashboardHeader = ({ 
    showCoordinates, 
    onToggleCoordinates, 
    onAddWidget 
}: DashboardHeaderProps) => {
    return (
        <div className='mb-4 flex items-center justify-between'>
            <h2 className='text-2xl font-bold'>My Dashboard</h2>
            <div className='flex items-center space-x-2'>
                <Button
                    variant={showCoordinates ? 'default' : 'outline'}
                    size='sm'
                    onClick={onToggleCoordinates}
                >
                    <Grid3X3 className='mr-2 h-4 w-4' />
                    {showCoordinates ? 'Hide Grid' : 'Show Grid'}
                </Button>
                <Button onClick={onAddWidget}>
                    <Plus className='mr-2 h-4 w-4' />
                    Add Widget
                </Button>
            </div>
        </div>
    );
};
