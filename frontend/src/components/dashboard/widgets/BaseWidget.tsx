'use client';

import { useWidgetStyling } from '@/components/dashboard/hooks/useWidgetStyling';
import { Widget } from '@/generated/types';
import { GripVertical } from 'lucide-react';
import { ReactNode, createContext, useContext } from 'react';
import { WidgetActions } from './WidgetActions';

interface WidgetContextType {
    widget: Widget;
    styling: ReturnType<typeof useWidgetStyling>;
    onEdit: (widget: Widget) => void;
    onDelete: (widgetId: string) => void;
    onStyleEdit?: (widget: Widget) => void;
}

const WidgetContext = createContext<WidgetContextType | null>(null);

const useWidgetContext = () => {
    const context = useContext(WidgetContext);
    if (!context) {
        throw new Error(
            'Widget compound components must be used within BaseWidget',
        );
    }
    return context;
};

interface BaseWidgetProps {
    widget: Widget;
    baseClasses: string;
    onEdit: (widget: Widget) => void;
    onDelete: (widgetId: string) => void;
    onStyleEdit?: (widget: Widget) => void;
    children: ReactNode;
}

const BaseWidget = ({
    widget,
    baseClasses,
    onEdit,
    onDelete,
    onStyleEdit,
    children,
}: BaseWidgetProps) => {
    const styling = useWidgetStyling(widget, baseClasses);

    const contextValue: WidgetContextType = {
        widget,
        styling,
        onEdit,
        onDelete,
        onStyleEdit,
    };

    return (
        <WidgetContext.Provider value={contextValue}>
            <div
                className={`${styling.containerClasses} group transition-shadow duration-200 hover:shadow-md`}
                style={styling.containerStyles}
            >
                <WidgetActions
                    widget={widget}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStyleEdit={onStyleEdit}
                />
                <div
                    className='drag-handle absolute top-2 right-2 cursor-move opacity-0 transition-opacity duration-200 group-hover:opacity-100'
                    aria-label='Drag widget'
                >
                    <GripVertical
                        className='h-5 w-5'
                        style={styling.iconStyles.foreground}
                    />
                </div>
                {children}
            </div>
        </WidgetContext.Provider>
    );
};

const WidgetIcon = ({
    icon: IconComponent,
    className = 'h-6 w-6',
}: {
    icon: React.ComponentType<{
        className?: string;
        style?: React.CSSProperties;
    }>;
    className?: string;
}) => {
    const { styling } = useWidgetContext();

    return (
        <div
            className='flex items-center justify-center rounded-full p-2'
            style={styling.iconStyles.background}
        >
            <IconComponent
                className={className}
                style={{
                    ...styling.iconStyles.foreground,
                    ...(styling.textColor ? { color: styling.textColor } : {}),
                }}
            />
        </div>
    );
};

const WidgetTitle = ({
    children,
    className = 'text-lg font-semibold',
}: {
    children: ReactNode;
    className?: string;
}) => {
    const { styling } = useWidgetContext();

    return (
        <h3
            className={className}
            style={{ color: styling.textColor ?? undefined }}
        >
            {children}
        </h3>
    );
};

const WidgetCustomActions = ({
    children,
    className = 'absolute top-2 right-10 opacity-0 transition-all duration-200 group-hover:opacity-100',
}: {
    children: ReactNode;
    className?: string;
}) => {
    return <div className={className}>{children}</div>;
};

const WidgetContent = ({
    children,
    className = 'flex h-full flex-col p-6 overflow-hidden',
}: {
    children: ReactNode;
    className?: string;
}) => {
    return <div className={className}>{children}</div>;
};

BaseWidget.Icon = WidgetIcon;
BaseWidget.Title = WidgetTitle;
BaseWidget.CustomActions = WidgetCustomActions;
BaseWidget.Content = WidgetContent;

export { BaseWidget, useWidgetContext };
