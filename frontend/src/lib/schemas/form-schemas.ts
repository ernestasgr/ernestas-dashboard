import { z } from 'zod';

export const widgetPositionSchema = z.object({
    x: z
        .number()
        .min(0, 'X position must be 0 or greater')
        .max(11, 'X position must be 11 or less'),
    y: z.number().min(0, 'Y position must be 0 or greater'),
    width: z
        .number()
        .min(1, 'Width must be at least 1')
        .max(12, 'Width must be 12 or less'),
    height: z.number().min(1, 'Height must be at least 1'),
});

export const clockConfigSchema = z.object({
    timezone: z.string().min(1, 'Timezone is required'),
    format: z
        .enum(['12h', '24h'], {
            errorMap: () => ({ message: 'Format must be either 12h or 24h' }),
        })
        .default('24h'),
});

export const weatherConfigSchema = z.object({
    location: z.string().min(1, 'Location is required'),
    units: z
        .enum(['metric', 'imperial'], {
            errorMap: () => ({
                message: 'Units must be either metric or imperial',
            }),
        })
        .default('metric'),
});

export const notesConfigSchema = z.object({
    maxLength: z
        .number()
        .min(1, 'Max length must be at least 1')
        .max(2000, 'Max length cannot exceed 2000')
        .default(500),
    visibleLabels: z
        .array(z.string())
        .optional()
        .nullable()
        .transform((val) => val ?? undefined),
    showGrid: z.boolean().default(true),
    gridColumns: z
        .number()
        .min(1, 'Grid columns must be at least 1')
        .default(3),
    enableObsidianSync: z.boolean().default(false),
    obsidianApiUrl: z
        .string()
        .url('Invalid URL format')
        .optional()
        .nullable()
        .transform((val) => val ?? undefined),
    obsidianAuthKey: z
        .string()
        .optional()
        .nullable()
        .transform((val) => val ?? undefined),
    obsidianVaultName: z
        .string()
        .optional()
        .nullable()
        .transform((val) => val ?? undefined),
});

export const tasksConfigSchema = z.object({
    categories: z
        .array(z.string().min(1, 'Category cannot be empty'))
        .min(1, 'At least one category is required'),
    defaultCategory: z.string().optional(),
});

export const createConfigSchema = (type: string) => {
    switch (type) {
        case 'clock':
            return clockConfigSchema;
        case 'weather':
            return weatherConfigSchema;
        case 'notes':
            return notesConfigSchema;
        case 'tasks':
            return tasksConfigSchema;
        default:
            return z.object({});
    }
};

export const widgetFormSchema = z.object({
    id: z.string().optional(), // Only present for updates
    type: z.enum(['clock', 'weather', 'notes', 'tasks'], {
        errorMap: () => ({ message: 'Please select a valid widget type' }),
    }),
    title: z.string().optional().nullable(),
    ...widgetPositionSchema.shape,
    config: z.record(z.unknown()),
});

export type WidgetFormData = z.infer<typeof widgetFormSchema>;

export const createWidgetFormSchema = z
    .object({
        type: z.enum(['clock', 'weather', 'notes', 'tasks'], {
            errorMap: () => ({ message: 'Please select a valid widget type' }),
        }),
        title: z.string().optional(),
        ...widgetPositionSchema.shape,
        config: z.record(z.unknown()),
    })
    .refine(
        (data) => {
            const configSchema = createConfigSchema(data.type);
            const result = configSchema.safeParse(data.config);
            return result.success;
        },
        {
            message: 'Invalid configuration for selected widget type',
            path: ['config'],
        },
    );

export const updateWidgetFormSchema = z.object({
    id: z.string().min(1, 'Widget ID is required'),
    title: z.string().optional(),
    ...widgetPositionSchema.shape,
    config: z.record(z.unknown()),
});

export const noteFormSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
    content: z.string().max(5000, 'Content is too long'),
    labels: z.array(z.string().min(1)),
    widgetId: z.string().min(1, 'Widget ID is required'),
});

export const taskFormSchema = z.object({
    text: z
        .string()
        .min(1, 'Task text is required')
        .max(500, 'Task text is too long'),
});

export type CreateWidgetFormData = z.infer<typeof createWidgetFormSchema>;
export type UpdateWidgetFormData = z.infer<typeof updateWidgetFormSchema>;
export type NoteFormData = z.infer<typeof noteFormSchema>;
export type TaskFormData = z.infer<typeof taskFormSchema>;
export type ClockConfig = z.infer<typeof clockConfigSchema>;
export type WeatherConfig = z.infer<typeof weatherConfigSchema>;
export type NotesConfig = z.infer<typeof notesConfigSchema>;
export type TasksConfig = z.infer<typeof tasksConfigSchema>;
