import { useUIStore } from '@/lib/stores/ui-store';
import { useCallback } from 'react';

interface UseCopyToClipboardOptions {
    successMessage?: string;
    errorMessage?: string;
}

export const useCopyToClipboard = (options?: UseCopyToClipboardOptions) => {
    const {
        successMessage = 'Copied to clipboard',
        errorMessage = 'Failed to copy to clipboard',
    } = options ?? {};

    const notify = useUIStore((s) => s.notify);
    const copyToClipboard = useCallback(
        async (text: string): Promise<boolean> => {
            try {
                await navigator.clipboard.writeText(text);
                notify({ type: 'success', message: successMessage });
                return true;
            } catch (error) {
                console.error('Failed to copy to clipboard:', error);
                notify({ type: 'error', message: errorMessage });
                return false;
            }
        },
        [successMessage, errorMessage, notify],
    );

    return { copyToClipboard };
};
