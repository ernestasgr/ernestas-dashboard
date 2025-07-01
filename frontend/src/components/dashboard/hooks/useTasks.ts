import {
    useCreateTaskMutation,
    useDeleteTaskMutation,
    useGetTaskCategoriesQuery,
    useGetTaskHierarchyQuery,
    useReorderTaskMutation,
    useToggleTaskCompletionMutation,
    useUpdateTaskMutation,
} from '@/generated/Tasks.generated';
import {
    CreateTaskInput,
    ReorderTaskInput,
    TaskType,
    TasksFilterInput,
    UpdateTaskInput,
} from '@/generated/types';
import { ApolloError } from '@apollo/client';
import { useCallback, useMemo } from 'react';

export interface Task {
    id: string;
    text: string;
    completed: boolean;
    category: string;
    userId: string;
    widgetId?: string;
    createdAt: Date;
    updatedAt: Date;
    priority: number;
    dueDate?: Date;
    description?: string;
    parentTaskId?: number;
    displayOrder: number;
    subTasks?: Task[];
    level?: number; // For hierarchy display
}

export interface UseTasksReturn {
    tasks: Task[];
    categories: string[];
    loading: boolean;
    error: ApolloError | undefined;
    createTask: (
        taskData: Omit<
            Task,
            'id' | 'createdAt' | 'updatedAt' | 'userId' | 'subTasks'
        >,
    ) => Promise<void>;
    updateTask: (
        id: string,
        taskData: Partial<
            Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'subTasks'>
        >,
    ) => Promise<void>;
    toggleTaskCompletion: (id: string) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    reorderTask: (
        taskId: string,
        newDisplayOrder: number,
        newParentTaskId?: number,
    ) => Promise<void>;
    getTaskById: (id: string) => Task | undefined;
    getFilteredTasks: (
        widgetId?: string,
        categoryFilter?: string,
        completedFilter?: boolean,
        searchFilter?: string,
    ) => Task[];
    getTaskHierarchy: (widgetId?: string) => Task[];
}

const convertTask = (taskType: TaskType): Task => ({
    id: taskType.id,
    text: taskType.text,
    completed: taskType.completed,
    category: taskType.category,
    userId: taskType.userId,
    widgetId: taskType.widgetId ? taskType.widgetId.toString() : undefined,
    createdAt: new Date(taskType.createdAt as string),
    updatedAt: new Date(taskType.updatedAt as string),
    priority: taskType.priority,
    dueDate: taskType.dueDate
        ? new Date(taskType.dueDate as string)
        : undefined,
    description: taskType.description ?? undefined,
    parentTaskId: taskType.parentTaskId ?? undefined,
    displayOrder: taskType.displayOrder,
    subTasks: taskType.subTasks?.map(convertTask) ?? undefined,
});

