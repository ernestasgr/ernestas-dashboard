'use client';

import { Widget } from '@/generated/types';
import { useWidgetStore } from '@/lib/stores/widget-store';
import { useEffect, useState } from 'react';
import GridLayout from 'react-grid-layout';
import { DashboardHeader } from '../DashboardHeader';
import { EmptyDashboardState } from '../EmptyDashboardState';
import { useWidgetLayout } from '../hooks/useWidgetLayout';
import { WidgetForm } from '../widgets/WidgetForm';
import { WidgetRenderer } from '../widgets/WidgetRenderer';
import { CoordinateGrid } from './CoordinateGrid';

const Grid = () => {
    const [showWidgetForm, setShowWidgetForm] = useState(false);
    const [editingWidget, setEditingWidget] = useState<Widget | null>(null);
    const [showCoordinates, setShowCoordinates] = useState(false);

    const { windowWidth, widgetsData, loading, error, handleLayoutChange } =
        useWidgetLayout();

    const setWidgets = useWidgetStore((s) => s.setWidgets);
    const widgets = useWidgetStore((s) => s.widgets);
    const layoutMap = useWidgetStore((s) => s.layout);
    const setDragging = useWidgetStore((s) => s.setDragging);

    const handleEditWidget = (widget: Widget) => {
        setEditingWidget(widget);
        setShowWidgetForm(true);
    };

    const handleDeleteWidget = (_widgetId: string) => {
        return _widgetId;
    };

    const handleWidgetCreated = () => {
        return;
    };

    const handleWidgetUpdated = () => {
        setEditingWidget(null);
    };

    const handleAddWidget = () => {
        setEditingWidget(null);
        setShowWidgetForm(true);
    };

    const handleToggleCoordinates = () => {
        setShowCoordinates(!showCoordinates);
    };

    useEffect(() => {
        if (widgetsData?.widgets) {
            setWidgets(widgetsData.widgets as Widget[]);
        }
    }, [widgetsData?.widgets, setWidgets]);

    const onLayoutChange = (layout: GridLayout.Layout[]) => {
        handleLayoutChange(layout);
    };

    if (loading) {
        return (
            <div className='w-full p-4'>
                <div className='text-center'>Loading widgets...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='w-full p-4'>
                <div className='text-center text-red-500'>
                    Error loading widgets: {error.message}
                </div>
            </div>
        );
    }
    if (widgets.length === 0) {
        return (
            <>
                <EmptyDashboardState
                    showCoordinates={showCoordinates}
                    onToggleCoordinates={handleToggleCoordinates}
                    onAddWidget={handleAddWidget}
                    windowWidth={windowWidth}
                />
                <WidgetForm
                    key={showWidgetForm ? 'open' : 'closed'}
                    open={showWidgetForm}
                    onOpenChange={setShowWidgetForm}
                    widget={editingWidget}
                    onWidgetCreated={handleWidgetCreated}
                    onWidgetUpdated={handleWidgetUpdated}
                />
            </>
        );
    }

    const layout = widgets.map((widget) => {
        const l = layoutMap[widget.id];
        const x = l === undefined ? widget.x : l.x;
        const y = l === undefined ? widget.y : l.y;
        const w = l === undefined ? widget.width : l.width;
        const h = l === undefined ? widget.height : l.height;
        return { i: widget.id, x, y, w, h } as GridLayout.Layout;
    });

    return (
        <div className='flex min-h-0 w-full flex-1 flex-col'>
            <DashboardHeader
                showCoordinates={showCoordinates}
                onToggleCoordinates={handleToggleCoordinates}
                onAddWidget={handleAddWidget}
            />
            <div
                className={`relative min-h-0 max-w-full flex-1 overflow-y-auto ${showCoordinates ? 'pt-[30px] pl-[40px]' : ''}`}
            >
                <CoordinateGrid
                    showCoordinates={showCoordinates}
                    windowWidth={windowWidth}
                    widgets={widgets}
                />
                <GridLayout
                    className='layout max-w-full'
                    layout={layout}
                    cols={12}
                    rowHeight={60}
                    width={windowWidth}
                    margin={[15, 15]}
                    containerPadding={[4, 4]}
                    isDraggable={true}
                    isResizable={true}
                    draggableHandle='.drag-handle'
                    onLayoutChange={onLayoutChange}
                    onDragStart={() => {
                        setDragging(true);
                    }}
                    onDragStop={() => {
                        setDragging(false);
                    }}
                    onResizeStart={() => {
                        setDragging(true);
                    }}
                    onResizeStop={() => {
                        setDragging(false);
                    }}
                >
                    {widgets.map((widget) => (
                        <div key={widget.id} className='relative z-10 min-w-0'>
                            <WidgetRenderer
                                widget={widget}
                                onEdit={handleEditWidget}
                                onDelete={handleDeleteWidget}
                            />
                        </div>
                    ))}
                </GridLayout>
            </div>
            <WidgetForm
                key={showWidgetForm ? 'open' : 'closed'}
                open={showWidgetForm}
                onOpenChange={setShowWidgetForm}
                widget={editingWidget}
                onWidgetCreated={handleWidgetCreated}
                onWidgetUpdated={handleWidgetUpdated}
            />
        </div>
    );
};

export default Grid;
