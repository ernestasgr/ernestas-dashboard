'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface WidgetPositionFieldsProps {
    x: number;
    y: number;
    width: number;
    height: number;
    onPositionChange: (
        field: 'x' | 'y' | 'width' | 'height',
        value: number,
    ) => void;
}

export function WidgetPositionFields({
    x,
    y,
    width,
    height,
    onPositionChange,
}: WidgetPositionFieldsProps) {
    return (
        <div className='grid grid-cols-4 gap-4'>
            <div className='space-y-2'>
                <Label htmlFor='x'>X Position</Label>
                <Input
                    id='x'
                    type='number'
                    value={x}
                    onChange={(e) => {
                        onPositionChange('x', parseInt(e.target.value) || 0);
                    }}
                    min={0}
                    max={11}
                />
            </div>
            <div className='space-y-2'>
                <Label htmlFor='y'>Y Position</Label>
                <Input
                    id='y'
                    type='number'
                    value={y}
                    onChange={(e) => {
                        onPositionChange('y', parseInt(e.target.value) || 0);
                    }}
                    min={0}
                />
            </div>
            <div className='space-y-2'>
                <Label htmlFor='width'>Width</Label>
                <Input
                    id='width'
                    type='number'
                    value={width}
                    onChange={(e) => {
                        onPositionChange(
                            'width',
                            parseInt(e.target.value) || 1,
                        );
                    }}
                    min={1}
                    max={12}
                />
            </div>
            <div className='space-y-2'>
                <Label htmlFor='height'>Height</Label>
                <Input
                    id='height'
                    type='number'
                    value={height}
                    onChange={(e) => {
                        onPositionChange(
                            'height',
                            parseInt(e.target.value) || 1,
                        );
                    }}
                    min={1}
                />
            </div>
        </div>
    );
}
