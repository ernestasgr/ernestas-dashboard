import { z } from 'zod';

const clientEnvSchema = z.object({
    NEXT_PUBLIC_GATEWAY_DOMAIN: z.string().url(),
    NEXT_PUBLIC_WEATHER_API_KEY: z.string().optional(),
});

export const env = clientEnvSchema.parse({
    NEXT_PUBLIC_GATEWAY_DOMAIN: process.env.NEXT_PUBLIC_GATEWAY_DOMAIN,
    NEXT_PUBLIC_WEATHER_API_KEY: process.env.NEXT_PUBLIC_WEATHER_API_KEY,
});
