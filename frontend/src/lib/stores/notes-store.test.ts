import { describe, expect, it } from 'vitest';
import { getNotesWidgetStoreInstance } from './notes-store';

const wid = 'widget-1';

describe('notes-store auto-sync', () => {
    it('enable/disable auto sync toggles config and flags', () => {
        const store = getNotesWidgetStoreInstance(wid);
        expect(store.getState().autoSyncConfig).toBeNull();
        expect(store.getState().hasAutoSynced).toBe(false);

        store.getState().enableAutoSync('http://localhost', 'key');
        expect(store.getState().autoSyncConfig).toEqual({
            apiUrl: 'http://localhost',
            authKey: 'key',
        });
        expect(store.getState().hasAutoSynced).toBe(false);

        store.getState().markAutoSynced();
        expect(store.getState().hasAutoSynced).toBe(true);

        store.getState().disableAutoSync();
        expect(store.getState().autoSyncConfig).toBeNull();
        expect(store.getState().hasAutoSynced).toBe(false);
    });
});
