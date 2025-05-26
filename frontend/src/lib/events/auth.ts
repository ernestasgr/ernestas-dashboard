const listeners: (() => void)[] = [];

export function onAuthFailure(cb: () => void) {
    listeners.push(cb);
}

export function triggerAuthFailure() {
    listeners.forEach((cb) => {
        cb();
    });
}
