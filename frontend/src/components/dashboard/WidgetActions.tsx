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
import { Widget, useDeleteWidgetMutation } from '@/generated/graphql';
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

    const handleDelete = async () => {
        try {
            const result = await deleteWidget({
                variables: { id: widget.id },
            });

            if (result.data?.deleteWidget) {
                onDelete(widget.id);
                setShowDeleteDialog(false);
            }
        } catch (error) {
            console.error('Error deleting widget:', error);
        }
    };

    return (
        <>
            <div className='absolute top-2 left-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
                <div className='flex space-x-1'>
                    <Button
                        size='icon'
                        variant='ghost'
                        className='h-6 w-6 bg-white/90 shadow-sm hover:bg-white'
                        onClick={() => {
                            onEdit(widget);
                        }}
                    >
                        <Edit2 className='h-3 w-3' />
                    </Button>
                    {onStyleEdit && (
                        <Button
                            size='icon'
                            variant='ghost'
                            className='h-6 w-6 bg-white/90 shadow-sm hover:bg-white'
                            onClick={() => {
                                onStyleEdit(widget);
                            }}
                        >
                            <Palette className='h-3 w-3' />
                        </Button>
                    )}
                    <Button
                        size='icon'
                        variant='ghost'
                        className='h-6 w-6 bg-white/90 text-red-600 shadow-sm hover:bg-white hover:text-red-700'
                        onClick={() => {
                            setShowDeleteDialog(true);
                        }}
                    >
                        <Trash2 className='h-3 w-3' />
                    </Button>
                </div>
            </div>

            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Widget</DialogTitle>{' '}
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
                        >
                            Cancel
                        </Button>{' '}
                        <Button
                            variant='destructive'
                            onClick={() => {
                                void handleDelete();
                            }}
                            disabled={deleting}
                        >
                            {deleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
