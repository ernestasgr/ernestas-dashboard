import {
    createWidgetSchema,
    updateWidgetSchema,
    validateWidgetConfig,
    WidgetType,
} from '@/lib/validation/widget-schemas';
import { useCallback, useState } from 'react';

type ValidationErrors = Record<string, string[]>;

interface UseWidgetValidationProps {
    isEditing: boolean;
}

export function useWidgetValidation({ isEditing }: UseWidgetValidationProps) {
    const [errors, setErrors] = useState<ValidationErrors>({});

    const validateForm = useCallback(
        (formData: {
            type: string;
            title: string;
            x: number;
            y: number;
            width: number;
            height: number;
            config: Record<string, unknown>;
            id?: string;
        }) => {
            const newErrors: ValidationErrors = {};

            const schema = isEditing ? updateWidgetSchema : createWidgetSchema;
            const formResult = schema.safeParse(formData);
            if (!formResult.success) {
                formResult.error.errors.forEach((error) => {
                    const path = error.path.join('.');
                    newErrors[path] = [];
                    newErrors[path].push(error.message);
                });
            }

            const configResult = validateWidgetConfig(
                formData.type as WidgetType,
                formData.config,
            );

            if (!configResult.success) {
                newErrors.config = configResult.errors;
            }

            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        },
        [isEditing],
    );

    const clearErrors = useCallback(() => {
        setErrors({});
    }, []);
    const clearFieldError = useCallback((field: string) => {
        setErrors((prev) => {
            const newErrors = { ...prev };
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [field]: _, ...rest } = newErrors;
            return rest;
        });
    }, []);

    const hasErrors = Object.keys(errors).length > 0;

    return {
        errors,
        hasErrors,
        validateForm,
        clearErrors,
        clearFieldError,
    };
}
