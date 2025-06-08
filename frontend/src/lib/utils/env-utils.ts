import { z } from 'zod';

const clientEnvSchema = z.object({
    NEXT_PUBLIC_GATEWAY_DOMAIN: z.string().url(),
});

export const env = clientEnvSchema.parse({
    NEXT_PUBLIC_GATEWAY_DOMAIN: process.env.NEXT_PUBLIC_GATEWAY_DOMAIN,
});
