'use client';

import {
    CheckSquare,
    Clock,
    CloudSun,
    GripVertical,
    StickyNote,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import GridLayout from 'react-grid-layout';

const ClockWidget = () => {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, []);

    return (
        <div className='group relative h-full overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl dark:border-slate-700 dark:from-blue-900/20 dark:via-blue-800/30 dark:to-blue-700/40'>
            <div className='drag-handle absolute top-2 right-2 cursor-move opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
                <GripVertical className='h-5 w-5 text-blue-600 dark:text-blue-400' />
            </div>
            <div className='flex h-full flex-col items-center justify-center p-6'>
                <div className='mb-3 flex items-center justify-center rounded-full bg-blue-200/50 p-3 dark:bg-blue-800/50'>
                    <Clock className='h-8 w-8 text-blue-700 dark:text-blue-300' />
                </div>
                <div className='text-4xl font-bold text-blue-800 dark:text-blue-200'>
                    {time.toLocaleTimeString()}
                </div>
                <div className='mt-2 text-sm font-medium text-blue-600 dark:text-blue-400'>
                    {time.toLocaleDateString()}
                </div>
            </div>
        </div>
    );
};

const WeatherWidget = () => {
    return (
        <div className='group relative h-full overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-green-50 via-green-100 to-green-200 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl dark:border-slate-700 dark:from-green-900/20 dark:via-green-800/30 dark:to-green-700/40'>
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
                            Weather
                        </h3>
                    </div>
                    <div className='space-y-1'>
                        <div className='text-3xl font-bold text-green-700 dark:text-green-300'>
                            22°C
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

const NotesWidget = () => {
    const [notes, setNotes] = useState('Click to add notes...');

    return (
        <div className='group relative h-full overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-200 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl dark:border-slate-700 dark:from-yellow-900/20 dark:via-yellow-800/30 dark:to-yellow-700/40'>
            <div className='drag-handle absolute top-2 right-2 cursor-move opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
                <GripVertical className='h-5 w-5 text-yellow-600 dark:text-yellow-400' />
            </div>
            <div className='flex h-full flex-col p-6'>
                <div className='mb-4 flex items-center space-x-3'>
                    <div className='flex items-center justify-center rounded-full bg-yellow-200/50 p-2 dark:bg-yellow-800/50'>
                        <StickyNote className='h-6 w-6 text-yellow-700 dark:text-yellow-300' />
                    </div>
                    <h3 className='text-lg font-semibold text-yellow-800 dark:text-yellow-200'>
                        Quick Notes
                    </h3>
                </div>
                <textarea
                    value={notes}
                    onChange={(e) => {
                        setNotes(e.target.value);
                    }}
                    className='flex-1 resize-none rounded-lg border border-yellow-300/50 bg-yellow-50/80 p-3 text-sm text-yellow-800 placeholder-yellow-500 backdrop-blur-sm transition-all focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 focus:outline-none dark:border-yellow-600/30 dark:bg-yellow-900/20 dark:text-yellow-200 dark:placeholder-yellow-400'
                    placeholder='Add your notes here...'
                />
            </div>
        </div>
    );
};

const TaskWidget = () => {
    const [tasks, setTasks] = useState([
        { id: 1, text: 'Review dashboard design', completed: false },
        { id: 2, text: 'Update documentation', completed: true },
        { id: 3, text: 'Test new features', completed: false },
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
            <div className='drag-handle absolute top-2 right-2 cursor-move opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
                <GripVertical className='h-5 w-5 text-purple-600 dark:text-purple-400' />
            </div>
            <div className='flex h-full flex-col p-6'>
                <div className='mb-4 flex items-center space-x-3'>
                    <div className='flex items-center justify-center rounded-full bg-purple-200/50 p-2 dark:bg-purple-800/50'>
                        <CheckSquare className='h-6 w-6 text-purple-700 dark:text-purple-300' />
                    </div>
                    <h3 className='text-lg font-semibold text-purple-800 dark:text-purple-200'>
                        Tasks
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
                            <span
                                className={`flex-1 text-sm transition-all ${task.completed ? 'text-purple-500 line-through dark:text-purple-400' : 'text-purple-700 dark:text-purple-300'}`}
                            >
                                {task.text}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const MyGrid = () => {
    const [windowWidth, setWindowWidth] = useState(1200);
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
    const layout = [
        { i: 'clock', x: 0, y: 0, w: 3, h: 4 },
        { i: 'weather', x: 3, y: 0, w: 3, h: 4 },
        { i: 'notes', x: 6, y: 0, w: 3, h: 4 },
        { i: 'tasks', x: 9, y: 0, w: 3, h: 4 },
    ];
    return (
        <div className='w-full p-4'>
            <GridLayout
                className='layout'
                layout={layout}
                cols={12}
                rowHeight={60}
                width={windowWidth}
                isDraggable={true}
                isResizable={true}
                draggableHandle='.drag-handle'
            >
                <div key='clock'>
                    <ClockWidget />
                </div>
                <div key='weather'>
                    <WeatherWidget />
                </div>
                <div key='notes'>
                    <NotesWidget />
                </div>
                <div key='tasks'>
                    <TaskWidget />
                </div>
            </GridLayout>
        </div>
    );
};

export default MyGrid;
