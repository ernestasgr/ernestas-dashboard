import { create } from 'zustand';

type EventListener = () => void;

interface EventStore {
    listeners: Record<string, Set<EventListener>>;
    subscribe: (event: string, fn: EventListener) => () => void;
    trigger: (event: string) => void;
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
                const current = state.listeners[event];
                current.delete(fn);
                if (current.size === 0) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { [event]: _, ...rest } = state.listeners;
                    return { listeners: rest };
                }
                return {
                    listeners: {
                        ...state.listeners,
                        [event]: current,
                    },
                };
            });
        };
    },

    trigger: (event) => {
        const listeners = get().listeners[event];
        listeners.forEach((fn) => {
            fn();
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
