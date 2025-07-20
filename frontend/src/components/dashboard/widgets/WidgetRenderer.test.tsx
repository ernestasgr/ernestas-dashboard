import { Widget } from '@/generated/types';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WidgetRenderer } from './WidgetRenderer';

vi.mock('./clock/ClockWidget', () => ({
    ClockWidget: ({
        widget,
        onEdit,
        onDelete,
        onStyleEdit,
    }: {
        widget: Widget;
        onEdit: (widget: Widget) => void;
        onDelete: (widgetId: string) => void;
        onStyleEdit?: (widget: Widget) => void;
    }) => (
        <div data-testid={`clock-widget-${widget.id}`} data-widget-type='clock'>
            <span>{widget.title}</span>
            <button
                onClick={() => {
                    onEdit(widget);
                }}
                data-testid='clock-edit'
            >
                Edit
            </button>
            <button
                onClick={() => {
                    onDelete(widget.id);
                }}
                data-testid='clock-delete'
            >
                Delete
            </button>
            {onStyleEdit && (
                <button
                    onClick={() => {
                        onStyleEdit(widget);
                    }}
                    data-testid='clock-style'
                >
                    Style
                </button>
            )}
        </div>
    ),
}));

vi.mock('./weather/WeatherWidget', () => ({
    WeatherWidget: ({
        widget,
        onEdit,
        onDelete,
        onStyleEdit,
    }: {
        widget: Widget;
        onEdit: (widget: Widget) => void;
        onDelete: (widgetId: string) => void;
        onStyleEdit?: (widget: Widget) => void;
    }) => (
        <div
            data-testid={`weather-widget-${widget.id}`}
            data-widget-type='weather'
        >
            <span>{widget.title}</span>
            <button
                onClick={() => {
                    onEdit(widget);
                }}
                data-testid='weather-edit'
            >
                Edit
            </button>
            <button
                onClick={() => {
                    onDelete(widget.id);
                }}
                data-testid='weather-delete'
            >
                Delete
            </button>
            {onStyleEdit && (
                <button
                    onClick={() => {
                        onStyleEdit(widget);
                    }}
                    data-testid='weather-style'
                >
                    Style
                </button>
            )}
        </div>
    ),
}));

vi.mock('./notes/NotesWidget', () => ({
    NotesWidget: ({
        widget,
        onEdit,
        onDelete,
        onStyleEdit,
    }: {
        widget: Widget;
        onEdit: (widget: Widget) => void;
        onDelete: (widgetId: string) => void;
        onStyleEdit?: (widget: Widget) => void;
    }) => (
        <div data-testid={`notes-widget-${widget.id}`} data-widget-type='notes'>
            <span>{widget.title}</span>
            <button
                onClick={() => {
                    onEdit(widget);
                }}
                data-testid='notes-edit'
            >
                Edit
            </button>
            <button
                onClick={() => {
                    onDelete(widget.id);
                }}
                data-testid='notes-delete'
            >
                Delete
            </button>
            {onStyleEdit && (
                <button
                    onClick={() => {
                        onStyleEdit(widget);
                    }}
                    data-testid='notes-style'
                >
                    Style
                </button>
            )}
        </div>
    ),
}));

vi.mock('./tasks/TaskWidget', () => ({
    TaskWidget: ({
        widget,
        onEdit,
        onDelete,
        onStyleEdit,
    }: {
        widget: Widget;
        onEdit: (widget: Widget) => void;
        onDelete: (widgetId: string) => void;
        onStyleEdit?: (widget: Widget) => void;
    }) => (
        <div data-testid={`task-widget-${widget.id}`} data-widget-type='tasks'>
            <span>{widget.title}</span>
            <button
                onClick={() => {
                    onEdit(widget);
                }}
                data-testid='task-edit'
            >
                Edit
            </button>
            <button
                onClick={() => {
                    onDelete(widget.id);
                }}
                data-testid='task-delete'
            >
                Delete
            </button>
            {onStyleEdit && (
                <button
                    onClick={() => {
                        onStyleEdit(widget);
                    }}
                    data-testid='task-style'
                >
                    Style
                </button>
            )}
        </div>
    ),
}));

