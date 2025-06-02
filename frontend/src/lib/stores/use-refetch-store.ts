import { create } from 'zustand';

type RefetchFunction = () => void;

interface RefetchStore {
    refetchMap: Record<string, RefetchFunction>;
    setRefetch: (key: string, fn: RefetchFunction) => void;
    triggerRefetch: (key: string) => void;
    clearRefetch: (key: string) => void;
}

export const useRefetchStore = create<RefetchStore>((set, get) => ({
    refetchMap: {},

    setRefetch: (key, fn) => {
        set((state) => ({
            refetchMap: {
                ...state.refetchMap,
                [key]: fn,
            },
        }));
    },

    triggerRefetch: (key) => {
        const fn = get().refetchMap[key];
        if (fn) fn();
        else console.warn(`No refetch function registered for key: ${key}`);
    },

    clearRefetch: (key) => {
        set((state) => {
            const newMap = { ...state.refetchMap };
            delete newMap[key];
            return { refetchMap: newMap };
        });
    },
}));
