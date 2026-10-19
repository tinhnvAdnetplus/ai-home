import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { initI18n } from '../i18n/init';
import { ErrorFallback } from './ErrorFallback';

describe('shared/ui/ErrorFallback', () => {
    it('renders localized error heading and message in Japanese by default', () => {
        const resetMock = vi.fn();
        const i18n = initI18n('ja');

        render(
            <I18nextProvider i18n={i18n}>
                <ErrorFallback
                    error={{ code: 'NETWORK_ERROR' }}
                    resetErrorBoundary={resetMock}
                />
            </I18nextProvider>,
        );

        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(
            screen.getByRole('heading', { name: 'APIに接続できません' }),
        ).toBeInTheDocument();
        expect(
            screen.getByText('ネットワークエラーが発生しました'),
        ).toBeInTheDocument();
    });

    it('renders unknown error fallback when error has no recognized code', () => {
        const resetMock = vi.fn();
        const i18n = initI18n('ja');

        render(
            <I18nextProvider i18n={i18n}>
                <ErrorFallback
                    error={new Error('Uncaught runtime crash')}
                    resetErrorBoundary={resetMock}
                />
            </I18nextProvider>,
        );

        expect(
            screen.getByText('予期せぬエラーが発生しました'),
        ).toBeInTheDocument();
    });

    it('triggers resetErrorBoundary when retry button is clicked', async () => {
        const user = userEvent.setup();
        const resetMock = vi.fn();
        const i18n = initI18n('ja');

        render(
            <I18nextProvider i18n={i18n}>
                <ErrorFallback
                    error={{ code: 'NETWORK_ERROR' }}
                    resetErrorBoundary={resetMock}
                />
            </I18nextProvider>,
        );

        const retryButton = screen.getByRole('button', { name: '再試行' });
        await user.click(retryButton);

        expect(resetMock).toHaveBeenCalledTimes(1);
    });

    it('renders localized content in English when language is en', () => {
        const resetMock = vi.fn();
        const i18n = initI18n('en');

        render(
            <I18nextProvider i18n={i18n}>
                <ErrorFallback
                    error={{ code: 'NETWORK_ERROR' }}
                    resetErrorBoundary={resetMock}
                />
            </I18nextProvider>,
        );

        expect(
            screen.getByRole('heading', { name: 'Unable to connect to API' }),
        ).toBeInTheDocument();
        expect(screen.getByText('Network error occurred')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Retry' }),
        ).toBeInTheDocument();
    });
});
