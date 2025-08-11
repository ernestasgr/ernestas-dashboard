import { describe, expect, it } from 'vitest';
import { useUIStore } from './ui-store';

describe('ui-store', () => {
    it('notify should set lastToast with message and type', () => {
        const notify = useUIStore.getState().notify;
        notify({ type: 'success', message: 'Hello' });
        const t = useUIStore.getState().lastToast;
        expect(t).toBeTruthy();
        expect(t?.message).toBe('Hello');
        expect(t?.type).toBe('success');
        expect(typeof t?.id).toBe('string');
        expect(typeof t?.ts).toBe('number');
    });

    it('clearToast should nullify lastToast', () => {
        const { notify, clearToast } = useUIStore.getState();
        notify({ type: 'error', message: 'Oops' });
        clearToast();
        expect(useUIStore.getState().lastToast).toBeNull();
    });
});
