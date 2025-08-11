'use client';

import { useUIStore } from '@/lib/stores/ui-store';
import { useTheme } from 'next-themes';
import { useEffect } from 'react';
import { Toaster as Sonner, ToasterProps, toast } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
    const { theme = 'system' } = useTheme();
    const lastToast = useUIStore((s) => s.lastToast);
    const clearToast = useUIStore((s) => s.clearToast);

    useEffect(() => {
        if (!lastToast) return;
        const { type, message, description } = lastToast;
        switch (type) {
            case 'success':
                toast.success(message, { description });
                break;
            case 'error':
                toast.error(message, { description });
                break;
            case 'warning':
                toast.warning(message, { description });
                break;
            default:
                toast(message, { description });
        }
        clearToast();
    }, [lastToast, clearToast]);

    return (
        <Sonner
            theme={theme as ToasterProps['theme']}
            className='toaster group'
            position='bottom-center'
            richColors
            toastOptions={{
                style: {},
                className: '',
                descriptionClassName: '',
            }}
            style={
                {
                    '--normal-bg': 'var(--popover)',
                    '--normal-text': 'var(--popover-foreground)',
                    '--normal-border': 'var(--border)',
                } as React.CSSProperties
            }
            {...props}
        />
    );
};

export { Toaster };
