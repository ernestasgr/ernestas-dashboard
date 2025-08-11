import { beforeEach, describe, expect, it } from 'vitest';
import { useTasksStore, type Task } from './tasks-store';

const makeTask = (overrides: Partial<Task> = {}): Task => ({
    id: overrides.id ?? Math.random().toString(36).slice(2),
    text: overrides.text ?? 'task',
    completed: overrides.completed ?? false,
    category: overrides.category ?? 'personal',
    userId: overrides.userId ?? 'u1',
    widgetId: overrides.widgetId ?? 'w1',
    createdAt: overrides.createdAt ?? new Date('2025-01-01T00:00:00Z'),
    updatedAt: overrides.updatedAt ?? new Date('2025-01-01T00:00:00Z'),
    priority: overrides.priority ?? 0,
    dueDate: overrides.dueDate,
    description: overrides.description,
    parentTaskId: overrides.parentTaskId,
    displayOrder: overrides.displayOrder ?? 0,
    subTasks: overrides.subTasks,
});

describe('useTasksStore', () => {
    beforeEach(() => {
        useTasksStore.getState().reset();
    });

    it('sets categories and hierarchy', () => {
        const t1 = makeTask({ id: '1' });
        useTasksStore.getState().setCategories(['a', 'b']);
        useTasksStore.getState().setHierarchy([t1]);
        const state = useTasksStore.getState();
        expect(state.categories).toEqual(['a', 'b']);
        expect(state.hierarchy).toHaveLength(1);
    });

    it('flattens tasks tree', () => {
        const t1 = makeTask({ id: '1', text: 'root' });
        const t2 = makeTask({ id: '2', text: 'child', parentTaskId: 1 });
        const t3 = makeTask({ id: '3', text: 'grand', parentTaskId: 2 });
        t2.subTasks = [t3];
        t1.subTasks = [t2];
        useTasksStore.getState().setHierarchy([t1]);

        const flat = useTasksStore.getState().getFlatTasks();
        expect(flat.map((t) => t.id)).toEqual(['1', '2', '3']);
    });

    it('getTaskById finds tasks at any depth', () => {
        const child = makeTask({ id: 'c1' });
        const root = makeTask({ id: 'r1', subTasks: [child] });
        useTasksStore.getState().setHierarchy([root]);
        expect(useTasksStore.getState().getTaskById('c1')?.id).toBe('c1');
        expect(useTasksStore.getState().getTaskById('nope')).toBeUndefined();
    });

    it('filters by widget/category/completed/search', () => {
        const a = makeTask({
            id: 'a',
            widgetId: 'w1',
            category: 'work',
            text: 'Email Boss',
        });
        const b = makeTask({
            id: 'b',
            widgetId: 'w2',
            category: 'personal',
            text: 'Buy milk',
            completed: true,
        });
        useTasksStore.getState().setHierarchy([a, b]);

        expect(
            useTasksStore
                .getState()
                .getFilteredTasks('w1')
                .map((t) => t.id),
        ).toEqual(['a']);
        expect(
            useTasksStore
                .getState()
                .getFilteredTasks(undefined, 'personal')
                .map((t) => t.id),
        ).toEqual(['b']);
        expect(
            useTasksStore
                .getState()
                .getFilteredTasks(undefined, undefined, true)
                .map((t) => t.id),
        ).toEqual(['b']);
        expect(
            useTasksStore
                .getState()
                .getFilteredTasks(undefined, undefined, undefined, 'milk')
                .map((t) => t.id),
        ).toEqual(['b']);
    });

    it('upsertTask inserts new root and updates existing', () => {
        const t1 = makeTask({ id: '1', text: 'one' });
        useTasksStore.getState().upsertTask(t1);
        expect(useTasksStore.getState().hierarchy).toHaveLength(1);
        const updated = { ...t1, text: 'ONE!' };
        useTasksStore.getState().upsertTask(updated);
        expect(useTasksStore.getState().getTaskById('1')?.text).toBe('ONE!');
    });

    it('upsertTask inserts under parent if parentTaskId provided', () => {
        const parent = makeTask({ id: '10' });
        useTasksStore.getState().setHierarchy([parent]);
        const child = makeTask({ id: '11', parentTaskId: 10 });
        useTasksStore.getState().upsertTask(child);
        const p = useTasksStore.getState().getTaskById('10');
        expect(p?.subTasks?.some((t) => t.id === '11')).toBe(true);
    });

    it('removeTask deletes by id at any depth', () => {
        const child = makeTask({ id: 'c' });
        const root = makeTask({ id: 'r', subTasks: [child] });
        useTasksStore.getState().setHierarchy([root]);
        useTasksStore.getState().removeTask('c');
        const r = useTasksStore.getState().getTaskById('r');
        expect(r?.subTasks?.length ?? 0).toBe(0);
    });

    it('toggleCompleteLocal and reorderTaskLocal mutate local state', () => {
        const t = makeTask({ id: 'x', completed: false, displayOrder: 1 });
        useTasksStore.getState().setHierarchy([t]);
        useTasksStore.getState().toggleCompleteLocal('x');
        expect(useTasksStore.getState().getTaskById('x')?.completed).toBe(true);
        useTasksStore.getState().reorderTaskLocal('x', 5, 123);
        const x = useTasksStore.getState().getTaskById('x');
        expect(x?.displayOrder).toBe(5);
        expect(x?.parentTaskId).toBe(123);
    });
});
