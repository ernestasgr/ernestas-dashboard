import { Note } from '@/hooks/useNotes';
import { useCallback, useRef } from 'react';
import GridLayout from 'react-grid-layout';

interface UseNoteLayoutProps {
    notes: Note[];
    gridColumns: number;
    onUpdateNoteLayout?: (
        noteId: string,
        layout: { x: number; y: number; width: number; height: number },
    ) => void;
}

export const useNoteLayout = ({
    notes,
    gridColumns,
    onUpdateNoteLayout,
}: UseNoteLayoutProps) => {
    const layoutUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastSavedLayoutRef = useRef<GridLayout.Layout[]>([]);

    const generateLayout = useCallback(
        (notesList: Note[]): GridLayout.Layout[] => {
            return notesList.map((note, index) => {
                // Use saved layout properties if available, otherwise calculate position
                const x = note.x ?? index % gridColumns;
                const y = note.y ?? Math.floor(index / gridColumns);
                const w = note.width ?? 1;
                const h = note.height ?? 4;

                return {
                    i: note.id,
                    x,
                    y,
                    w,
                    h,
                    minW: 1,
                    minH: 3,
                    maxW: gridColumns,
                    maxH: 10,
                };
            });
        },
        [gridColumns],
    );

    const handleLayoutChange = useCallback(
        (newLayout: GridLayout.Layout[]) => {
            if (layoutUpdateTimeoutRef.current) {
                clearTimeout(layoutUpdateTimeoutRef.current);
            }

            if (
                lastSavedLayoutRef.current.length === 0 ||
                lastSavedLayoutRef.current.length !== newLayout.length
            ) {
                lastSavedLayoutRef.current = [...newLayout];
                return;
            }

            // Find which specific notes have changed position/size
            const changedNotes: GridLayout.Layout[] = [];
            const lastLayoutMap = new Map(
                lastSavedLayoutRef.current.map((item) => [item.i, item]),
            );

            newLayout.forEach((currentItem) => {
                const lastItem = lastLayoutMap.get(currentItem.i);
                if (
                    !lastItem ||
                    currentItem.x !== lastItem.x ||
                    currentItem.y !== lastItem.y ||
                    currentItem.w !== lastItem.w ||
                    currentItem.h !== lastItem.h
                ) {
                    changedNotes.push(currentItem);
                }
            });

            if (changedNotes.length === 0) {
                return;
            }

            layoutUpdateTimeoutRef.current = setTimeout(() => {
                changedNotes.forEach((layoutItem) => {
                    if (onUpdateNoteLayout) {
                        onUpdateNoteLayout(layoutItem.i, {
                            x: layoutItem.x,
                            y: layoutItem.y,
                            width: layoutItem.w,
                            height: layoutItem.h,
                        });
                    }
                });

                lastSavedLayoutRef.current = [...newLayout];
            }, 500);
        },
        [onUpdateNoteLayout],
    );

    const getCurrentLayout = useCallback(() => {
        return generateLayout(notes);
    }, [notes, generateLayout]);

    return {
        handleLayoutChange,
        getCurrentLayout,
    };
};
