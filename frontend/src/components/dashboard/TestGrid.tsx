'use client';

import { Button } from '@/components/ui/button';
import {
    ClockConfig,
    NotesConfig,
    TasksConfig,
    useGetWidgetsQuery,
    useMeQuery,
    useUpdateWidgetLayoutMutation,
    WeatherConfig,
    Widget,
} from '@/generated/graphql';
import {
    CheckSquare,
    Clock,
    CloudSun,
    GripVertical,
    Plus,
    StickyNote,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import GridLayout from 'react-grid-layout';
import { WidgetActions } from './WidgetActions';
import { WidgetForm } from './WidgetForm';

interface WidgetProps {
    widget: Widget;
    onEdit: (widget: Widget) => void;
    onDelete: (widgetId: string) => void;
}

const ClockWidget = ({ widget, onEdit, onDelete }: WidgetProps) => {
    const [time, setTime] = useState(new Date());
    const config = widget.config as ClockConfig | null;

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, []);

    const formatTime = (date: Date) => {
        const options: Intl.DateTimeFormatOptions = {
            timeZone: config?.timezone ?? 'UTC',
            hour12: config?.format === '12h',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        };
        return date.toLocaleTimeString(undefined, options);
    };

    return (
        <div className='group relative h-full overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl dark:border-slate-700 dark:from-blue-900/20 dark:via-blue-800/30 dark:to-blue-700/40'>
            <WidgetActions
                widget={widget}
                onEdit={onEdit}
                onDelete={onDelete}
            />
            <div className='drag-handle absolute top-2 right-2 cursor-move opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
                <GripVertical className='h-5 w-5 text-blue-600 dark:text-blue-400' />
            </div>
            <div className='flex h-full flex-col items-center justify-center p-6'>
                <div className='mb-3 flex items-center justify-center rounded-full bg-blue-200/50 p-3 dark:bg-blue-800/50'>
                    <Clock className='h-8 w-8 text-blue-700 dark:text-blue-300' />
                </div>
                <div className='text-center'>
                    <h3 className='mb-2 text-lg font-semibold text-blue-800 dark:text-blue-200'>
                        {widget.title}
                    </h3>
                    <div className='text-4xl font-bold text-blue-800 dark:text-blue-200'>
                        {formatTime(time)}
                    </div>
                    <div className='mt-2 text-sm font-medium text-blue-600 dark:text-blue-400'>
                        {time.toLocaleDateString()}
                    </div>
                </div>
            </div>
        </div>
    );
};

const WeatherWidget = ({ widget, onEdit, onDelete }: WidgetProps) => {
    const config = widget.config as WeatherConfig | null;

    return (
        <div className='group relative h-full overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-green-50 via-green-100 to-green-200 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl dark:border-slate-700 dark:from-green-900/20 dark:via-green-800/30 dark:to-green-700/40'>
            <WidgetActions
                widget={widget}
                onEdit={onEdit}
                onDelete={onDelete}
            />
            <div className='drag-handle absolute top-2 right-2 cursor-move opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
                <GripVertical className='h-5 w-5 text-green-600 dark:text-green-400' />
            </div>
            <div className='flex h-full items-center justify-between p-6'>
                <div className='flex flex-col space-y-4'>
                    <div className='flex items-center space-x-3'>
                        <div className='flex items-center justify-center rounded-full bg-green-200/50 p-2 dark:bg-green-800/50'>
                            <CloudSun className='h-6 w-6 text-green-700 dark:text-green-300' />
                        </div>
                        <h3 className='text-lg font-semibold text-green-800 dark:text-green-200'>
                            {widget.title}
                        </h3>
                    </div>
                    <div className='space-y-1'>
                        <div className='text-3xl font-bold text-green-700 dark:text-green-300'>
                            22°{config?.units === 'imperial' ? 'F' : 'C'}
                        </div>
                        <div className='text-sm font-medium text-green-600 dark:text-green-400'>
                            {config?.location ?? 'Unknown Location'}
                        </div>
                        <div className='text-sm font-medium text-green-600 dark:text-green-400'>
                            Sunny & Clear
                        </div>
                    </div>
                </div>
                <div className='text-5xl'>☀️</div>
            </div>
        </div>
    );
};

