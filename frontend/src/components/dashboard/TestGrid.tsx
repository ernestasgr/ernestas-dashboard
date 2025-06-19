'use client';

import { Widget } from '@/generated/graphql';
import { useState } from 'react';
import GridLayout from 'react-grid-layout';
import { CoordinateGrid } from './CoordinateGrid';
import { DashboardHeader } from './DashboardHeader';
import { EmptyDashboardState } from './EmptyDashboardState';
import { useWidgetLayout } from './hooks/useWidgetLayout';
import { WidgetForm } from './WidgetForm';
import { WidgetRenderer } from './widgets/WidgetRenderer';

const MyGrid = () => {
    const [showWidgetForm, setShowWidgetForm] = useState(false);
    const [editingWidget, setEditingWidget] = useState<Widget | null>(null);
    const [showCoordinates, setShowCoordinates] = useState(false);

    const {
        windowWidth,
        widgetsData,
        loading,
        error,
        refetch,
        handleLayoutChange,
    } = useWidgetLayout();

    const handleEditWidget = (widget: Widget) => {
        setEditingWidget(widget);
        setShowWidgetForm(true);
    };

    const handleDeleteWidget = () => {
        void refetch();
    };

    const handleWidgetCreated = () => {
        void refetch();
    };

    const handleWidgetUpdated = () => {
        void refetch();
        setEditingWidget(null);
    };

    const handleAddWidget = () => {
        setEditingWidget(null);
        setShowWidgetForm(true);
    };

    const handleToggleCoordinates = () => {
        setShowCoordinates(!showCoordinates);
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

    if (!widgetsData?.widgets || widgetsData.widgets.length === 0) {
        return (
            <EmptyDashboardState
                showCoordinates={showCoordinates}
                onToggleCoordinates={handleToggleCoordinates}
                onAddWidget={handleAddWidget}
                windowWidth={windowWidth}
            />
        );
    }

    const layout = widgetsData.widgets.map((widget) => ({
        i: widget.id,
        x: widget.x,
        y: widget.y,
        w: widget.width,
        h: widget.height,
    }));

    return (
        <div className='w-full p-4'>
            <DashboardHeader
                showCoordinates={showCoordinates}
                onToggleCoordinates={handleToggleCoordinates}
                onAddWidget={handleAddWidget}
            />
            <div className={`relative ${showCoordinates ? 'pt-8 pl-10' : ''}`}>
                <CoordinateGrid
                    showCoordinates={showCoordinates}
                    windowWidth={windowWidth}
                    widgets={widgetsData.widgets}
                />
                <GridLayout
                    className='layout'
                    layout={layout}
                    cols={12}
                    rowHeight={60}
                    width={windowWidth}
                    margin={[10, 10]}
                    containerPadding={[0, 0]}
                    isDraggable={true}
                    isResizable={true}
                    draggableHandle='.drag-handle'
                    onLayoutChange={handleLayoutChange}
                >
                    {widgetsData.widgets.map((widget) => (
                        <div key={widget.id} className='relative z-10'>
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
                open={showWidgetForm}
                onOpenChange={setShowWidgetForm}
                widget={editingWidget}
                onWidgetCreated={handleWidgetCreated}
                onWidgetUpdated={handleWidgetUpdated}
            />
        </div>
    );
};

export default MyGrid;
