import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils/tailwind-utils';
import { forwardRef } from 'react';
import type { ControllerRenderProps, FieldError } from 'react-hook-form';

interface FormFieldWrapperProps {
    label?: string;
    error?: FieldError;
    required?: boolean;
    children: React.ReactNode;
    className?: string;
}

export function FormFieldWrapper({
    label,
    error,
    required,
    children,
    className,
}: FormFieldWrapperProps) {
    return (
        <div className={cn('space-y-2', className)}>
            {label && (
                <Label className={cn(error && 'text-red-600')}>
                    {label}
                    {required && <span className='ml-1 text-red-500'>*</span>}
                </Label>
            )}
            {children}
            {error && (
                <p className='mt-1 text-sm text-red-600'>{error.message}</p>
            )}
        </div>
    );
}

interface FormInputProps {
    label?: string;
    error?: FieldError;
    required?: boolean;
    placeholder?: string;
    type?: string;
    className?: string;
    field: ControllerRenderProps<Record<string, unknown>, string>;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
    (
        {
            label,
            error,
            required,
            placeholder,
            type = 'text',
            className,
            field,
        },
        ref,
    ) => {
        return (
            <FormFieldWrapper
                label={label}
                error={error}
                required={required}
                className={className}
            >
                <Input
                    {...field}
                    ref={ref}
                    type={type}
                    placeholder={placeholder}
                    className={cn(error && 'border-red-500')}
                    value={field.value as string}
                />
            </FormFieldWrapper>
        );
    },
);

FormInput.displayName = 'FormInput';

interface FormTextareaProps {
    label?: string;
    error?: FieldError;
    required?: boolean;
    placeholder?: string;
    rows?: number;
    maxLength?: number;
    className?: string;
    field: ControllerRenderProps<Record<string, unknown>, string>;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
    (
        {
            label,
            error,
            required,
            placeholder,
            rows = 4,
            maxLength,
            className,
            field,
        },
        ref,
    ) => {
        const value = field.value as string;
        return (
            <FormFieldWrapper
                label={label}
                error={error}
                required={required}
                className={className}
            >
                <Textarea
                    {...field}
                    ref={ref}
                    placeholder={placeholder}
                    rows={rows}
                    maxLength={maxLength}
                    className={cn(error && 'border-red-500')}
                    value={value}
                />
                {maxLength && (
                    <div className='mt-1 text-xs text-gray-500'>
                        {value ? value.length : 0}/{maxLength}
                    </div>
                )}
            </FormFieldWrapper>
        );
    },
);

FormTextarea.displayName = 'FormTextarea';

interface FormSelectProps {
    label?: string;
    error?: FieldError;
    required?: boolean;
    placeholder?: string;
    options: { value: string; label: string; disabled?: boolean }[];
    className?: string;
    field: ControllerRenderProps<Record<string, unknown>, string>;
}

export const FormSelect = forwardRef<HTMLButtonElement, FormSelectProps>(
    (
        { label, error, required, placeholder, options, className, field },
        ref,
    ) => {
        return (
            <FormFieldWrapper
                label={label}
                error={error}
                required={required}
                className={className}
            >
                <Select
                    value={field.value as string}
                    onValueChange={field.onChange}
                >
                    <SelectTrigger
                        ref={ref}
                        className={cn(error && 'border-red-500')}
                    >
                        <SelectValue placeholder={placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                        {options.map((option) => (
                            <SelectItem
                                key={option.value}
                                value={option.value}
                                disabled={option.disabled}
                            >
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </FormFieldWrapper>
        );
    },
);

FormSelect.displayName = 'FormSelect';

interface FormNumberInputProps {
    label?: string;
    error?: FieldError;
    required?: boolean;
    placeholder?: string;
    min?: number;
    max?: number;
    step?: number;
    className?: string;
    field: ControllerRenderProps<Record<string, unknown>, string>;
}

export const FormNumberInput = forwardRef<
    HTMLInputElement,
    FormNumberInputProps
>(
    (
        {
            label,
            error,
            required,
            placeholder,
            min,
            max,
            step,
            className,
            field,
        },
        ref,
    ) => {
        return (
            <FormFieldWrapper
                label={label}
                error={error}
                required={required}
                className={className}
            >
                <Input
                    {...field}
                    ref={ref}
                    type='number'
                    placeholder={placeholder}
                    min={min}
                    max={max}
                    step={step}
                    className={cn(error && 'border-red-500')}
                    value={field.value as string}
                    onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(
                            value === '' ? undefined : Number(value),
                        );
                    }}
                />
            </FormFieldWrapper>
        );
    },
);

FormNumberInput.displayName = 'FormNumberInput';
