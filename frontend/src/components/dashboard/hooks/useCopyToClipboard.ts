import { useCallback } from 'react';
import { toast } from 'sonner';

interface UseCopyToClipboardOptions {
    successMessage?: string;
    errorMessage?: string;
}

export const useCopyToClipboard = (options?: UseCopyToClipboardOptions) => {
    const {
        successMessage = 'Copied to clipboard',
        errorMessage = 'Failed to copy to clipboard',
    } = options ?? {};

    const copyToClipboard = useCallback(
        async (text: string): Promise<boolean> => {
            try {
                await navigator.clipboard.writeText(text);
                toast.success(successMessage);
                return true;
            } catch (error) {
                console.error('Failed to copy to clipboard:', error);
                toast.error(errorMessage);
                return false;
            }
        },
        [successMessage, errorMessage],
    );

    return { copyToClipboard };
};
