import { Widget } from '@/generated/graphql';
import { ClockWidget } from './ClockWidget';
import { NotesWidget } from './NotesWidget';
import { TaskWidget } from './TaskWidget';
import { WeatherWidget } from './WeatherWidget';

interface WidgetRendererProps {
    widget: Widget;
    onEdit: (widget: Widget) => void;
    onDelete: (widgetId: string) => void;
}

export const WidgetRenderer = ({ widget, onEdit, onDelete }: WidgetRendererProps) => {
    switch (widget.type) {
        case 'clock':
            return (
                <ClockWidget
                    widget={widget}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            );
        case 'weather':
            return (
                <WeatherWidget
                    widget={widget}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            );
        case 'notes':
            return (
                <NotesWidget
                    widget={widget}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            );
        case 'tasks':
            return (
                <TaskWidget
                    widget={widget}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            );
        default:
            return <div>Unknown widget type: {widget.type}</div>;
    }
};
