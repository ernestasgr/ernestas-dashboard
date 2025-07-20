'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ErrorDisplay } from '@/components/ui/error-display';
import { useMeQuery } from '@/generated/Auth.generated';
import {
    CreateWidgetInput,
    UpdateWidgetInput,
    Widget,
} from '@/generated/types';
import {
    useCreateWidgetMutation,
    useUpdateWidgetMutation,
} from '@/generated/Widgets.generated';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useWidgetForm } from '../hooks/useWidgetForm';
import { useWidgetValidation } from '../hooks/useWidgetValidation';
import { WidgetBasicFields } from './WidgetBasicFields';
import { WidgetConfigFields } from './WidgetConfigFields';
import { WidgetPositionFields } from './WidgetPositionFields';

interface WidgetFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    widget?: Widget | null;
    onWidgetCreated?: (widget: Widget) => void;
    onWidgetUpdated?: (widget: Widget) => void;
}

export function WidgetForm({
    open,
    onOpenChange,
    widget,
    onWidgetCreated,
    onWidgetUpdated,
}: WidgetFormProps) {
    const { data: meData } = useMeQuery();
    const [createWidget, { loading: creating }] = useCreateWidgetMutation();
    const [updateWidget, { loading: updating }] = useUpdateWidgetMutation();
    const isEditing = !!widget;
    const loading = creating || updating;
    const [configHasErrors, setConfigHasErrors] = useState(false);

    const {
        formData,
        updateField,
        updateConfigField,
        updatePositionField,
        handleTypeChange,
        resetForm,
    } = useWidgetForm({ widget, open });

    const { errors, hasErrors, validateForm, clearErrors } =
        useWidgetValidation({
            isEditing,
        });

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && open) {
                onOpenChange(false);
            }
        };

        if (open) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [open, onOpenChange]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!meData?.me.email) return;

        const isValid = validateForm({
            ...formData,
            id: widget?.id,
        });

        if (!isValid || configHasErrors) {
            return;
        }

        try {
            if (isEditing) {
                const input: UpdateWidgetInput = {
                    id: widget.id,
                    title: formData.title || undefined,
                    x: formData.x,
                    y: formData.y,
                    width: formData.width,
                    height: formData.height,
                    config: formData.config,
                };

                const result = await updateWidget({ variables: { input } });
                if (result.data?.updateWidget && onWidgetUpdated) {
                    onWidgetUpdated(result.data.updateWidget);
                    toast.success('Widget updated successfully');
                }
            } else {
                const input: CreateWidgetInput = {
                    type: formData.type,
                    title: formData.title || undefined,
                    x: formData.x,
                    y: formData.y,
                    width: formData.width,
                    height: formData.height,
                    config: formData.config,
                };

                const result = await createWidget({
                    variables: {
                        userId: meData.me.email,
                        input,
                    },
                });

                if (result.data?.createWidget && onWidgetCreated) {
                    onWidgetCreated(result.data.createWidget);
                    toast.success('Widget created successfully');
                }
            }
            onOpenChange(false);
            resetForm();
            clearErrors();
        } catch (error) {
            console.error('Error saving widget:', error);
            toast.error(
                isEditing
                    ? 'Failed to update widget'
                    : 'Failed to create widget',
            );
        }
    };
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='flex max-h-[95vh] flex-col sm:max-h-[90vh] sm:max-w-[500px]'>
                <DialogHeader className='flex-shrink-0'>
                    <DialogTitle>
                        {isEditing ? 'Edit Widget' : 'Add New Widget'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Update the widget settings.'
                            : 'Create a new widget for your dashboard.'}
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={(e) => {
                        void handleSubmit(e);
                    }}
                    className='flex min-h-0 flex-1 flex-col space-y-6'
                >
                    <div className='flex-1 overflow-y-auto pr-1 sm:pr-2'>
                        <div className='space-y-4 pb-2'>
                            <WidgetBasicFields
                                title={formData.title}
                                type={formData.type}
                                isEditing={isEditing}
                                onTitleChange={(title) => {
                                    updateField('title', title);
                                }}
                                onTypeChange={handleTypeChange}
                            />
                            <WidgetPositionFields
                                x={formData.x}
                                y={formData.y}
                                width={formData.width}
                                height={formData.height}
                                onPositionChange={updatePositionField}
                            />
                            <WidgetConfigFields
                                type={formData.type}
                                config={formData.config}
                                onConfigUpdate={updateConfigField}
                                onValidationChange={setConfigHasErrors}
                            />
                        </div>

                        {hasErrors && (
                            <div className='mt-4 space-y-2'>
                                {Object.entries(errors).map(
                                    ([field, fieldErrors]) => (
                                        <ErrorDisplay
                                            key={field}
                                            errors={fieldErrors}
                                            className='mt-2'
                                        />
                                    ),
                                )}
                            </div>
                        )}
                    </div>

                    <DialogFooter className='flex-shrink-0 flex-col gap-2 border-t pt-4 sm:flex-row sm:gap-0'>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={() => {
                                onOpenChange(false);
                            }}
                            className='w-full cursor-pointer sm:w-auto'
                        >
                            Cancel
                        </Button>
                        <Button
                            type='submit'
                            disabled={loading || hasErrors || configHasErrors}
                            className={`w-full sm:w-auto ${
                                loading || hasErrors || configHasErrors
                                    ? 'cursor-not-allowed'
                                    : 'cursor-pointer'
                            }`}
                        >
                            {loading
                                ? 'Saving...'
                                : isEditing
                                  ? 'Update Widget'
                                  : 'Create Widget'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
