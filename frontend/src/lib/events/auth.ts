import { useEventStore } from '@/lib/stores/use-event-store';

export function onAuthFailure(cb: () => void) {
    return useEventStore.getState().subscribe('auth:failure', () => {
        cb();
    });
}

export function triggerAuthFailure() {
    useEventStore.getState().trigger('auth:failure');
}