const NotesWidget = ({ widget, onEdit, onDelete }: WidgetProps) => {
    const config = widget.config as NotesConfig | null;
    const [notes, setNotes] = useState(
        config?.content ?? 'Click to add notes...',
    );

    return (
        <div className='group relative h-full overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-200 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl dark:border-slate-700 dark:from-yellow-900/20 dark:via-yellow-800/30 dark:to-yellow-700/40'>
            <WidgetActions
                widget={widget}
                onEdit={onEdit}
                onDelete={onDelete}
            />
            <div className='drag-handle absolute top-2 right-2 cursor-move opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
                <GripVertical className='h-5 w-5 text-yellow-600 dark:text-yellow-400' />
            </div>
            <div className='flex h-full flex-col p-6'>
                <div className='mb-4 flex items-center space-x-3'>
                    <div className='flex items-center justify-center rounded-full bg-yellow-200/50 p-2 dark:bg-yellow-800/50'>
                        <StickyNote className='h-6 w-6 text-yellow-700 dark:text-yellow-300' />
                    </div>
                    <h3 className='text-lg font-semibold text-yellow-800 dark:text-yellow-200'>
                        {widget.title}
                    </h3>
                </div>
                <textarea
                    value={notes}
                    onChange={(e) => {
                        if (
                            !config?.maxLength ||
                            e.target.value.length <= config.maxLength
                        ) {
                            setNotes(e.target.value);
                        }
                    }}
                    className='flex-1 resize-none rounded-lg border border-yellow-300/50 bg-yellow-50/80 p-3 text-sm text-yellow-800 placeholder-yellow-500 backdrop-blur-sm transition-all focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 focus:outline-none dark:border-yellow-600/30 dark:bg-yellow-900/20 dark:text-yellow-200 dark:placeholder-yellow-400'
                    placeholder='Add your notes here...'
                    maxLength={config?.maxLength ?? undefined}
                />
                {config?.maxLength && (
                    <div className='mt-2 text-xs text-yellow-600 dark:text-yellow-400'>
                        {notes.length}/{config.maxLength} characters
                    </div>
                )}
            </div>
        </div>
    );
};

