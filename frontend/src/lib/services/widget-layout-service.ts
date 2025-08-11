import type GridLayout from 'react-grid-layout';

export function createWidgetLayoutService() {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    let lastSaved: GridLayout.Layout[] = [];

    function scheduleSave(
        nextLayout: GridLayout.Layout[],
        onChanged: (changed: GridLayout.Layout[]) => void | Promise<void>,
        delay = 300,
    ) {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
            const changed = nextLayout.filter((item) => {
                const prev = lastSaved.find((p) => p.i === item.i);
                return (
                    !prev ||
                    prev.x !== item.x ||
                    prev.y !== item.y ||
                    prev.w !== item.w ||
                    prev.h !== item.h
                );
            });
            if (changed.length === 0) return;
            void onChanged(changed);
            lastSaved = nextLayout;
        }, delay);
    }

    function setInitialLayout(layout: GridLayout.Layout[]) {
        lastSaved = layout;
    }

    return { scheduleSave, setInitialLayout };
}
