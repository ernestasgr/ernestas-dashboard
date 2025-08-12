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
import { Widget } from '@/generated/types';
import { useDeleteWidgetMutation } from '@/generated/Widgets.generated';
import { useUIStore } from '@/lib/stores/ui-store';
import { useWidgetStore } from '@/lib/stores/widget-store';
import { getWidgetIconStyles } from '@/lib/utils/widget-styles';
import { Edit2, Palette, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface WidgetActionsProps {
    widget: Widget;
    onEdit: (widget: Widget) => void;
    onDelete: (widgetId: string) => void;
    onStyleEdit?: (widget: Widget) => void;
}

export function WidgetActions({
    widget,
    onEdit,
    onDelete,
    onStyleEdit,
}: WidgetActionsProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteWidget, { loading: deleting }] = useDeleteWidgetMutation();
    const removeWidget = useWidgetStore((s) => s.removeWidget);
    const notify = useUIStore((s) => s.notify);

    const { backgroundStyles } = getWidgetIconStyles(widget);

    const handleDelete = async () => {
        try {
            const result = await deleteWidget({
                variables: { id: widget.id },
            });

            if (result.data?.deleteWidget) {
                removeWidget(widget.id);
                onDelete(widget.id);
                setShowDeleteDialog(false);
                notify({
                    type: 'success',
                    message: 'Widget deleted successfully',
                });
            }
        } catch (error) {
            console.error('Error deleting widget:', error);
            notify({ type: 'error', message: 'Failed to delete widget' });
        }
    };

    return (
        <>
            <div className='absolute top-2 left-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
                <div className='flex space-x-1'>
                    <Button
                        size='icon'
                        variant='outline'
                        className='bg-background/80 supports-[backdrop-filter]:bg-background/60 h-7 w-7 cursor-pointer shadow-sm backdrop-blur transition-all duration-200 hover:scale-[1.03]'
                        onClick={() => {
                            onEdit(widget);
                        }}
                        style={{
                            ...backgroundStyles,
                            ...(widget.textColor
                                ? { color: widget.textColor }
                                : {}),
                        }}
                    >
                        <Edit2 className='h-3.5 w-3.5' />
                    </Button>
                    {onStyleEdit && (
                        <Button
                            size='icon'
                            variant='outline'
                            className='bg-background/80 supports-[backdrop-filter]:bg-background/60 h-7 w-7 cursor-pointer shadow-sm backdrop-blur transition-all duration-200 hover:scale-[1.03]'
                            onClick={() => {
                                onStyleEdit(widget);
                            }}
                            style={{
                                ...backgroundStyles,
                                ...(widget.textColor
                                    ? { color: widget.textColor }
                                    : {}),
                            }}
                        >
                            <Palette className='h-3.5 w-3.5' />
                        </Button>
                    )}
                    <Button
                        size='icon'
                        variant='outline'
                        className='bg-background/80 supports-[backdrop-filter]:bg-background/60 h-7 w-7 cursor-pointer shadow-sm backdrop-blur transition-all duration-200 hover:scale-[1.03]'
                        onClick={() => {
                            setShowDeleteDialog(true);
                        }}
                        style={{
                            ...backgroundStyles,
                            ...(widget.textColor
                                ? { color: widget.textColor }
                                : {}),
                        }}
                    >
                        <Trash2 className='h-3.5 w-3.5' />
                    </Button>
                </div>
            </div>

            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Widget</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete &quot;
                            {widget.title ?? widget.type}&quot;? This action
                            cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant='outline'
                            onClick={() => {
                                setShowDeleteDialog(false);
                            }}
                            disabled={deleting}
                            className={
                                deleting
                                    ? 'cursor-not-allowed'
                                    : 'cursor-pointer'
                            }
                        >
                            Cancel
                        </Button>
                        <Button
                            variant='destructive'
                            onClick={() => {
                                void handleDelete();
                            }}
                            disabled={deleting}
                            className={
                                deleting
                                    ? 'cursor-not-allowed'
                                    : 'cursor-pointer'
                            }
                        >
                            {deleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
