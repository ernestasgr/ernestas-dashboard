import type { Widget } from '@/generated/types';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface LayoutEntry {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface WidgetStoreState {
    widgets: Widget[];
    layout: Partial<Record<string, LayoutEntry>>;
    loading: boolean;
    lastError?: string | null;
    dragging: boolean;
}

export interface WidgetStoreActions {
    setWidgets: (widgets: Widget[]) => void;
    upsertWidget: (widget: Widget) => void;
    removeWidget: (id: string) => void;

    updateLayoutLocal: (id: string, layout: LayoutEntry) => void;

    setLoading: (loading: boolean) => void;
    setLastError: (message: string | null) => void;
    setDragging: (dragging: boolean) => void;
    reset: () => void;
}

export type WidgetStore = WidgetStoreState & WidgetStoreActions;

export const useWidgetStore = create<WidgetStore>()(
    subscribeWithSelector((set, get) => ({
        widgets: [],
        layout: {},
        loading: false,
        lastError: null,
        dragging: false,

        setWidgets: (widgets) => {
            const currentLayout = get().layout;
            const mergedLayout: typeof currentLayout = { ...currentLayout };
            for (const w of widgets) {
                // Preserve any local override for this widget; otherwise seed from server
                mergedLayout[w.id] ??= {
                    x: w.x,
                    y: w.y,
                    width: w.width,
                    height: w.height,
                };
            }
            set({ widgets, layout: mergedLayout });
        },

        upsertWidget: (widget) => {
            set((state) => {
                const idx = state.widgets.findIndex((w) => w.id === widget.id);
                const widgets = [...state.widgets];
                if (idx === -1) widgets.push(widget);
                else widgets[idx] = widget;
                const layout = {
                    ...state.layout,
                    [widget.id]: {
                        x: widget.x,
                        y: widget.y,
                        width: widget.width,
                        height: widget.height,
                    },
                };
                return { widgets, layout };
            });
        },

        removeWidget: (id) => {
            set((state) => {
                const widgets = state.widgets.filter((w) => w.id !== id);
                const { [id]: _, ...rest } = state.layout; // eslint-disable-line @typescript-eslint/no-unused-vars
                return { widgets, layout: rest };
            });
        },

        updateLayoutLocal: (id, layout) => {
            set((state) => ({ layout: { ...state.layout, [id]: layout } }));
        },

        setLoading: (loading) => {
            set({ loading });
        },
        setLastError: (message) => {
            set({ lastError: message });
        },

        setDragging: (dragging) => {
            set({ dragging });
        },

        reset: () => {
            set({
                widgets: [],
                layout: {},
                loading: false,
                lastError: null,
                dragging: false,
            });
        },
    })),
);
