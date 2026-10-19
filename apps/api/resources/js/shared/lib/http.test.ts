import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requestJson, ApiError } from './http';

describe('shared/lib/http requestJson', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('returns parsed json on 200 ok', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                statusText: 'OK',
                text: () => Promise.resolve('{"status":"ok"}'),
            }),
        );

        const data = await requestJson('/api/test');
        expect(data).toEqual({ status: 'ok' });
    });

    it('throws ApiError with HTTP_ERROR code when response is not ok', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
                text: () => Promise.resolve('{"error":"Internal failure"}'),
            }),
        );

        try {
            await requestJson('/api/test');
            expect.unreachable();
        } catch (err: unknown) {
            expect(err).toBeInstanceOf(ApiError);
            if (err instanceof ApiError) {
                expect(err.code).toBe('HTTP_ERROR');
                expect(err.status).toBe(500);
            }
        }
    });

    it('throws ApiError on HTTP 404', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: false,
                status: 404,
                statusText: 'Not Found',
                text: () => Promise.resolve(''),
            }),
        );

        await expect(requestJson('/api/test')).rejects.toThrow('HTTP_ERROR');
    });

    it('throws ApiError with NETWORK_ERROR code on network failure', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockRejectedValue(new Error('Connection refused')),
        );

        try {
            await requestJson('/api/test');
            expect.unreachable();
        } catch (err: unknown) {
            expect(err).toBeInstanceOf(ApiError);
            if (err instanceof ApiError) {
                expect(err.code).toBe('NETWORK_ERROR');
            }
        }
    });

    it('throws ApiError with ABORTED code when request is aborted', async () => {
        const abortError = new Error('The operation was aborted');
        abortError.name = 'AbortError';

        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError));

        try {
            await requestJson('/api/test');
            expect.unreachable();
        } catch (err: unknown) {
            expect(err).toBeInstanceOf(ApiError);
            if (err instanceof ApiError) {
                expect(err.code).toBe('ABORTED');
            }
        }
    });

    it('throws ApiError with EMPTY_BODY code when response body is empty', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                statusText: 'OK',
                text: () => Promise.resolve('   '),
            }),
        );

        await expect(requestJson('/api/test')).rejects.toThrow('EMPTY_BODY');
    });

    it('throws ApiError with INVALID_JSON code when response body is invalid JSON', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                statusText: 'OK',
                text: () => Promise.resolve('<html>Not Json</html>'),
            }),
        );

        await expect(requestJson('/api/test')).rejects.toThrow('INVALID_JSON');
    });

    it('captures responseBody if error response contains JSON', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: false,
                status: 422,
                statusText: 'Unprocessable Entity',
                text: () => Promise.resolve('{"field":"invalid"}'),
            }),
        );

        try {
            await requestJson('/api/test');
            expect.unreachable();
        } catch (err: unknown) {
            expect(err).toBeInstanceOf(ApiError);
            if (err instanceof ApiError) {
                expect(err.code).toBe('HTTP_ERROR');
                expect(err.status).toBe(422);
                expect(err.responseBody).toEqual({ field: 'invalid' });
            }
        }
    });
});
