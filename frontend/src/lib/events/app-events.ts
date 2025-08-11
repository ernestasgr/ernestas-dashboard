import { createTypedEventHelpers } from '@/lib/stores/use-event-store';

export interface AppEventMap {
    [key: string]: unknown;
    refresh: undefined;
    'auth:logout': undefined;
    'auth:failure': { reason?: string };
    'widget:layout:changed': {
        id: string;
        x: number;
        y: number;
        width: number;
        height: number;
    };
    'notes:synced': { widgetId: string; ts: number };
}

export const appEvents = createTypedEventHelpers<AppEventMap>();
