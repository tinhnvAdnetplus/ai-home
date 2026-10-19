import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { axe } from 'vitest-axe';
import { initI18n, STORAGE_KEY } from '../i18n/init';
import { LanguageSwitcher } from './LanguageSwitcher';

describe('shared/ui/LanguageSwitcher', () => {
    beforeEach(() => {
        window.localStorage.clear();
        document.documentElement.lang = '';
    });

    it('renders an accessible flag group with Japanese selected by default', () => {
        const i18n = initI18n('ja');
        render(
            <I18nextProvider i18n={i18n}>
                <LanguageSwitcher />
            </I18nextProvider>,
        );

        expect(screen.getByRole('group', { name: '言語' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '日本語' })).toHaveAttribute(
            'aria-pressed',
            'true',
        );
    });

    it('switches language and persists choice when user clicks a flag', async () => {
        const user = userEvent.setup();
        const i18n = initI18n('ja');
        const { rerender } = render(
            <I18nextProvider i18n={i18n}>
                <LanguageSwitcher />
            </I18nextProvider>,
        );

        await user.click(screen.getByRole('button', { name: 'English' }));

        expect(i18n.language).toBe('en');
        expect(window.localStorage.getItem(STORAGE_KEY)).toBe('en');
        expect(document.documentElement.lang).toBe('en');

        rerender(
            <I18nextProvider i18n={i18n}>
                <LanguageSwitcher />
            </I18nextProvider>,
        );

        expect(
            screen.getByRole('group', { name: 'Language' }),
        ).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute(
            'aria-pressed',
            'true',
        );
    });

    it('supports keyboard navigation and selection', async () => {
        const user = userEvent.setup();
        const i18n = initI18n('ja');
        render(
            <I18nextProvider i18n={i18n}>
                <LanguageSwitcher />
            </I18nextProvider>,
        );

        await user.tab();
        expect(screen.getByRole('button', { name: '日本語' })).toHaveFocus();
        await user.tab();
        await user.tab();
        await user.keyboard('{Enter}');
        expect(i18n.language).toBe('vi');
        expect(window.localStorage.getItem(STORAGE_KEY)).toBe('vi');
    });

    it('has no axe accessibility violations', async () => {
        const i18n = initI18n('ja');
        const { container } = render(
            <I18nextProvider i18n={i18n}>
                <LanguageSwitcher />
            </I18nextProvider>,
        );

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
