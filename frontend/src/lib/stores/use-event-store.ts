import { create } from 'zustand';

export type EventCallback<Payload = unknown> = (payload?: Payload) => void;

export interface EventStore {
    listeners: Partial<Record<string, Set<EventCallback>>>;
    subscribe: (event: string, fn: EventCallback) => () => void;
    trigger: (event: string, payload?: unknown) => void;
    clear: (event: string) => void;
}

export const useEventStore = create<EventStore>((set, get) => ({
    listeners: {},

    subscribe: (event, fn) => {
        set((state) => {
            const next = new Set(state.listeners[event] ?? []);
            next.add(fn);
            return {
                listeners: {
                    ...state.listeners,
                    [event]: next,
                },
            };
        });

        return () => {
            set((state) => {
                const current =
                    state.listeners[event] ?? new Set<EventCallback>();
                const next = new Set(current);
                next.delete(fn);
                if (next.size === 0) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { [event]: _, ...rest } = state.listeners;
                    return { listeners: rest };
                }
                return {
                    listeners: {
                        ...state.listeners,
                        [event]: next,
                    },
                };
            });
        };
    },

    trigger: (event, payload) => {
        const listeners = get().listeners[event];
        if (!(listeners && listeners.size > 0)) return;
        listeners.forEach((fn) => {
            try {
                fn(payload);
            } catch (err) {
                // Isolate listener errors so one faulty listener doesn't break others
                console.error(`[event:${event}] listener error:`, err);
            }
        });
    },

    clear: (event) => {
        set((state) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [event]: _, ...rest } = state.listeners;
            return { listeners: rest };
        });
    },
}));

export function createTypedEventHelpers<
    Events extends Record<string, unknown>,
>() {
    return {
        on<K extends keyof Events & string>(
            event: K,
            fn: (payload: Events[K]) => void,
        ) {
            return useEventStore
                .getState()
                .subscribe(event, fn as unknown as EventCallback);
        },
        emit<K extends keyof Events & string>(event: K, payload: Events[K]) {
            useEventStore.getState().trigger(event, payload);
        },
        clear(event: keyof Events & string) {
            useEventStore.getState().clear(event);
        },
    };
}
