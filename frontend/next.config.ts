import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    publicRuntimeConfig: {
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000',
    },
    output: 'standalone',
};

export default nextConfig;
