import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface ToastPayload {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    description?: string;
    ts: number;
}

interface UIStoreState {
    modals: Record<string, boolean>;
    skeletons: Record<string, boolean>;
    featureToggles: Record<string, boolean>;
    lastToast?: ToastPayload | null;
    lastError?: string | null;
}

interface UIStoreActions {
    openModal: (id: string) => void;
    closeModal: (id: string) => void;
    setModal: (id: string, open: boolean) => void;

    setSkeleton: (key: string, value: boolean) => void;
    clearSkeletons: () => void;

    toggleFeature: (key: string, enabled?: boolean) => void;

    setToast: (
        payload: Omit<ToastPayload, 'id' | 'ts'> & { id?: string },
    ) => void;
    notify: (payload: {
        type: ToastPayload['type'];
        message: string;
        description?: string;
    }) => void;
    clearToast: () => void;

    setError: (message: string | null) => void;
    reset: () => void;
}

export type UIStore = UIStoreState & UIStoreActions;

export const useUIStore = create<UIStore>()(
    subscribeWithSelector((set) => ({
        modals: {},
        skeletons: {},
        featureToggles: {},
        lastToast: null,
        lastError: null,

        openModal: (id) => {
            set((s) => ({ modals: { ...s.modals, [id]: true } }));
        },
        closeModal: (id) => {
            set((s) => ({ modals: { ...s.modals, [id]: false } }));
        },
        setModal: (id, open) => {
            set((s) => ({ modals: { ...s.modals, [id]: open } }));
        },

        setSkeleton: (key, value) => {
            set((s) => ({ skeletons: { ...s.skeletons, [key]: value } }));
        },
        clearSkeletons: () => {
            set({ skeletons: {} });
        },

        toggleFeature: (key, enabled) => {
            set((s) => ({
                featureToggles: {
                    ...s.featureToggles,
                    [key]: enabled ?? !s.featureToggles[key],
                },
            }));
        },

        setToast: ({ id, type, message, description }) => {
            set({
                lastToast: {
                    id: id ?? Math.random().toString(36).slice(2),
                    type,
                    message,
                    description,
                    ts: Date.now(),
                },
            });
        },
        notify: ({ type, message, description }) => {
            set({
                lastToast: {
                    id: Math.random().toString(36).slice(2),
                    type,
                    message,
                    description,
                    ts: Date.now(),
                },
            });
        },
        clearToast: () => {
            set({ lastToast: null });
        },

        setError: (message) => {
            set({ lastError: message });
        },

        reset: () => {
            set({
                modals: {},
                skeletons: {},
                featureToggles: {},
                lastToast: null,
                lastError: null,
            });
        },
    })),
);
