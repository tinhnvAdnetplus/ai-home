import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchHealth } from './health-api';

describe('features/health/api/health-api', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('fetches and parses health payload successfully', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                statusText: 'OK',
                text: () =>
                    Promise.resolve(
                        JSON.stringify({
                            status: 'ok',
                            db: 'up',
                            time: '2026-10-12T10:00:00Z',
                        }),
                    ),
            }),
        );

        const data = await fetchHealth();
        expect(data).toEqual({
            status: 'ok',
            db: 'up',
            time: '2026-10-12T10:00:00Z',
        });
    });

    it('throws error when returned payload fails schema validation', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                statusText: 'OK',
                text: () =>
                    Promise.resolve(
                        JSON.stringify({
                            status: 'ok',
                            // db and time are missing
                        }),
                    ),
            }),
        );

        await expect(fetchHealth()).rejects.toThrow('INVALID_PAYLOAD');
    });

    it('throws error when server returns HTTP 500', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
                text: () => Promise.resolve(''),
            }),
        );

        await expect(fetchHealth()).rejects.toThrow(
            'HTTP 500: Internal Server Error',
        );
    });
});
