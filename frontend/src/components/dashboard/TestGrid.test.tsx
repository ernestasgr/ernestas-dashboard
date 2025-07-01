import { MeDocument } from '@/generated/Auth.generated';
import { Widget } from '@/generated/types';
import {
    GetWidgetsDocument,
    UpdateWidgetLayoutDocument,
} from '@/generated/Widgets.generated';
import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TestGrid from './TestGrid';

interface GridLayoutItem {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
}

vi.mock('react-grid-layout', () => ({
    default: ({
        children,
        onLayoutChange,
    }: {
        children: React.ReactNode;
        onLayoutChange?: (layout: GridLayoutItem[]) => void;
    }) => (
        <div data-testid='grid-layout' onClick={() => onLayoutChange?.([])}>
            {children}
        </div>
    ),
}));

const useWidgetLayoutMock = vi.fn();
vi.mock('./hooks/useWidgetLayout', () => ({
    useWidgetLayout: (): ReturnType<typeof useWidgetLayoutMock> =>
        useWidgetLayoutMock(),
}));

vi.mock('./CoordinateGrid', () => ({
    CoordinateGrid: ({ showCoordinates }: { showCoordinates: boolean }) => (
        <div
            data-testid='coordinate-grid'
            data-show-coordinates={showCoordinates}
        />
    ),
}));

vi.mock('./DashboardHeader', () => ({
    DashboardHeader: ({
        onToggleCoordinates,
        onAddWidget,
    }: {
        onToggleCoordinates: () => void;
        onAddWidget: () => void;
    }) => (
        <div data-testid='dashboard-header'>
            <button
                onClick={onToggleCoordinates}
                data-testid='toggle-coordinates'
            >
                Toggle Coordinates
            </button>
            <button onClick={onAddWidget} data-testid='add-widget'>
                Add Widget
            </button>
        </div>
    ),
}));

vi.mock('./EmptyDashboardState', () => ({
    EmptyDashboardState: ({
        onAddWidget,
        onToggleCoordinates,
    }: {
        onAddWidget: () => void;
        onToggleCoordinates: () => void;
    }) => (
        <div data-testid='empty-dashboard-state'>
            <button
                onClick={() => {
                    onAddWidget();
                }}
                data-testid='empty-add-widget'
            >
                Add First Widget
            </button>
            <button
                onClick={() => {
                    onToggleCoordinates();
                }}
                data-testid='empty-toggle-coordinates'
            >
                Toggle Grid
            </button>
        </div>
    ),
}));

vi.mock('./WidgetForm', () => ({
    WidgetForm: ({
        open,
        widget,
        onWidgetCreated,
        onWidgetUpdated,
    }: {
        open: boolean;
        widget?: Widget | null;
        onWidgetCreated?: (widget: Widget) => void;
        onWidgetUpdated?: (widget: Widget) => void;
    }) => (
        <div data-testid='widget-form' data-open={open} data-editing={!!widget}>
            <button
                onClick={() => {
                    onWidgetCreated?.({ id: 'new-widget' } as Widget);
                }}
                data-testid='create-widget'
            >
                Create Widget
            </button>
            <button
                onClick={() => {
                    onWidgetUpdated?.({ id: 'updated-widget' } as Widget);
                }}
                data-testid='update-widget'
            >
                Update Widget
            </button>
        </div>
    ),
}));

vi.mock('./widgets/WidgetRenderer', () => ({
    WidgetRenderer: ({
        widget,
        onEdit,
        onDelete,
    }: {
        widget: Widget;
        onEdit: (widget: Widget) => void;
        onDelete: (widgetId: string) => void;
    }) => (
        <div data-testid={`widget-${widget.id}`} data-widget-type={widget.type}>
            <button
                onClick={() => {
                    onEdit(widget);
                }}
                data-testid={`edit-${widget.id}`}
            >
                Edit
            </button>
            <button
                onClick={() => {
                    onDelete(widget.id);
                }}
                data-testid={`delete-${widget.id}`}
            >
                Delete
            </button>
            <span data-testid={`title-${widget.id}`}>{widget.title}</span>
        </div>
    ),
}));

