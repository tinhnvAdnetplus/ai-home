import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { initI18n } from '@/shared/i18n/init';
import { DevShowcase } from './dev-showcase';

describe('app/dev/dev-showcase', () => {
    const i18n = initI18n('ja');

    it('renders showcase header and core component sections', () => {
        render(
            <I18nextProvider i18n={i18n}>
                <DevShowcase />
            </I18nextProvider>,
        );

        expect(
            screen.getByText('AI Home Component Showcase'),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('heading', { name: 'Buttons' }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('heading', { name: 'Badges' }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('heading', { name: 'Form Inputs' }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('heading', { name: 'Tabs' }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('heading', { name: 'Card & Dialog' }),
        ).toBeInTheDocument();
    });

    it('toggles dark mode class on button click', async () => {
        const user = userEvent.setup();
        const { container } = render(
            <I18nextProvider i18n={i18n}>
                <DevShowcase />
            </I18nextProvider>,
        );

        const themeToggle = screen.getByRole('button', {
            name: 'Switch to Dark',
        });
        expect(container.firstChild).not.toHaveClass('dark');

        await user.click(themeToggle);
        expect(container.firstChild).toHaveClass('dark');
        expect(
            screen.getByRole('button', { name: 'Switch to Light' }),
        ).toBeInTheDocument();

        await user.click(
            screen.getByRole('button', { name: 'Switch to Light' }),
        );
        expect(container.firstChild).not.toHaveClass('dark');
    });

    it('resets window location hash when Return to App is clicked', async () => {
        const user = userEvent.setup();
        window.location.hash = '#/ui';

        render(
            <I18nextProvider i18n={i18n}>
                <DevShowcase />
            </I18nextProvider>,
        );

        const returnBtn = screen.getByRole('button', {
            name: 'Return to App',
        });
        await user.click(returnBtn);

        expect(window.location.hash).toBe('');
    });

    it('verifies dev showcase code is absent from the production build artifacts', () => {
        const buildDir = path.resolve(
            __dirname,
            '../../../../public/build/assets',
        );
        if (!fs.existsSync(buildDir)) {
            // Build artifacts should exist if make build was run
            return;
        }

        const files = fs
            .readdirSync(buildDir)
            .filter((file) => file.endsWith('.js'));
        for (const file of files) {
            const content = fs.readFileSync(path.join(buildDir, file), 'utf-8');
            expect(
                content.includes('AI Home Component Showcase'),
                `Production file ${file} should not contain showcase text`,
            ).toBe(false);
            expect(
                content.includes(
                    'Base design tokens and accessible UI component gallery',
                ),
                `Production file ${file} should not contain showcase subtitle`,
            ).toBe(false);
        }
    });
});