export const useTasks = (filter?: TasksFilterInput): UseTasksReturn => {
    const {
        data: categoriesData,
        loading: categoriesLoading,
        error: categoriesError,
    } = useGetTaskCategoriesQuery({
        fetchPolicy: 'cache-and-network',
    });

    const [createTaskMutation] = useCreateTaskMutation();
    const [updateTaskMutation] = useUpdateTaskMutation();
    const [toggleTaskCompletionMutation] = useToggleTaskCompletionMutation();
    const [deleteTaskMutation] = useDeleteTaskMutation();
    const [reorderTaskMutation] = useReorderTaskMutation();

    const {
        data: hierarchyData,
        loading: hierarchyLoading,
        error: hierarchyError,
        refetch: refetchHierarchy,
    } = useGetTaskHierarchyQuery({
        variables: { filter },
        fetchPolicy: 'cache-and-network',
    });

    // Extract all tasks from hierarchy (flattened) for search/filter operations
    const tasks = useMemo(() => {
        const flattenTasks = (tasks: Task[]): Task[] => {
            const result: Task[] = [];
            for (const task of tasks) {
                result.push(task);
                if (task.subTasks) {
                    result.push(...flattenTasks(task.subTasks));
                }
            }
            return result;
        };

        const hierarchyTasks =
            hierarchyData?.taskHierarchy.map(convertTask) ?? [];
        return flattenTasks(hierarchyTasks);
    }, [hierarchyData?.taskHierarchy]);

    const categories = useMemo(() => {
        return categoriesData?.taskCategories ?? [];
    }, [categoriesData?.taskCategories]);

    const createTask = useCallback(
        async (
            taskData: Omit<
                Task,
                'id' | 'createdAt' | 'updatedAt' | 'userId' | 'subTasks'
            >,
        ) => {
            const input: CreateTaskInput = {
                text: taskData.text,
                category: taskData.category,
                description: taskData.description,
                priority: taskData.priority,
                dueDate: taskData.dueDate?.toISOString(),
                widgetId: taskData.widgetId,
                parentTaskId: taskData.parentTaskId,
                displayOrder: taskData.displayOrder,
            };

            await createTaskMutation({
                variables: { input },
                onCompleted: () => {
                    void refetchHierarchy();
                },
            });
        },
        [createTaskMutation, refetchHierarchy],
    );

    const updateTask = useCallback(
        async (
            id: string,
            taskData: Partial<
                Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>
            >,
        ) => {
            const input: UpdateTaskInput = {
                id: parseInt(id, 10),
                ...(taskData.text !== undefined && { text: taskData.text }),
                ...(taskData.category !== undefined && {
                    category: taskData.category,
                }),
                ...(taskData.description !== undefined && {
                    description: taskData.description,
                }),
                ...(taskData.priority !== undefined && {
                    priority: taskData.priority,
                }),
                ...(taskData.dueDate && {
                    dueDate: taskData.dueDate.toISOString(),
                }),
                ...(taskData.completed !== undefined && {
                    completed: taskData.completed,
                }),
            };

            await updateTaskMutation({
                variables: { input },
                onCompleted: () => {
                    void refetchHierarchy();
                },
            });
        },
        [updateTaskMutation, refetchHierarchy],
    );

    const toggleTaskCompletion = useCallback(
        async (id: string) => {
            await toggleTaskCompletionMutation({
                variables: { id: parseInt(id, 10) },
                onCompleted: () => {
                    void refetchHierarchy();
                },
            });
        },
        [toggleTaskCompletionMutation, refetchHierarchy],
    );

    const deleteTask = useCallback(
        async (id: string) => {
            await deleteTaskMutation({
                variables: { id: parseInt(id, 10) },
                onCompleted: () => {
                    void refetchHierarchy();
                },
            });
        },
        [deleteTaskMutation, refetchHierarchy],
    );

    const reorderTask = useCallback(
        async (
            taskId: string,
            newDisplayOrder: number,
            newParentTaskId?: number,
        ) => {
            const input: ReorderTaskInput = {
                taskId: parseInt(taskId, 10),
                newDisplayOrder,
                newParentTaskId,
            };

            await reorderTaskMutation({
                variables: { input },
                onCompleted: () => {
                    void refetchHierarchy();
                },
            });
        },
        [reorderTaskMutation, refetchHierarchy],
    );

    const getTaskById = useCallback(
        (id: string) => {
            return tasks.find((task) => task.id === id);
        },
        [tasks],
    );

    const getFilteredTasks = useCallback(
        (
            widgetId?: string,
            categoryFilter?: string,
            completedFilter?: boolean,
            searchFilter?: string,
        ) => {
            let filtered = tasks;

            if (widgetId !== undefined) {
                filtered = filtered.filter(
                    (task) => task.widgetId === widgetId,
                );
            }

            if (categoryFilter) {
                filtered = filtered.filter(
                    (task) => task.category === categoryFilter,
                );
            }

            if (completedFilter !== undefined) {
                filtered = filtered.filter(
                    (task) => task.completed === completedFilter,
                );
            }

            if (searchFilter) {
                const search = searchFilter.toLowerCase();
                filtered = filtered.filter(
                    (task) =>
                        task.text.toLowerCase().includes(search) ||
                        task.category.toLowerCase().includes(search) ||
                        task.description?.toLowerCase().includes(search),
                );
            }

            return filtered.sort(
                (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
            );
        },
        [tasks],
    );

    const getTaskHierarchy = useCallback(
        (widgetId?: string) => {
            if (!hierarchyData?.taskHierarchy) return [];

            let filtered = hierarchyData.taskHierarchy.map(convertTask);

            if (widgetId) {
                // Filter root tasks by widgetId, keeping hierarchy intact
                filtered = filtered.filter(
                    (task) => task.widgetId === widgetId,
                );
            }

            return filtered;
        },
        [hierarchyData],
    );

    return {
        tasks,
        categories,
        loading: categoriesLoading || hierarchyLoading,
        error: categoriesError ?? hierarchyError,
        createTask,
        updateTask,
        toggleTaskCompletion,
        deleteTask,
        getTaskById,
        getFilteredTasks,
        reorderTask,
        getTaskHierarchy,
    };
};
