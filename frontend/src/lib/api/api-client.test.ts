// eslint-disable-next-line no-var
var capturedRejected: (
    error: import('axios').AxiosError,
) => Promise<import('axios').AxiosResponse>;

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('axios', () => {
    const mockUse = (
        onFulfilled: ((value: unknown) => unknown) | null,
        onRejected: (
            error: import('axios').AxiosError,
        ) => Promise<import('axios').AxiosResponse>,
    ) => {
        capturedRejected = onRejected;
        return 0;
    };
    const mockInterceptors = { response: { use: mockUse } };
    const mockApiClient = {
        interceptors: mockInterceptors,
        request: vi.fn(),
    };
    return {
        __esModule: true,
        default: {
            create: vi.fn(() => mockApiClient),
            get: vi.fn(),
            request: vi.fn(),
        },
    };
});

import type { AxiosError, AxiosResponse } from 'axios';
import axios from 'axios';
import { AUTH_URLS } from '../constants/urls/auth';
import * as authEvents from '../events/auth';
import apiClient from './api-client';

const mockedAxios = axios as unknown as {
    create: typeof axios.create;
    get: typeof axios.get;
    request: typeof axios.request;
};

function getRejectedInterceptor(): (
    error: AxiosError,
) => Promise<AxiosResponse> {
    return capturedRejected;
}

describe('apiClient', () => {
    let triggerAuthFailureSpy: ReturnType<typeof vi.spyOn>;
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
        triggerAuthFailureSpy = vi
            .spyOn(authEvents, 'triggerAuthFailure')
            .mockImplementation(() => undefined);
        originalEnv = { ...process.env };
        process.env.NEXT_PUBLIC_API_URL = 'http://localhost/api';
    });

    afterEach(() => {
        vi.clearAllMocks();
        process.env = originalEnv;
    });

    it('should return response on success', () => {
        const response = { data: 'ok', status: 200 } as AxiosResponse;
        expect(response.data).toBe('ok');
    });

    it('should retry request on 401 and refresh success', async () => {
        const originalRequest = { url: '/test', __isRetry: false };
        const error = {
            config: originalRequest,
            response: { status: 401 },
        } as unknown as AxiosError;

        mockedAxios.get = vi.fn().mockResolvedValue({ data: 'ok' });

        const requestSpy = vi
            .spyOn(apiClient, 'request')
            .mockResolvedValue({ data: 'retried' });

        const interceptor = getRejectedInterceptor();
        const result = await interceptor(error);

        expect(mockedAxios.get).toHaveBeenCalledWith(AUTH_URLS.REFRESH, {
            withCredentials: true,
        });
        expect(requestSpy).toHaveBeenCalledWith(originalRequest);
        expect(result.data).toBe('retried');
    });

    it('should call triggerAuthFailure if refresh token is invalid', async () => {
        const originalRequest = { url: '/test', __isRetry: false };
        const error = {
            config: originalRequest,
            response: { status: 401 },
        } as unknown as AxiosError;

        mockedAxios.get = vi
            .fn()
            .mockResolvedValue({ data: 'Invalid refresh token' });

        const interceptor = getRejectedInterceptor();
        try {
            await interceptor(error);
        } catch {}

        expect(triggerAuthFailureSpy).toHaveBeenCalled();
    });

    it('should call triggerAuthFailure if refresh fails', async () => {
        const originalRequest = { url: '/test', __isRetry: false };
        const error = {
            config: originalRequest,
            response: { status: 401 },
        } as unknown as AxiosError;

        mockedAxios.get = vi
            .fn()
            .mockRejectedValue(new Error('Refresh failed'));

        const interceptor = getRejectedInterceptor();
        try {
            await interceptor(error);
        } catch {}

        expect(triggerAuthFailureSpy).toHaveBeenCalled();
    });

    it('should call triggerAuthFailure if second 401 after retry', async () => {
        const originalRequest = { url: '/test', __isRetry: true };
        const error = {
            config: originalRequest,
            response: { status: 401 },
        } as unknown as AxiosError;

        const interceptor = getRejectedInterceptor();
        try {
            await interceptor(error);
        } catch {}

        expect(triggerAuthFailureSpy).toHaveBeenCalled();
    });
});
