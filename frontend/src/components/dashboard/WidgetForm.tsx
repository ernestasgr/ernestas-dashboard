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
import {
    CreateWidgetInput,
    UpdateWidgetInput,
    Widget,
    useCreateWidgetMutation,
    useMeQuery,
    useUpdateWidgetMutation,
} from '@/generated/graphql';
import { useWidgetForm } from './hooks/useWidgetForm';
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

    const {
        formData,
        updateField,
        updateConfigField,
        updatePositionField,
        handleTypeChange,
        resetForm,
    } = useWidgetForm({ widget, open });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!meData?.me.email) return;

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
                }
            }

            onOpenChange(false);
            resetForm();
        } catch (error) {
            console.error('Error saving widget:', error);
        }
    };
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[500px]'>
                <DialogHeader>
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
                    className='space-y-6'
                >
                    <div className='space-y-4'>
                        {' '}
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
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={() => {
                                onOpenChange(false);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button type='submit' disabled={loading}>
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
