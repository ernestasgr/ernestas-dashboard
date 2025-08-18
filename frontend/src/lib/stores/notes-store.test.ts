import { describe, expect, it } from 'vitest';
import { useNotesStore } from './notes-store';

const wid = 'widget-1';

describe('notes-store auto-sync', () => {
    it('enable/disable auto sync toggles config and flags', () => {
        const store = useNotesStore;

        store.getState().reset(wid);
        let slice = store.getState().notesByWidgetId[wid];
        expect(slice.autoSyncConfig).toBeNull();
        expect(slice.hasAutoSynced).toBe(false);

        store.getState().enableAutoSync(wid, 'http://localhost', 'key');
        slice = store.getState().notesByWidgetId[wid];
        expect(slice.autoSyncConfig).toEqual({
            apiUrl: 'http://localhost',
            authKey: 'key',
        });
        expect(slice.hasAutoSynced).toBe(false);

        store.getState().markAutoSynced(wid);
        slice = store.getState().notesByWidgetId[wid];
        expect(slice.hasAutoSynced).toBe(true);

        store.getState().disableAutoSync(wid);
        slice = store.getState().notesByWidgetId[wid];
        expect(slice.autoSyncConfig).toBeNull();
        expect(slice.hasAutoSynced).toBe(false);
    });
});
