import {
    useGetWidgetsQuery,
    useMeQuery,
    useUpdateWidgetLayoutMutation,
} from '@/generated/graphql';
import { useCallback, useEffect, useRef, useState } from 'react';
import GridLayout from 'react-grid-layout';

export const useWidgetLayout = () => {
    const [windowWidth, setWindowWidth] = useState(1200);
    const [, setPreviousLayout] = useState<GridLayout.Layout[]>([]);
    const layoutUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastSavedLayoutRef = useRef<GridLayout.Layout[]>([]);

    const { data: meData } = useMeQuery();
    const [updateWidgetLayout] = useUpdateWidgetLayoutMutation();

    const {
        data: widgetsData,
        loading,
        error,
        refetch,
    } = useGetWidgetsQuery({
        variables: { userId: meData?.me.email ?? '' },
        skip: !meData?.me.email,
    });

    useEffect(() => {
        const updateWidth = () => {
            setWindowWidth(window.innerWidth - 32);
        };

        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => {
            window.removeEventListener('resize', updateWidth);
        };
    }, []);

    useEffect(() => {
        if (widgetsData?.widgets) {
            const layout = widgetsData.widgets.map((widget) => ({
                i: widget.id,
                x: widget.x,
                y: widget.y,
                w: widget.width,
                h: widget.height,
            }));
            setPreviousLayout(layout);
            lastSavedLayoutRef.current = layout;
        }
    }, [widgetsData?.widgets]);

    useEffect(() => {
        return () => {
            if (layoutUpdateTimeoutRef.current) {
                clearTimeout(layoutUpdateTimeoutRef.current);
            }
        };
    }, []);

    const debouncedUpdateLayout = useCallback(
        (layout: GridLayout.Layout[]) => {
            if (layoutUpdateTimeoutRef.current) {
                clearTimeout(layoutUpdateTimeoutRef.current);
            }

            layoutUpdateTimeoutRef.current = setTimeout(() => {
                const changedItems = layout.filter((item) => {
                    const prevItem = lastSavedLayoutRef.current.find(
                        (prev) => prev.i === item.i,
                    );
                    return (
                        !prevItem ||
                        prevItem.x !== item.x ||
                        prevItem.y !== item.y ||
                        prevItem.w !== item.w ||
                        prevItem.h !== item.h
                    );
                });

                if (changedItems.length > 0) {
                    changedItems.forEach((item) => {
                        const currentWidget = widgetsData?.widgets.find(
                            (widget) => widget.id === item.i,
                        );

                        updateWidgetLayout({
                            variables: {
                                input: {
                                    id: item.i,
                                    x: item.x,
                                    y: item.y,
                                    width: item.w,
                                    height: item.h,
                                },
                            },
                            optimisticResponse: currentWidget
                                ? {
                                      updateWidgetLayout: {
                                          __typename: 'Widget' as const,
                                          id: item.i,
                                          type: currentWidget.type,
                                          title: currentWidget.title,
                                          x: item.x,
                                          y: item.y,
                                          width: item.w,
                                          height: item.h,
                                          backgroundColor:
                                              currentWidget.backgroundColor,
                                          textColor: currentWidget.textColor,
                                          iconColor: currentWidget.iconColor,
                                          backgroundImage:
                                              currentWidget.backgroundImage,
                                          config: currentWidget.config,
                                      },
                                  }
                                : undefined,
                        }).catch((error: unknown) => {
                            console.error(
                                'Error updating widget layout:',
                                error,
                            );
                        });
                    });

                    lastSavedLayoutRef.current = layout;
                }
            }, 300);
        },
        [updateWidgetLayout, widgetsData?.widgets],
    );

    const handleLayoutChange = (layout: GridLayout.Layout[]) => {
        debouncedUpdateLayout(layout);
    };

    return {
        windowWidth,
        widgetsData,
        loading,
        error,
        refetch,
        handleLayoutChange,
    };
};
