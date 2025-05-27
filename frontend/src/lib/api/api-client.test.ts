import axios, { AxiosError, AxiosResponse } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AUTH_URLS } from '../constants/urls/auth';
import * as authEvents from '../events/auth';
import apiClient from './api-client';

// eslint-disable-next-line no-var
var capturedRejected: (error: AxiosError) => Promise<AxiosResponse>;

vi.mock('axios', () => {
    const mockUse = (
        _onFulfilled: ((value: unknown) => unknown) | null,
        onRejected: (error: AxiosError) => Promise<AxiosResponse>,
    ) => {
        capturedRejected = onRejected;
    };
    const mockApiClient = {
        interceptors: { response: { use: mockUse } },
        request: vi.fn(),
    };
    return {
        default: {
            create: vi.fn(() => mockApiClient),
            get: vi.fn(),
            request: vi.fn(),
        },
    };
});

const mockedAxios = axios as unknown as {
    create: typeof axios.create;
    get: typeof axios.get;
    request: typeof axios.request;
};

describe('apiClient', () => {
    let triggerAuthFailureSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        triggerAuthFailureSpy = vi
            .spyOn(authEvents, 'triggerAuthFailure')
            .mockImplementation(() => undefined);
    });

    afterEach(() => {
        vi.clearAllMocks();
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

        const result = await capturedRejected(error);

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

        try {
            await capturedRejected(error);
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

        try {
            await capturedRejected(error);
        } catch {}

        expect(triggerAuthFailureSpy).toHaveBeenCalled();
    });

    it('should call triggerAuthFailure if second 401 after retry', async () => {
        const originalRequest = { url: '/test', __isRetry: true };
        const error = {
            config: originalRequest,
            response: { status: 401 },
        } as unknown as AxiosError;

        try {
            await capturedRejected(error);
        } catch {}

        expect(triggerAuthFailureSpy).toHaveBeenCalled();
    });
});
