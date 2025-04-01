import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';

import { z } from 'zod';

const envSchema = z.object({
    GITHUB_ID: z.string().nonempty(),
    GITHUB_SECRET: z.string().nonempty(),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
    console.error('Invalid environment variables:', env.error.format());
    throw new Error('Invalid environment variables');
}

const nextAuthResult = NextAuth({
    providers: [
        GitHub({
            clientId: env.data.GITHUB_ID,
            clientSecret: env.data.GITHUB_SECRET,
        }),
    ],
});

export const { handlers, signIn, signOut, auth } = nextAuthResult;
