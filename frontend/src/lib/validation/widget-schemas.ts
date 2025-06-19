import { z } from 'zod';

export const widgetPositionSchema = z.object({
    x: z.number().min(0).max(11),
    y: z.number().min(0),
    width: z.number().min(1).max(12),
    height: z.number().min(1),
});

export const clockConfigSchema = z.object({
    timezone: z.string().min(1, 'Timezone is required'),
    format: z.enum(['12h', '24h']).default('24h'),
});

export const weatherConfigSchema = z.object({
    location: z.string().min(1, 'Location is required'),
    units: z.enum(['metric', 'imperial']).default('metric'),
});

export const notesConfigSchema = z.object({
    content: z.string().default(''),
    maxLength: z.number().min(1).max(2000).default(500),
});

export const tasksConfigSchema = z.object({
    categories: z
        .array(z.string().min(1))
        .min(1, 'At least one category is required'),
    defaultCategory: z.string().optional(),
});

export const widgetConfigSchemas = {
    clock: clockConfigSchema,
    weather: weatherConfigSchema,
    notes: notesConfigSchema,
    tasks: tasksConfigSchema,
} as const;

export const createWidgetSchema = z.object({
    type: z.enum(['clock', 'weather', 'notes', 'tasks']),
    title: z.string().optional(),
    ...widgetPositionSchema.shape,
    config: z.record(z.unknown()),
});

export const updateWidgetSchema = z.object({
    id: z.string(),
    title: z.string().optional(),
    ...widgetPositionSchema.shape,
    config: z.record(z.unknown()),
});

export type ClockConfig = z.infer<typeof clockConfigSchema>;
export type WeatherConfig = z.infer<typeof weatherConfigSchema>;
export type NotesConfig = z.infer<typeof notesConfigSchema>;
export type TasksConfig = z.infer<typeof tasksConfigSchema>;
export type WidgetType = keyof typeof widgetConfigSchemas;
export type CreateWidgetForm = z.infer<typeof createWidgetSchema>;
export type UpdateWidgetForm = z.infer<typeof updateWidgetSchema>;

export function validateWidgetConfig(
    type: WidgetType,
    config: unknown,
): { success: true; data: unknown } | { success: false; errors: string[] } {
    const schema = widgetConfigSchemas[type];
    const result = schema.safeParse(config);

    if (result.success) {
        return { success: true, data: result.data };
    } else {
        return {
            success: false,
            errors: result.error.errors.map(
                (err) => `${err.path.join('.')}: ${err.message}`,
            ),
        };
    }
}
