import { useMeQuery } from '@/generated/Auth.generated';
import {
    useGetWidgetsQuery,
    useUpdateWidgetLayoutMutation,
} from '@/generated/Widgets.generated';
import { appEvents } from '@/lib/events/app-events';
import { createWidgetLayoutService } from '@/lib/services/widget-layout-service';
import { useWidgetStore } from '@/lib/stores/widget-store';
import { useCallback, useEffect, useRef, useState } from 'react';
import GridLayout from 'react-grid-layout';

export const useWidgetLayout = () => {
    const [windowWidth, setWindowWidth] = useState(1200);
    const [, setPreviousLayout] = useState<GridLayout.Layout[]>([]);
    const layoutUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastSavedLayoutRef = useRef<GridLayout.Layout[]>([]);
    const serviceRef = useRef(createWidgetLayoutService());
    const updateLayoutLocal = useWidgetStore((s) => s.updateLayoutLocal);

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
            serviceRef.current.setInitialLayout(layout);
        }
    }, [widgetsData?.widgets]);

    useEffect(() => {
        return () => {
            const to = layoutUpdateTimeoutRef.current;
            if (to) clearTimeout(to);
        };
    }, []);

    const debouncedUpdateLayout = useCallback(
        (layout: GridLayout.Layout[]) => {
            const to = serviceRef.current.scheduleSave(
                layout,
                async (changed) => {
                    for (const item of changed) {
                        appEvents.emit('widget:layout:changed', {
                            id: item.i,
                            x: item.x,
                            y: item.y,
                            width: item.w,
                            height: item.h,
                        });

                        const currentWidget = widgetsData?.widgets.find(
                            (w) => w.id === item.i,
                        );
                        await updateWidgetLayout({
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
                        });
                    }
                    lastSavedLayoutRef.current = layout;
                },
            );
            layoutUpdateTimeoutRef.current = to as unknown as NodeJS.Timeout;
        },
        [updateWidgetLayout, widgetsData?.widgets],
    );

    const handleLayoutChange = (layout: GridLayout.Layout[]) => {
        for (const item of layout) {
            updateLayoutLocal(item.i, {
                x: item.x,
                y: item.y,
                width: item.w,
                height: item.h,
            });
        }
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
