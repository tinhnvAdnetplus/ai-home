import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useHealth } from './useHealth';

function createTestWrapper() {
    const testClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                gcTime: 0,
            },
        },
    });

    return function TestWrapper({
        children,
    }: {
        readonly children: ReactNode;
    }) {
        return (
            <QueryClientProvider client={testClient}>
                {children}
            </QueryClientProvider>
        );
    };
}

describe('features/health/hooks/useHealth', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('returns loading state initially and succeeds with data', async () => {
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

        const { result } = renderHook(() => useHealth(), {
            wrapper: createTestWrapper(),
        });

        expect(result.current.isLoading).toBe(true);

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toEqual({
            status: 'ok',
            db: 'up',
            time: '2026-10-12T10:00:00Z',
        });
    });

    it('handles query error when api fails', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
                text: () => Promise.resolve(''),
            }),
        );

        const { result } = renderHook(() => useHealth(), {
            wrapper: createTestWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });

        expect(result.current.error?.message).toContain(
            'HTTP 500: Internal Server Error',
        );
    });
});
