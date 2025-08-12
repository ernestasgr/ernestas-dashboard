'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WidgetFormData } from '@/lib/schemas/form-schemas';
import { Controller, UseFormReturn } from 'react-hook-form';

interface WidgetPositionFieldsProps {
    form: UseFormReturn<WidgetFormData>;
}

export function WidgetPositionFields({ form }: WidgetPositionFieldsProps) {
    const {
        control,
        formState: { errors },
    } = form;

    return (
        <>
            <div className='grid grid-cols-4 gap-4'>
                <div className='space-y-2'>
                    <Label htmlFor='x'>X Position</Label>
                    <Controller
                        name='x'
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                id='x'
                                type='number'
                                min={0}
                                max={11}
                                onChange={(e) => {
                                    field.onChange(
                                        parseInt(e.target.value) || 0,
                                    );
                                }}
                            />
                        )}
                    />
                    {errors.x && (
                        <p className='text-destructive text-sm'>
                            {errors.x.message}
                        </p>
                    )}
                </div>
                <div className='space-y-2'>
                    <Label htmlFor='y'>Y Position</Label>
                    <Controller
                        name='y'
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                id='y'
                                type='number'
                                min={0}
                                onChange={(e) => {
                                    field.onChange(
                                        parseInt(e.target.value) || 0,
                                    );
                                }}
                            />
                        )}
                    />
                    {errors.y && (
                        <p className='text-destructive text-sm'>
                            {errors.y.message}
                        </p>
                    )}
                </div>
                <div className='space-y-2'>
                    <Label htmlFor='width'>Width</Label>
                    <Controller
                        name='width'
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                id='width'
                                type='number'
                                min={1}
                                max={12}
                                onChange={(e) => {
                                    field.onChange(
                                        parseInt(e.target.value) || 1,
                                    );
                                }}
                            />
                        )}
                    />
                    {errors.width && (
                        <p className='text-destructive text-sm'>
                            {errors.width.message}
                        </p>
                    )}
                </div>
                <div className='space-y-2'>
                    <Label htmlFor='height'>Height</Label>
                    <Controller
                        name='height'
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                id='height'
                                type='number'
                                min={1}
                                onChange={(e) => {
                                    field.onChange(
                                        parseInt(e.target.value) || 1,
                                    );
                                }}
                            />
                        )}
                    />
                    {errors.height && (
                        <p className='text-destructive text-sm'>
                            {errors.height.message}
                        </p>
                    )}
                </div>
            </div>

            <p className='text-muted-foreground mt-2 text-xs'>
                Tip: The grid has 12 columns and 60px row height.
            </p>
        </>
    );
}
