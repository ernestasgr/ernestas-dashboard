import { Widget } from '@/generated/types';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { ClockWidget } from './ClockWidget';
import { NotesWidget } from './NotesWidget';
import { TaskWidget } from './TaskWidget';
import { WeatherWidget } from './WeatherWidget';
import { WidgetStyleConfig } from './WidgetStyleConfig';

interface WidgetRendererProps {
    widget: Widget;
    onEdit: (widget: Widget) => void;
    onDelete: (widgetId: string) => void;
}

export const WidgetRenderer = ({
    widget,
    onEdit,
    onDelete,
}: WidgetRendererProps) => {
    const [showStyleConfig, setShowStyleConfig] = useState(false);

    const handleStyleEdit = () => {
        setShowStyleConfig(true);
    };

    const handleStyleClose = () => {
        setShowStyleConfig(false);
    };

    const renderWidget = () => {
        switch (widget.type) {
            case 'clock':
                return (
                    <ClockWidget
                        widget={widget}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onStyleEdit={handleStyleEdit}
                    />
                );
            case 'weather':
                return (
                    <WeatherWidget
                        widget={widget}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onStyleEdit={handleStyleEdit}
                    />
                );
            case 'notes':
                return (
                    <NotesWidget
                        widget={widget}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onStyleEdit={handleStyleEdit}
                    />
                );
            case 'tasks':
                return (
                    <TaskWidget
                        widget={widget}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onStyleEdit={handleStyleEdit}
                    />
                );
            default:
                return <div>Unknown widget type: {widget.type}</div>;
        }
    };

    return (
        <>
            {renderWidget()}
            {showStyleConfig &&
                createPortal(
                    <div className='fixed inset-0 z-[11] flex items-center justify-center bg-black/20 backdrop-blur-sm'>
                        <WidgetStyleConfig
                            widget={widget}
                            onClose={handleStyleClose}
                        />
                    </div>,
                    document.body,
                )}
        </>
    );
};
