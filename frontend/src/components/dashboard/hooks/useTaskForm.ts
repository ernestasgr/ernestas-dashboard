import { TaskFormData, taskFormSchema } from '@/lib/schemas/form-schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

export function useTaskForm() {
    const form = useForm<TaskFormData>({
        resolver: zodResolver(taskFormSchema),
        defaultValues: {
            text: '',
        },
        mode: 'onChange',
    });

    const resetForm = () => {
        form.reset({ text: '' });
    };

    return {
        form,
        resetForm,
    };
}
