import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient } from '@tanstack/react-query';
import { initI18n, STORAGE_KEY } from '../shared/i18n/init';
import { App } from './App';

vi.mock('./wizard-flow', () => ({
    WizardFlow: () => <div data-testid="wizard-flow">Wizard Flow</div>,
}));

function renderAppWithFreshClient(lang?: string) {
    const testClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                gcTime: 0,
            },
        },
    });
    const i18n = initI18n(lang ?? 'ja');
    return render(<App client={testClient} i18n={i18n} />);
}

describe('App component (Health Page)', () => {
    beforeEach(() => {
        window.localStorage.clear();
        document.documentElement.lang = '';
        window.location.hash = '#/health';
        vi.restoreAllMocks();
    });

    afterEach(() => {
        window.location.hash = '';
    });

    it('shows loading state initially in Japanese (default) while fetching health data', () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockImplementation(
                () =>
                    new Promise(() => {
                        // Pending promise to keep in loading state
                    }),
            ),
        );

        renderAppWithFreshClient();

        expect(
            screen.getByText('APIヘルスエンドポイントに接続中...'),
        ).toBeInTheDocument();
        expect(screen.getByText('HOME DESIGN PLATFORM')).toBeInTheDocument();
    });

    it('renders success state in Japanese (default) when API succeeds', async () => {
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

        renderAppWithFreshClient();

        await waitFor(() => {
            expect(screen.getByText('APIステータス')).toBeInTheDocument();
        });

        expect(
            screen.getByText('データベース (MySQL 8.4)'),
        ).toBeInTheDocument();
        expect(screen.getByText('サーバーUTC時刻')).toBeInTheDocument();
        expect(screen.getByText('ok')).toBeInTheDocument();
        expect(screen.getByText('up')).toBeInTheDocument();
        expect(screen.getByText('2026-10-12T10:00:00Z')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: '更新' }),
        ).toBeInTheDocument();
    });

    it('renders success state with status ok and db down when database is disconnected', async () => {
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
                            db: 'down',
                            time: '2026-10-12T10:00:00Z',
                        }),
                    ),
            }),
        );

        renderAppWithFreshClient();

        await waitFor(() => {
            expect(screen.getByText('APIステータス')).toBeInTheDocument();
        });

        expect(screen.getByText('ok')).toBeInTheDocument();
        expect(screen.getByText('down')).toBeInTheDocument();
    });

    it('renders loading, success, and error states in English when initialized with en', async () => {
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

        renderAppWithFreshClient('en');

        await waitFor(() => {
            expect(screen.getByText('API Status')).toBeInTheDocument();
        });

        expect(screen.getByText('Database (MySQL 8.4)')).toBeInTheDocument();
        expect(screen.getByText('Server UTC Time')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Refresh' }),
        ).toBeInTheDocument();
    });

    it('renders loading, success, and error states in Vietnamese when initialized with vi', async () => {
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

        renderAppWithFreshClient('vi');

        await waitFor(() => {
            expect(screen.getByText('Trạng thái API')).toBeInTheDocument();
        });

        expect(
            screen.getByText('Cơ sở dữ liệu (MySQL 8.4)'),
        ).toBeInTheDocument();
        expect(screen.getByText('Thời gian máy chủ UTC')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Làm mới' }),
        ).toBeInTheDocument();
    });

    it('renders error UI when API returns HTTP 500 error in Japanese, English, and Vietnamese', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
                text: () => Promise.resolve(''),
            }),
        );

        // JA
        const { unmount: unmountJa } = renderAppWithFreshClient('ja');
        await waitFor(() => {
            expect(screen.getByText('APIに接続できません')).toBeInTheDocument();
        });
        expect(
            screen.getByText('HTTPエラー (ステータス 500)'),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: '再試行' }),
        ).toBeInTheDocument();
        unmountJa();

        // EN
        const { unmount: unmountEn } = renderAppWithFreshClient('en');
        await waitFor(() => {
            expect(
                screen.getByText('Unable to connect to API'),
            ).toBeInTheDocument();
        });
        expect(screen.getByText('HTTP error (status 500)')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Retry' }),
        ).toBeInTheDocument();
        unmountEn();

        // VI
        renderAppWithFreshClient('vi');
        await waitFor(() => {
            expect(
                screen.getByText('Không thể kết nối API'),
            ).toBeInTheDocument();
        });
        expect(screen.getByText('Lỗi HTTP (mã 500)')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Thử lại' }),
        ).toBeInTheDocument();
    });

    it('renders error UI when API returns HTTP 404 error', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: false,
                status: 404,
                statusText: 'Not Found',
                text: () => Promise.resolve(''),
            }),
        );

        renderAppWithFreshClient('ja');

        await waitFor(() => {
            expect(screen.getByText('APIに接続できません')).toBeInTheDocument();
        });

        expect(
            screen.getByText('HTTPエラー (ステータス 404)'),
        ).toBeInTheDocument();
    });

    it('renders error UI when network request fails and rejects', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockRejectedValue(new Error('Connection refused')),
        );

        renderAppWithFreshClient('ja');

        await waitFor(() => {
            expect(screen.getByText('APIに接続できません')).toBeInTheDocument();
        });

        expect(
            screen.getByText('ネットワークエラーが発生しました'),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: '再試行' }),
        ).toBeInTheDocument();
    });

    it('renders error UI when API returns malformed JSON missing required keys', async () => {
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

        renderAppWithFreshClient('ja');

        await waitFor(() => {
            expect(screen.getByText('APIに接続できません')).toBeInTheDocument();
        });

        expect(
            screen.getByText('受信したデータの形式が正しくありません'),
        ).toBeInTheDocument();
    });

    it('renders error UI when API returns non-object JSON payload', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                statusText: 'OK',
                text: () => Promise.resolve('"bad string payload"'),
            }),
        );

        renderAppWithFreshClient('ja');

        await waitFor(() => {
            expect(screen.getByText('APIに接続できません')).toBeInTheDocument();
        });

        expect(
            screen.getByText('受信したデータの形式が正しくありません'),
        ).toBeInTheDocument();
    });

    it('recovers and displays success state when retry button is clicked', async () => {
        const fetchMock = vi
            .fn()
            .mockRejectedValueOnce(new Error('Temporary network drop'))
            .mockResolvedValueOnce({
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
            });

        vi.stubGlobal('fetch', fetchMock);
        const user = userEvent.setup();

        renderAppWithFreshClient('ja');

        await waitFor(() => {
            expect(screen.getByText('APIに接続できません')).toBeInTheDocument();
        });

        const retryButton = screen.getByRole('button', { name: '再試行' });
        await user.click(retryButton);

        await waitFor(() => {
            expect(screen.getByText('APIステータス')).toBeInTheDocument();
        });
        expect(screen.getByText('ok')).toBeInTheDocument();
        expect(screen.getByText('up')).toBeInTheDocument();
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('refreshes health data when user clicks refresh button in success state', async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce({
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
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                statusText: 'OK',
                text: () =>
                    Promise.resolve(
                        JSON.stringify({
                            status: 'ok',
                            db: 'up',
                            time: '2026-10-12T10:05:00Z',
                        }),
                    ),
            });

        vi.stubGlobal('fetch', fetchMock);
        const user = userEvent.setup();

        renderAppWithFreshClient('ja');

        await waitFor(() => {
            expect(
                screen.getByText('2026-10-12T10:00:00Z'),
            ).toBeInTheDocument();
        });

        const refreshButton = screen.getByRole('button', {
            name: '更新',
        });
        await user.click(refreshButton);

        await waitFor(() => {
            expect(
                screen.getByText('2026-10-12T10:05:00Z'),
            ).toBeInTheDocument();
        });
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('renders error UI when API response has empty body', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                statusText: 'OK',
                text: () => Promise.resolve('   '),
            }),
        );

        renderAppWithFreshClient('ja');

        await waitFor(() => {
            expect(screen.getByText('APIに接続できません')).toBeInTheDocument();
        });

        expect(
            screen.getByText('レスポンスデータが空です'),
        ).toBeInTheDocument();
    });

    it('renders error UI when API response has invalid JSON', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                statusText: 'OK',
                text: () => Promise.resolve('{invalid json syntax}'),
            }),
        );

        renderAppWithFreshClient('ja');

        await waitFor(() => {
            expect(screen.getByText('APIに接続できません')).toBeInTheDocument();
        });

        expect(
            screen.getByText('不正なJSONデータを受信しました'),
        ).toBeInTheDocument();
    });

    it('renders success state when response contains extra fields', async () => {
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
                            version: '1.0.0',
                            environment: 'staging',
                        }),
                    ),
            }),
        );

        renderAppWithFreshClient('ja');

        await waitFor(() => {
            expect(screen.getByText('APIステータス')).toBeInTheDocument();
        });

        expect(screen.getByText('ok')).toBeInTheDocument();
        expect(screen.getByText('up')).toBeInTheDocument();
    });

    it('renders error UI when time is not a string in payload', async () => {
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
                            time: 1728727200,
                        }),
                    ),
            }),
        );

        renderAppWithFreshClient('ja');

        await waitFor(() => {
            expect(screen.getByText('APIに接続できません')).toBeInTheDocument();
        });

        expect(
            screen.getByText('受信したデータの形式が正しくありません'),
        ).toBeInTheDocument();
    });

    it('renders error UI when request is aborted', async () => {
        const abortError = new Error('The operation was aborted');
        abortError.name = 'AbortError';

        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError));

        renderAppWithFreshClient('ja');

        await waitFor(() => {
            expect(screen.getByText('APIに接続できません')).toBeInTheDocument();
        });

        expect(
            screen.getByText('リクエストが中断されました'),
        ).toBeInTheDocument();
    });

    it('switches UI language dynamically when using LanguageSwitcher within App', async () => {
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

        const user = userEvent.setup();
        renderAppWithFreshClient('ja');

        await waitFor(() => {
            expect(screen.getByText('APIステータス')).toBeInTheDocument();
        });

        await user.click(screen.getByRole('button', { name: 'Tiếng Việt' }));

        await waitFor(() => {
            expect(screen.getByText('Trạng thái API')).toBeInTheDocument();
        });
        expect(
            screen.getByRole('group', { name: 'Ngôn ngữ' }),
        ).toBeInTheDocument();
        expect(window.localStorage.getItem(STORAGE_KEY)).toBe('vi');
        expect(document.documentElement.lang).toBe('vi');

        await user.click(screen.getByRole('button', { name: 'English' }));
        await waitFor(() => {
            expect(screen.getByText('API Status')).toBeInTheDocument();
        });
        expect(
            screen.getByRole('group', { name: 'Language' }),
        ).toBeInTheDocument();
        expect(window.localStorage.getItem(STORAGE_KEY)).toBe('en');
        expect(document.documentElement.lang).toBe('en');
    });

    it('renders DevShowcase when URL hash is #/ui', async () => {
        window.location.hash = '#/ui';

        renderAppWithFreshClient('ja');

        await waitFor(() => {
            expect(
                screen.getByText('AI Home Component Showcase'),
            ).toBeInTheDocument();
        });

        window.location.hash = '';
    });

    it('renders the Wizard flow by default when URL hash is empty', async () => {
        window.location.hash = '';

        renderAppWithFreshClient('ja');

        await waitFor(() => {
            expect(screen.getByTestId('wizard-flow')).toBeInTheDocument();
        });
    });
});
