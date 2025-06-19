'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { widgetPositionSchema } from '@/lib/validation/widget-schemas';

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
    const validation = widgetPositionSchema.safeParse({ x, y, width, height });
    const errors = validation.success
        ? {}
        : validation.error.flatten().fieldErrors;

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
                    className={errors.x ? 'border-red-500' : ''}
                />
                {errors.x && (
                    <p className='text-sm text-red-600'>{errors.x[0]}</p>
                )}
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
                    className={errors.y ? 'border-red-500' : ''}
                />
                {errors.y && (
                    <p className='text-sm text-red-600'>{errors.y[0]}</p>
                )}
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
                    className={errors.width ? 'border-red-500' : ''}
                />
                {errors.width && (
                    <p className='text-sm text-red-600'>{errors.width[0]}</p>
                )}
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
                    className={errors.height ? 'border-red-500' : ''}
                />
                {errors.height && (
                    <p className='text-sm text-red-600'>{errors.height[0]}</p>
                )}
            </div>
        </div>
    );
}