const mockWidget: Widget = {
    id: 'widget-1',
    type: 'clock',
    title: 'Test Clock Widget',
    x: 0,
    y: 0,
    width: 4,
    height: 2,
    backgroundColor: null,
    textColor: null,
    iconColor: null,
    backgroundImage: null,
    config: { timezone: 'UTC', format: '24h' },
};

const mockMeData = {
    me: {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
    },
};

const mockWidgetsData = {
    widgets: [mockWidget],
};

const mocks = [
    {
        request: {
            query: MeDocument,
        },
        result: {
            data: mockMeData,
        },
    },
    {
        request: {
            query: GetWidgetsDocument,
            variables: { userId: 'test@example.com' },
        },
        result: {
            data: mockWidgetsData,
        },
    },
    {
        request: {
            query: UpdateWidgetLayoutDocument,
            variables: {
                input: {
                    id: 'widget-1',
                    x: 1,
                    y: 1,
                    width: 4,
                    height: 2,
                },
            },
        },
        result: {
            data: {
                updateWidgetLayout: {
                    ...mockWidget,
                    x: 1,
                    y: 1,
                },
            },
        },
    },
];

describe('TestGrid', () => {
    const mockHookReturnValue = {
        windowWidth: 1200,
        widgetsData: mockWidgetsData,
        loading: false,
        error: null,
        refetch: vi.fn(),
        handleLayoutChange: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();

        useWidgetLayoutMock.mockReturnValue(mockHookReturnValue);

        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1200,
        });

        // Mock resize event listener
        window.addEventListener = vi.fn();
        window.removeEventListener = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Loading State', () => {
        it('should show loading message when loading is true', () => {
            useWidgetLayoutMock.mockReturnValue({
                ...mockHookReturnValue,
                loading: true,
            });

            render(
                <MockedProvider mocks={mocks}>
                    <TestGrid />
                </MockedProvider>,
            );

            expect(screen.getByText('Loading widgets...')).toBeInTheDocument();
        });
    });

    describe('Error State', () => {
        it('should show error message when there is an error', () => {
            useWidgetLayoutMock.mockReturnValue({
                ...mockHookReturnValue,
                error: { message: 'Failed to load widgets' },
            });

            render(
                <MockedProvider mocks={mocks}>
                    <TestGrid />
                </MockedProvider>,
            );

            expect(
                screen.getByText(
                    /Error loading widgets: Failed to load widgets/,
                ),
            ).toBeInTheDocument();
        });
    });

    describe('Empty State', () => {
        it('should show empty dashboard state when no widgets exist', () => {
            useWidgetLayoutMock.mockReturnValue({
                ...mockHookReturnValue,
                widgetsData: { widgets: [] },
            });

            render(
                <MockedProvider mocks={mocks}>
                    <TestGrid />
                </MockedProvider>,
            );

            expect(
                screen.getByTestId('empty-dashboard-state'),
            ).toBeInTheDocument();
            expect(screen.getByTestId('widget-form')).toBeInTheDocument();
        });

        it('should show empty dashboard state when widgetsData is null', () => {
            useWidgetLayoutMock.mockReturnValue({
                ...mockHookReturnValue,
                widgetsData: null,
            });

            render(
                <MockedProvider mocks={mocks}>
                    <TestGrid />
                </MockedProvider>,
            );

            expect(
                screen.getByTestId('empty-dashboard-state'),
            ).toBeInTheDocument();
        });

        it('should handle add widget from empty state', () => {
            useWidgetLayoutMock.mockReturnValue({
                ...mockHookReturnValue,
                widgetsData: { widgets: [] },
            });

            render(
                <MockedProvider mocks={mocks}>
                    <TestGrid />
                </MockedProvider>,
            );

            const addButton = screen.getByTestId('empty-add-widget');
            fireEvent.click(addButton);

            const widgetForm = screen.getByTestId('widget-form');
            expect(widgetForm).toHaveAttribute('data-open', 'true');
            expect(widgetForm).toHaveAttribute('data-editing', 'false');
        });
    });

    describe('Grid with Widgets', () => {
        it('should render dashboard header and grid layout with widgets', () => {
            render(
                <MockedProvider mocks={mocks}>
                    <TestGrid />
                </MockedProvider>,
            );

            expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
            expect(screen.getByTestId('grid-layout')).toBeInTheDocument();
            expect(screen.getByTestId('coordinate-grid')).toBeInTheDocument();
            expect(screen.getByTestId('widget-widget-1')).toBeInTheDocument();
        });

        it('should display widget information correctly', () => {
            render(
                <MockedProvider mocks={mocks}>
                    <TestGrid />
                </MockedProvider>,
            );

            const widget = screen.getByTestId('widget-widget-1');
            expect(widget).toHaveAttribute('data-widget-type', 'clock');
            expect(screen.getByTestId('title-widget-1')).toHaveTextContent(
                'Test Clock Widget',
            );
        });

        it('should handle widget editing', () => {
            render(
                <MockedProvider mocks={mocks}>
                    <TestGrid />
                </MockedProvider>,
            );

            const editButton = screen.getByTestId('edit-widget-1');
            fireEvent.click(editButton);

            const widgetForm = screen.getByTestId('widget-form');
            expect(widgetForm).toHaveAttribute('data-open', 'true');
            expect(widgetForm).toHaveAttribute('data-editing', 'true');
        });
        it('should handle widget deletion', () => {
            const mockRefetch = vi.fn();
            useWidgetLayoutMock.mockReturnValue({
                ...mockHookReturnValue,
                refetch: mockRefetch,
            });

            render(
                <MockedProvider mocks={mocks}>
                    <TestGrid />
                </MockedProvider>,
            );

            const deleteButton = screen.getByTestId('delete-widget-1');
            fireEvent.click(deleteButton);

            expect(mockRefetch).toHaveBeenCalled();
        });

        it('should handle layout changes', () => {
            const mockHandleLayoutChange = vi.fn();
            useWidgetLayoutMock.mockReturnValue({
                ...mockHookReturnValue,
                handleLayoutChange: mockHandleLayoutChange,
            });

            render(
                <MockedProvider mocks={mocks}>
                    <TestGrid />
                </MockedProvider>,
            );

            const gridLayout = screen.getByTestId('grid-layout');
            fireEvent.click(gridLayout);

            expect(mockHandleLayoutChange).toHaveBeenCalledWith([]);
        });
    });

    describe('Coordinate Grid Toggle', () => {
        it('should toggle coordinate grid visibility', () => {
            render(
                <MockedProvider mocks={mocks}>
                    <TestGrid />
                </MockedProvider>,
            );

            const coordinateGrid = screen.getByTestId('coordinate-grid');
            expect(coordinateGrid).toHaveAttribute(
                'data-show-coordinates',
                'false',
            );

            const toggleButton = screen.getByTestId('toggle-coordinates');
            fireEvent.click(toggleButton);
        });

        it('should apply correct classes when coordinates are shown', () => {
            render(
                <MockedProvider mocks={mocks}>
                    <TestGrid />
                </MockedProvider>,
            );

            const container = screen.getByTestId('grid-layout').parentElement;
            expect(container).not.toHaveClass('pt-8', 'pl-10');
        });
    });

    describe('Widget Form Integration', () => {
        it('should handle widget creation', async () => {
            const mockRefetch = vi.fn();
            useWidgetLayoutMock.mockReturnValue({
                ...mockHookReturnValue,
                refetch: mockRefetch,
            });

            render(
                <MockedProvider mocks={mocks}>
                    <TestGrid />
                </MockedProvider>,
            );

            const addButton = screen.getByTestId('add-widget');
            fireEvent.click(addButton);

            const createButton = screen.getByTestId('create-widget');
            fireEvent.click(createButton);

            await waitFor(() => {
                expect(mockRefetch).toHaveBeenCalled();
            });
        });

        it('should handle widget updates', async () => {
            const mockRefetch = vi.fn();
            useWidgetLayoutMock.mockReturnValue({
                ...mockHookReturnValue,
                refetch: mockRefetch,
            });

            render(
                <MockedProvider mocks={mocks}>
                    <TestGrid />
                </MockedProvider>,
            );

            const editButton = screen.getByTestId('edit-widget-1');
            fireEvent.click(editButton);

            const updateButton = screen.getByTestId('update-widget');
            fireEvent.click(updateButton);

            await waitFor(() => {
                expect(mockRefetch).toHaveBeenCalled();
            });
        });

        it('should reset editing state after successful update', async () => {
            render(
                <MockedProvider mocks={mocks}>
                    <TestGrid />
                </MockedProvider>,
            );

            const editButton = screen.getByTestId('edit-widget-1');
            fireEvent.click(editButton);

            let widgetForm = screen.getByTestId('widget-form');
            expect(widgetForm).toHaveAttribute('data-editing', 'true');

            const updateButton = screen.getByTestId('update-widget');
            fireEvent.click(updateButton);

            await waitFor(() => {
                widgetForm = screen.getByTestId('widget-form');
            });
        });
    });

    describe('Multiple Widgets', () => {
        it('should render multiple widgets correctly', () => {
            const multipleWidgets = {
                widgets: [
                    mockWidget,
                    {
                        ...mockWidget,
                        id: 'widget-2',
                        type: 'weather',
                        title: 'Weather Widget',
                        x: 4,
                        y: 0,
                    },
                    {
                        ...mockWidget,
                        id: 'widget-3',
                        type: 'notes',
                        title: 'Notes Widget',
                        x: 0,
                        y: 2,
                    },
                ],
            };

            useWidgetLayoutMock.mockReturnValue({
                ...mockHookReturnValue,
                widgetsData: multipleWidgets,
            });

            render(
                <MockedProvider mocks={mocks}>
                    <TestGrid />
                </MockedProvider>,
            );

            expect(screen.getByTestId('widget-widget-1')).toBeInTheDocument();
            expect(screen.getByTestId('widget-widget-2')).toBeInTheDocument();
            expect(screen.getByTestId('widget-widget-3')).toBeInTheDocument();

            expect(screen.getByTestId('widget-widget-1')).toHaveAttribute(
                'data-widget-type',
                'clock',
            );
            expect(screen.getByTestId('widget-widget-2')).toHaveAttribute(
                'data-widget-type',
                'weather',
            );
            expect(screen.getByTestId('widget-widget-3')).toHaveAttribute(
                'data-widget-type',
                'notes',
            );
        });
    });

    describe('Form State Management', () => {
        it('should manage form visibility correctly', () => {
            render(
                <MockedProvider mocks={mocks}>
                    <TestGrid />
                </MockedProvider>,
            );

            let widgetForm = screen.getByTestId('widget-form');
            expect(widgetForm).toHaveAttribute('data-open', 'false');

            const addButton = screen.getByTestId('add-widget');
            fireEvent.click(addButton);

            widgetForm = screen.getByTestId('widget-form');
            expect(widgetForm).toHaveAttribute('data-open', 'true');
            expect(widgetForm).toHaveAttribute('data-editing', 'false');
        });

        it('should differentiate between creating and editing modes', () => {
            render(
                <MockedProvider mocks={mocks}>
                    <TestGrid />
                </MockedProvider>,
            );

            const addButton = screen.getByTestId('add-widget');
            fireEvent.click(addButton);

            let widgetForm = screen.getByTestId('widget-form');
            expect(widgetForm).toHaveAttribute('data-editing', 'false');

            const editButton = screen.getByTestId('edit-widget-1');
            fireEvent.click(editButton);

            widgetForm = screen.getByTestId('widget-form');
            expect(widgetForm).toHaveAttribute('data-editing', 'true');
        });
    });
});
