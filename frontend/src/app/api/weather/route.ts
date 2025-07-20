import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const WEATHER_API_BASE_URL = 'https://api.weatherapi.com/v1';
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

const weatherRequestSchema = z.object({
    location: z.string().min(1, 'Location is required'),
});

export async function GET(request: NextRequest) {
    try {
        if (!WEATHER_API_KEY) {
            console.error('WEATHER_API_KEY is not configured');
            return NextResponse.json(
                {
                    error: {
                        code: 1002,
                        message: 'Weather service is not configured',
                    },
                },
                { status: 500 },
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const location = searchParams.get('location');

        const validationResult = weatherRequestSchema.safeParse({ location });
        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: {
                        code: 1003,
                        message: 'Invalid location parameter',
                    },
                },
                { status: 400 },
            );
        }

        const sanitizedLocation = validationResult.data.location.trim();

        const response = await axios.get(
            `${WEATHER_API_BASE_URL}/current.json`,
            {
                params: {
                    key: WEATHER_API_KEY,
                    q: sanitizedLocation,
                    aqi: 'no',
                },
                timeout: 10000,
            },
        );

        return NextResponse.json(response.data);
    } catch (error) {
        console.error('Weather API error:', error);

        if (axios.isAxiosError(error)) {
            if (
                error.response?.data &&
                typeof error.response.data === 'object' &&
                'error' in error.response.data
            ) {
                const data = error.response.data as {
                    error: { code: number; message: string };
                };
                return NextResponse.json(data, {
                    status: error.response.status,
                });
            }

            if (error.code === 'ECONNABORTED') {
                return NextResponse.json(
                    {
                        error: {
                            code: 9999,
                            message: 'Request timeout. Please try again.',
                        },
                    },
                    { status: 408 },
                );
            }

            if (error.response?.status === 401) {
                return NextResponse.json(
                    {
                        error: {
                            code: 1002,
                            message: 'Weather service authentication failed',
                        },
                    },
                    { status: 500 },
                );
            }

            return NextResponse.json(
                {
                    error: {
                        code: 9999,
                        message: 'Weather service temporarily unavailable',
                    },
                },
                { status: 503 },
            );
        }

        return NextResponse.json(
            {
                error: {
                    code: 9999,
                    message: 'Internal server error',
                },
            },
            { status: 500 },
        );
    }
}
