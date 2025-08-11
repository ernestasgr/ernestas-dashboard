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
import { Task as StoreTask, useTasksStore } from '@/lib/stores/tasks-store';
import { ApolloError } from '@apollo/client';
import { useCallback, useEffect, useMemo } from 'react';

export type Task = StoreTask;

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
    const categories = useTasksStore((s) => s.categories);
    const hierarchy = useTasksStore((s) => s.hierarchy);
    const setCategories = useTasksStore((s) => s.setCategories);
    const setHierarchy = useTasksStore((s) => s.setHierarchy);
    const reorderTaskLocal = useTasksStore((s) => s.reorderTaskLocal);

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

    useEffect(() => {
        if (categoriesData?.taskCategories) {
            setCategories(categoriesData.taskCategories);
        }
    }, [categoriesData?.taskCategories, setCategories]);

    useEffect(() => {
        if (hierarchyData?.taskHierarchy) {
            const items = hierarchyData.taskHierarchy.map(convertTask);
            setHierarchy(items);
        }
    }, [hierarchyData?.taskHierarchy, setHierarchy]);

    const tasks = useMemo(() => {
        const flatten = (items: Task[]): Task[] => {
            const out: Task[] = [];
            for (const t of items) {
                out.push(t);
                if (t.subTasks?.length) out.push(...flatten(t.subTasks));
            }
            return out;
        };
        return flatten(hierarchy);
    }, [hierarchy]);

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

            reorderTaskLocal(taskId, newDisplayOrder, newParentTaskId);
            await reorderTaskMutation({
                variables: { input },
                onCompleted: () => {
                    void refetchHierarchy();
                },
            });
        },
        [reorderTaskMutation, refetchHierarchy, reorderTaskLocal],
    );

    const getTaskById = useCallback(
        (id: string) => tasks.find((t) => t.id === id),
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
                filtered = filtered.filter((t) => t.widgetId === widgetId);
            }
            if (categoryFilter) {
                filtered = filtered.filter(
                    (t) => t.category === categoryFilter,
                );
            }
            if (completedFilter !== undefined) {
                filtered = filtered.filter(
                    (t) => t.completed === completedFilter,
                );
            }
            if (searchFilter) {
                const escaped = searchFilter.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    '\\$&',
                );
                const re = new RegExp(escaped, 'i');
                filtered = filtered.filter(
                    (t) =>
                        re.test(t.text) ||
                        re.test(t.category) ||
                        (t.description ? re.test(t.description) : false),
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
            if (!widgetId) return hierarchy;
            return hierarchy.filter((t) => t.widgetId === widgetId);
        },
        [hierarchy],
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
