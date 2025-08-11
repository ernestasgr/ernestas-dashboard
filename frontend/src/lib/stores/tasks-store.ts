import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

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
}

export interface TasksStoreState {
    categories: string[];
    hierarchy: Task[];
    loading: boolean;
    error?: string | null;
    lastError?: string | null;
    pendingMutationId?: string | null;
    rollbackSnapshot?: Task[] | null;
}

export interface TasksStoreActions {
    setCategories: (categories: string[]) => void;
    setHierarchy: (hierarchy: Task[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;

    upsertTask: (task: Task) => void;
    removeTask: (id: string) => void;
    toggleCompleteLocal: (id: string) => void;
    reorderTaskLocal: (
        taskId: string,
        newDisplayOrder: number,
        newParentTaskId?: number,
    ) => void;

    getTaskById: (id: string) => Task | undefined;
    getFlatTasks: () => Task[];
    getFilteredTasks: (
        widgetId?: string,
        categoryFilter?: string,
        completedFilter?: boolean,
        searchFilter?: string,
    ) => Task[];
    getHierarchyForWidget: (widgetId?: string) => Task[];

    reset: () => void;
}

export type TasksStore = TasksStoreState & TasksStoreActions;

const flatten = (tasks: Task[]): Task[] => {
    const out: Task[] = [];
    for (const t of tasks) {
        out.push(t);
        if (t.subTasks?.length) out.push(...flatten(t.subTasks));
    }
    return out;
};

const updateTaskTree = (
    tasks: Task[],
    predicate: (t: Task) => boolean,
    updater: (t: Task) => Task,
): Task[] => {
    return tasks.map((t) => {
        const match = predicate(t);
        const next: Task = match ? updater(t) : { ...t };
        if (t.subTasks?.length) {
            next.subTasks = updateTaskTree(t.subTasks, predicate, updater);
        }
        return next;
    });
};

const removeFromTree = (tasks: Task[], id: string): Task[] => {
    const filtered = tasks
        .filter((t) => t.id !== id)
        .map((t) => ({
            ...t,
            subTasks: t.subTasks ? removeFromTree(t.subTasks, id) : undefined,
        }));
    return filtered;
};

function extractNode(tasks: Task[], id: string): { tree: Task[]; node?: Task } {
    let found: Task | undefined;

    const walk = (arr: Task[]): Task[] => {
        const result: Task[] = [];
        for (const t of arr) {
            if (t.id === id) {
                found = t;
                continue;
            }
            const next: Task = { ...t };
            if (t.subTasks?.length) {
                next.subTasks = walk(t.subTasks);
            }
            result.push(next);
        }
        return result;
    };

    const tree = walk(tasks);
    return { tree, node: found };
}

function sortTreeByDisplayOrder(tasks: Task[]): Task[] {
    const copy = tasks.map((t) => ({ ...t }));
    copy.sort((a, b) => a.displayOrder - b.displayOrder);
    for (const t of copy) {
        if (t.subTasks?.length) {
            t.subTasks = sortTreeByDisplayOrder(t.subTasks);
        }
    }
    return copy;
}

function insertUnderParent(
    tasks: Task[],
    parentId: number | undefined,
    node: Task,
): Task[] {
    if (parentId == null) {
        const root = [...tasks, node];
        return sortTreeByDisplayOrder(root);
    }

    const walk = (arr: Task[]): Task[] => {
        return arr.map((t) => {
            const next: Task = { ...t };
            if (t.id === String(parentId)) {
                const children = [...(t.subTasks ?? []), node];
                next.subTasks = sortTreeByDisplayOrder(children);
                return next;
            }
            if (t.subTasks?.length) {
                next.subTasks = walk(t.subTasks);
            }
            return next;
        });
    };

    return walk(tasks);
}

export const useTasksStore = create<TasksStore>()(
    subscribeWithSelector((set, get) => ({
        categories: [],
        hierarchy: [],
        loading: false,
        error: null,
        lastError: null,
        pendingMutationId: null,
        rollbackSnapshot: null,

        setCategories: (categories) => {
            set({ categories });
        },
        setHierarchy: (hierarchy) => {
            set({ hierarchy });
        },
        setLoading: (loading) => {
            set({ loading });
        },
        setError: (error) => {
            set({ error });
        },

        upsertTask: (task) => {
            const byId = get().getTaskById(task.id);
            if (!byId) {
                // Insert as root if parentTaskId is not set, otherwise insert into parent's subTasks
                set((state) => {
                    const rollback = state.hierarchy;
                    if (task.parentTaskId == null) {
                        return {
                            hierarchy: [...state.hierarchy, task],
                            rollbackSnapshot: rollback,
                        };
                    }
                    // insert under parent
                    let parent: Task | undefined = undefined;
                    const flat = state.getFlatTasks();
                    for (const t of flat) {
                        if (t.id === String(task.parentTaskId)) {
                            parent = t;
                            break;
                        }
                    }
                    if (!parent)
                        return {
                            hierarchy: [...state.hierarchy],
                            rollbackSnapshot: rollback,
                        };
                    const updated = updateTaskTree(
                        state.hierarchy,
                        (t) => t.id === parent.id,
                        (t) => ({
                            ...t,
                            subTasks: [...(t.subTasks ?? []), task],
                        }),
                    );
                    return { hierarchy: updated, rollbackSnapshot: rollback };
                });
            } else {
                // Replace existing task data in-place
                set((state) => ({
                    rollbackSnapshot: state.hierarchy,
                    hierarchy: updateTaskTree(
                        state.hierarchy,
                        (t) => t.id === task.id,
                        () => task,
                    ),
                }));
            }
        },

        removeTask: (id) => {
            set((state) => ({
                rollbackSnapshot: state.hierarchy,
                hierarchy: removeFromTree(state.hierarchy, id),
            }));
        },

        toggleCompleteLocal: (id) => {
            set((state) => ({
                rollbackSnapshot: state.hierarchy,
                hierarchy: updateTaskTree(
                    state.hierarchy,
                    (t) => t.id === id,
                    (t) => ({ ...t, completed: !t.completed }),
                ),
            }));
        },

        reorderTaskLocal: (taskId, newDisplayOrder, newParentTaskId) => {
            set((state) => {
                const { tree, node } = extractNode(state.hierarchy, taskId);
                if (!node) return { hierarchy: state.hierarchy };

                const updatedNode: Task = {
                    ...node,
                    parentTaskId: newParentTaskId,
                    displayOrder: newDisplayOrder,
                };

                let placementParentId: number | undefined = undefined;
                if (newParentTaskId != null) {
                    const flatAfterRemoval = flatten(tree);
                    let exists = false;
                    for (const t of flatAfterRemoval) {
                        if (t.id === String(newParentTaskId)) {
                            exists = true;
                            break;
                        }
                    }
                    placementParentId = exists ? newParentTaskId : undefined;
                }

                const withInserted = insertUnderParent(
                    tree,
                    placementParentId,
                    updatedNode,
                );
                const sorted = sortTreeByDisplayOrder(withInserted);
                return { rollbackSnapshot: state.hierarchy, hierarchy: sorted };
            });
        },

        getTaskById: (id) => {
            const flat = get().getFlatTasks();
            for (const t of flat) {
                if (t.id === id) return t;
            }
            return undefined;
        },

        getFlatTasks: () => flatten(get().hierarchy),

        getFilteredTasks: (
            widgetId?: string,
            categoryFilter?: string,
            completedFilter?: boolean,
            searchFilter?: string,
        ) => {
            let items = get().getFlatTasks();

            if (widgetId !== undefined) {
                items = items.filter((t) => t.widgetId === widgetId);
            }
            if (categoryFilter) {
                items = items.filter((t) => t.category === categoryFilter);
            }
            if (completedFilter !== undefined) {
                items = items.filter((t) => t.completed === completedFilter);
            }
            if (searchFilter) {
                const escaped = searchFilter.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    '\\$&',
                );
                const re = new RegExp(escaped, 'i');
                items = items.filter(
                    (t) =>
                        re.test(t.text) ||
                        re.test(t.category) ||
                        (t.description ? re.test(t.description) : false),
                );
            }

            return items.sort(
                (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
            );
        },

        getHierarchyForWidget: (widgetId?: string) => {
            const items = get().hierarchy;
            if (!widgetId) return items;
            return items.filter((t) => t.widgetId === widgetId);
        },

        reset: () => {
            set({
                categories: [],
                hierarchy: [],
                loading: false,
                error: null,
                lastError: null,
                pendingMutationId: null,
                rollbackSnapshot: null,
            });
        },
    })),
);
