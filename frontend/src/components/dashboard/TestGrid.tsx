'use client';

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
        <div className='flex h-full flex-col items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 shadow-lg'>
            <div className='text-3xl font-bold text-blue-800'>
                {time.toLocaleTimeString()}
            </div>
            <div className='mt-2 text-sm text-blue-600'>
                {time.toLocaleDateString()}
            </div>
        </div>
    );
};

const WeatherWidget = () => {
    return (
        <div className='h-full rounded-lg bg-gradient-to-br from-green-100 to-green-200 p-4 shadow-lg'>
            <div className='flex h-full items-center justify-between'>
                <div>
                    <h3 className='text-lg font-semibold text-green-800'>
                        Weather
                    </h3>
                    <div className='text-2xl font-bold text-green-700'>
                        22°C
                    </div>
                    <div className='text-sm text-green-600'>Sunny</div>
                </div>
                <div className='text-4xl'>☀️</div>
            </div>
        </div>
    );
};

const NotesWidget = () => {
    const [notes, setNotes] = useState('Click to add notes...');

    return (
        <div className='h-full rounded-lg bg-gradient-to-br from-yellow-100 to-yellow-200 p-4 shadow-lg'>
            <h3 className='mb-2 text-lg font-semibold text-yellow-800'>
                Quick Notes
            </h3>{' '}
            <textarea
                value={notes}
                onChange={(e) => {
                    setNotes(e.target.value);
                }}
                className='h-24 w-full resize-none rounded border border-yellow-300 bg-yellow-50 p-2 text-sm focus:ring-2 focus:ring-yellow-400 focus:outline-none'
                placeholder='Add your notes here...'
            />
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
        <div className='h-full rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 p-4 shadow-lg'>
            <h3 className='mb-2 text-lg font-semibold text-purple-800'>
                Tasks
            </h3>
            <div className='space-y-2'>
                {tasks.map((task) => (
                    <div key={task.id} className='flex items-center space-x-2'>
                        {' '}
                        <input
                            type='checkbox'
                            checked={task.completed}
                            onChange={() => {
                                toggleTask(task.id);
                            }}
                            className='text-purple-600'
                        />
                        <span
                            className={`text-sm ${task.completed ? 'text-gray-500 line-through' : 'text-purple-700'}`}
                        >
                            {task.text}
                        </span>
                    </div>
                ))}
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