const TaskWidget = ({ widget, onEdit, onDelete }: WidgetProps) => {
    const config = widget.config as TasksConfig | null;
    const [tasks, setTasks] = useState([
        {
            id: 1,
            text: 'Review dashboard design',
            completed: false,
            category: config?.defaultCategory ?? 'personal',
        },
        {
            id: 2,
            text: 'Update documentation',
            completed: true,
            category: 'work',
        },
        {
            id: 3,
            text: 'Test new features',
            completed: false,
            category: 'urgent',
        },
    ]);

    const toggleTask = (id: number) => {
        setTasks(
            tasks.map((task) =>
                task.id === id ? { ...task, completed: !task.completed } : task,
            ),
        );
    };

    return (
        <div className='group relative h-full overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl dark:border-slate-700 dark:from-purple-900/20 dark:via-purple-800/30 dark:to-purple-700/40'>
            <WidgetActions
                widget={widget}
                onEdit={onEdit}
                onDelete={onDelete}
            />
            <div className='drag-handle absolute top-2 right-2 cursor-move opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
                <GripVertical className='h-5 w-5 text-purple-600 dark:text-purple-400' />
            </div>
            <div className='flex h-full flex-col p-6'>
                <div className='mb-4 flex items-center space-x-3'>
                    <div className='flex items-center justify-center rounded-full bg-purple-200/50 p-2 dark:bg-purple-800/50'>
                        <CheckSquare className='h-6 w-6 text-purple-700 dark:text-purple-300' />
                    </div>
                    <h3 className='text-lg font-semibold text-purple-800 dark:text-purple-200'>
                        {widget.title}
                    </h3>
                </div>
                <div className='flex-1 space-y-3 overflow-y-auto'>
                    {tasks.map((task) => (
                        <div
                            key={task.id}
                            className='flex items-center space-x-3 rounded-lg bg-purple-100/50 p-3 transition-all hover:bg-purple-200/50 dark:bg-purple-800/20 dark:hover:bg-purple-700/30'
                        >
                            <input
                                type='checkbox'
                                checked={task.completed}
                                onChange={() => {
                                    toggleTask(task.id);
                                }}
                                className='h-4 w-4 rounded border-purple-300 text-purple-600 focus:ring-purple-500 dark:border-purple-600 dark:bg-purple-800/50'
                            />
                            <div className='flex-1'>
                                <span
                                    className={`text-sm transition-all ${task.completed ? 'text-purple-500 line-through dark:text-purple-400' : 'text-purple-700 dark:text-purple-300'}`}
                                >
                                    {task.text}
                                </span>
                                {config?.categories &&
                                    config.categories.includes(
                                        task.category,
                                    ) && (
                                        <div className='mt-1 text-xs text-purple-600 dark:text-purple-400'>
                                            {task.category}
                                        </div>
                                    )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const renderWidget = (
    widget: Widget,
    onEdit: (widget: Widget) => void,
    onDelete: (widgetId: string) => void,
) => {
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

const MyGrid = () => {
    const [windowWidth, setWindowWidth] = useState(1200);
    const [showWidgetForm, setShowWidgetForm] = useState(false);
    const [editingWidget, setEditingWidget] = useState<Widget | null>(null);
    const [, setPreviousLayout] = useState<GridLayout.Layout[]>([]);
    const layoutUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastSavedLayoutRef = useRef<GridLayout.Layout[]>([]);

    const { data: meData } = useMeQuery();
    const [updateWidgetLayout] = useUpdateWidgetLayoutMutation();

    const {
        data: widgetsData,
        loading,
        error,
        refetch,
    } = useGetWidgetsQuery({
        variables: { userId: meData?.me.email ?? '' },
        skip: !meData?.me.email,
    });

    useEffect(() => {
        const updateWidth = () => {
            setWindowWidth(window.innerWidth - 32);
        };

        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => {
            window.removeEventListener('resize', updateWidth);
        };
    }, []);
    useEffect(() => {
        if (widgetsData?.widgets) {
            const layout = widgetsData.widgets.map((widget) => ({
                i: widget.id,
                x: widget.x,
                y: widget.y,
                w: widget.width,
                h: widget.height,
            }));
            setPreviousLayout(layout);
            lastSavedLayoutRef.current = layout;
        }
    }, [widgetsData?.widgets]);

    useEffect(() => {
        return () => {
            if (layoutUpdateTimeoutRef.current) {
                clearTimeout(layoutUpdateTimeoutRef.current);
            }
        };
    }, []);
    const debouncedUpdateLayout = useCallback(
        (layout: GridLayout.Layout[]) => {
            if (layoutUpdateTimeoutRef.current) {
                clearTimeout(layoutUpdateTimeoutRef.current);
            }

            layoutUpdateTimeoutRef.current = setTimeout(() => {
                const changedItems = layout.filter((item) => {
                    const prevItem = lastSavedLayoutRef.current.find(
                        (prev) => prev.i === item.i,
                    );
                    return (
                        !prevItem ||
                        prevItem.x !== item.x ||
                        prevItem.y !== item.y ||
                        prevItem.w !== item.w ||
                        prevItem.h !== item.h
                    );
                });

                if (changedItems.length > 0) {
                    changedItems.forEach((item) => {
                        updateWidgetLayout({
                            variables: {
                                input: {
                                    id: item.i,
                                    x: item.x,
                                    y: item.y,
                                    width: item.w,
                                    height: item.h,
                                },
                            },
                            optimisticResponse: {
                                // @ts-expect-error type is deliberately excluded, because searching for the type of widget being updated takes time and so causes minor visual glitches
                                updateWidgetLayout: {
                                    __typename: 'Widget',
                                    id: item.i,
                                    x: item.x,
                                    y: item.y,
                                    width: item.w,
                                    height: item.h,
                                },
                            },
                        }).catch((error: unknown) => {
                            console.error(
                                'Error updating widget layout:',
                                error,
                            );
                        });
                    });

                    lastSavedLayoutRef.current = layout;
                }
            }, 300);
        },
        [updateWidgetLayout],
    );
    const handleLayoutChange = (layout: GridLayout.Layout[]) => {
        debouncedUpdateLayout(layout);
    };

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
            <div className='w-full p-4'>
                <div className='space-y-4 text-center'>
                    <div>No widgets available</div>
                    <Button onClick={handleAddWidget}>
                        <Plus className='mr-2 h-4 w-4' />
                        Add Your First Widget
                    </Button>
                </div>
            </div>
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
            <div className='mb-4 flex items-center justify-between'>
                <h2 className='text-2xl font-bold'>My Dashboard</h2>
                <Button onClick={handleAddWidget}>
                    <Plus className='mr-2 h-4 w-4' />
                    Add Widget
                </Button>
            </div>

            <GridLayout
                className='layout'
                layout={layout}
                cols={12}
                rowHeight={60}
                width={windowWidth}
                isDraggable={true}
                isResizable={true}
                draggableHandle='.drag-handle'
                onLayoutChange={handleLayoutChange}
            >
                {widgetsData.widgets.map((widget) => (
                    <div key={widget.id}>
                        {renderWidget(
                            widget,
                            handleEditWidget,
                            handleDeleteWidget,
                        )}
                    </div>
                ))}
            </GridLayout>

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
