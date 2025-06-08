import { z } from 'zod';

const clientEnvSchema = z.object({
    NEXT_PUBLIC_GATEWAY_DOMAIN: z.string().url(),
});

console.log(process.env);
export const env = clientEnvSchema.parse({
    NEXT_PUBLIC_GATEWAY_DOMAIN: process.env.NEXT_PUBLIC_GATEWAY_DOMAIN,
});