vi.mock('./WidgetStyleConfig', () => ({
    WidgetStyleConfig: ({
        widget,
        onClose,
    }: {
        widget: Widget;
        onClose: () => void;
    }) => (
        <div data-testid='widget-style-config' data-widget-id={widget.id}>
            <h2>Style Config for {widget.title}</h2>
            <button
                onClick={() => {
                    onClose();
                }}
                data-testid='style-config-close'
            >
                Close
            </button>
        </div>
    ),
}));

vi.mock('react-dom', () => ({
    createPortal: (children: React.ReactNode) => children,
}));

const createMockWidget = (type: string, id = 'test-widget'): Widget => ({
    id,
    type,
    title: `Test ${type} Widget`,
    x: 0,
    y: 0,
    width: 4,
    height: 2,
    backgroundColor: null,
    textColor: null,
    iconColor: null,
    backgroundImage: null,
    config: undefined,
});

const mockProps = {
    onEdit: vi.fn(),
    onDelete: vi.fn(),
};

describe('WidgetRenderer', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Widget Type Rendering', () => {
        it('should render ClockWidget for clock type', () => {
            const clockWidget = createMockWidget('clock');

            render(<WidgetRenderer widget={clockWidget} {...mockProps} />);

            expect(
                screen.getByTestId(`clock-widget-${clockWidget.id}`),
            ).toBeInTheDocument();
            expect(screen.getByText('Test clock Widget')).toBeInTheDocument();
        });

        it('should render WeatherWidget for weather type', () => {
            const weatherWidget = createMockWidget('weather');

            render(<WidgetRenderer widget={weatherWidget} {...mockProps} />);

            expect(
                screen.getByTestId(`weather-widget-${weatherWidget.id}`),
            ).toBeInTheDocument();
            expect(screen.getByText('Test weather Widget')).toBeInTheDocument();
        });

        it('should render NotesWidget for notes type', () => {
            const notesWidget = createMockWidget('notes');

            render(<WidgetRenderer widget={notesWidget} {...mockProps} />);

            expect(
                screen.getByTestId(`notes-widget-${notesWidget.id}`),
            ).toBeInTheDocument();
            expect(screen.getByText('Test notes Widget')).toBeInTheDocument();
        });

        it('should render TaskWidget for tasks type', () => {
            const taskWidget = createMockWidget('tasks');

            render(<WidgetRenderer widget={taskWidget} {...mockProps} />);

            expect(
                screen.getByTestId(`task-widget-${taskWidget.id}`),
            ).toBeInTheDocument();
            expect(screen.getByText('Test tasks Widget')).toBeInTheDocument();
        });

        it('should render unknown widget type message for unsupported types', () => {
            const unknownWidget = createMockWidget('unknown-type');

            render(<WidgetRenderer widget={unknownWidget} {...mockProps} />);

            expect(
                screen.getByText('Unknown widget type: unknown-type'),
            ).toBeInTheDocument();
        });
    });

    describe('Event Handling', () => {
        it('should forward onEdit calls to parent', () => {
            const clockWidget = createMockWidget('clock');

            render(<WidgetRenderer widget={clockWidget} {...mockProps} />);

            const editButton = screen.getByTestId('clock-edit');
            fireEvent.click(editButton);

            expect(mockProps.onEdit).toHaveBeenCalledWith(clockWidget);
        });

        it('should forward onDelete calls to parent', () => {
            const clockWidget = createMockWidget('clock');

            render(<WidgetRenderer widget={clockWidget} {...mockProps} />);

            const deleteButton = screen.getByTestId('clock-delete');
            fireEvent.click(deleteButton);

            expect(mockProps.onDelete).toHaveBeenCalledWith(clockWidget.id);
        });
    });

    describe('Style Configuration', () => {
        it('should not show style config initially', () => {
            const clockWidget = createMockWidget('clock');

            render(<WidgetRenderer widget={clockWidget} {...mockProps} />);

            expect(
                screen.queryByTestId('widget-style-config'),
            ).not.toBeInTheDocument();
        });

        it('should show style config when style button is clicked', () => {
            const clockWidget = createMockWidget('clock');

            render(<WidgetRenderer widget={clockWidget} {...mockProps} />);

            const styleButton = screen.getByTestId('clock-style');
            fireEvent.click(styleButton);

            expect(
                screen.getByTestId('widget-style-config'),
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    `Style Config for ${clockWidget.title ?? 'Unknown'}`,
                ),
            ).toBeInTheDocument();
        });

        it('should hide style config when close button is clicked', () => {
            const clockWidget = createMockWidget('clock');

            render(<WidgetRenderer widget={clockWidget} {...mockProps} />);

            const styleButton = screen.getByTestId('clock-style');
            fireEvent.click(styleButton);

            expect(
                screen.getByTestId('widget-style-config'),
            ).toBeInTheDocument();

            const closeButton = screen.getByTestId('style-config-close');
            fireEvent.click(closeButton);

            expect(
                screen.queryByTestId('widget-style-config'),
            ).not.toBeInTheDocument();
        });

        it('should render style config in portal overlay', () => {
            const clockWidget = createMockWidget('clock');

            render(<WidgetRenderer widget={clockWidget} {...mockProps} />);

            const styleButton = screen.getByTestId('clock-style');
            fireEvent.click(styleButton);

            const styleConfig = screen.getByTestId('widget-style-config');
            expect(styleConfig).toBeInTheDocument();
            expect(styleConfig).toHaveAttribute(
                'data-widget-id',
                clockWidget.id,
            );
        });
    });

    describe('Multiple Widget Types Style Configuration', () => {
        const widgetTypes = [
            { type: 'clock', testId: 'clock-style' },
            { type: 'weather', testId: 'weather-style' },
            { type: 'notes', testId: 'notes-style' },
            { type: 'tasks', testId: 'task-style' },
        ];

        widgetTypes.forEach(({ type, testId }) => {
            it(`should handle style configuration for ${type} widget`, () => {
                const widget = createMockWidget(type, `${type}-widget-id`);

                render(<WidgetRenderer widget={widget} {...mockProps} />);

                const styleButton = screen.getByTestId(testId);
                fireEvent.click(styleButton);

                expect(
                    screen.getByTestId('widget-style-config'),
                ).toBeInTheDocument();
                expect(
                    screen.getByTestId('widget-style-config'),
                ).toHaveAttribute('data-widget-id', widget.id);
            });
        });
    });

    describe('Widget Props Forwarding', () => {
        it('should forward all props to individual widget components', () => {
            const clockWidget = createMockWidget('clock', 'clock-id-123');

            render(<WidgetRenderer widget={clockWidget} {...mockProps} />);

            const clockWidgetElement = screen.getByTestId(
                `clock-widget-${clockWidget.id}`,
            );
            expect(clockWidgetElement).toBeInTheDocument();
            expect(clockWidgetElement).toHaveAttribute(
                'data-widget-type',
                'clock',
            );

            expect(screen.getByTestId('clock-edit')).toBeInTheDocument();
            expect(screen.getByTestId('clock-delete')).toBeInTheDocument();
            expect(screen.getByTestId('clock-style')).toBeInTheDocument();
        });
    });

    describe('Error Boundaries', () => {
        it('should handle errors gracefully for unknown widget types', () => {
            const invalidWidget = {
                ...createMockWidget('invalid'),
                type: 'completely-unknown-type',
            };

            render(<WidgetRenderer widget={invalidWidget} {...mockProps} />);

            expect(
                screen.getByText(
                    'Unknown widget type: completely-unknown-type',
                ),
            ).toBeInTheDocument();
        });
    });
});
