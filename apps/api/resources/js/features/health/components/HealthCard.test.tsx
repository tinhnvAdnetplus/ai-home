import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { initI18n } from '@/shared/i18n/init';
import { HealthCard } from './HealthCard';

describe('features/health/components/HealthCard', () => {
    it('renders skeleton during loading state', () => {
        const i18n = initI18n('ja');
        render(
            <I18nextProvider i18n={i18n}>
                <HealthCard
                    isLoading={true}
                    isError={false}
                    onRefresh={vi.fn()}
                />
            </I18nextProvider>,
        );

        expect(
            screen.getByText('APIヘルスエンドポイントに接続中...'),
        ).toBeInTheDocument();
    });

    it('renders error state with retry button', async () => {
        const user = userEvent.setup();
        const refreshMock = vi.fn();
        const i18n = initI18n('ja');

        render(
            <I18nextProvider i18n={i18n}>
                <HealthCard
                    isLoading={false}
                    isError={true}
                    error={{ code: 'NETWORK_ERROR' }}
                    onRefresh={refreshMock}
                />
            </I18nextProvider>,
        );

        expect(
            screen.getByRole('heading', { name: 'APIに接続できません' }),
        ).toBeInTheDocument();
        expect(
            screen.getByText('ネットワークエラーが発生しました'),
        ).toBeInTheDocument();

        const retryBtn = screen.getByRole('button', { name: '再試行' });
        await user.click(retryBtn);

        expect(refreshMock).toHaveBeenCalledTimes(1);
    });

    it('renders success state with status, db, time and refresh button', async () => {
        const user = userEvent.setup();
        const refreshMock = vi.fn();
        const i18n = initI18n('ja');

        render(
            <I18nextProvider i18n={i18n}>
                <HealthCard
                    isLoading={false}
                    isError={false}
                    data={{
                        status: 'ok',
                        db: 'up',
                        time: '2026-10-12T10:00:00Z',
                    }}
                    onRefresh={refreshMock}
                />
            </I18nextProvider>,
        );

        expect(screen.getByText('APIステータス')).toBeInTheDocument();
        expect(screen.getByText('ok')).toBeInTheDocument();
        expect(
            screen.getByText('データベース (MySQL 8.4)'),
        ).toBeInTheDocument();
        expect(screen.getByText('up')).toBeInTheDocument();
        expect(screen.getByText('サーバーUTC時刻')).toBeInTheDocument();
        expect(screen.getByText('2026-10-12T10:00:00Z')).toBeInTheDocument();

        const refreshBtn = screen.getByRole('button', {
            name: '更新',
        });
        await user.click(refreshBtn);

        expect(refreshMock).toHaveBeenCalledTimes(1);
    });

    it('renders fallback when data is missing and not loading or error', () => {
        const i18n = initI18n('ja');
        render(
            <I18nextProvider i18n={i18n}>
                <HealthCard
                    isLoading={false}
                    isError={false}
                    onRefresh={vi.fn()}
                />
            </I18nextProvider>,
        );

        expect(screen.getByText('データがありません')).toBeInTheDocument();
    });
});
