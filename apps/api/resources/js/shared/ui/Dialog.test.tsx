import { createRef } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { I18nextProvider } from 'react-i18next';
import { initI18n } from '@/shared/i18n/init';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from './Dialog';

describe('shared/ui/Dialog', () => {
    const i18n = initI18n('ja');

    it('opens dialog when trigger is clicked and displays title and description', async () => {
        const user = userEvent.setup();
        render(
            <I18nextProvider i18n={i18n}>
                <Dialog>
                    <DialogTrigger asChild>
                        <button type="button">Open Modal</button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Dialog Title</DialogTitle>
                            <DialogDescription>
                                Dialog explanation
                            </DialogDescription>
                        </DialogHeader>
                        <div>Dialog body</div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <button type="button">Dismiss</button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </I18nextProvider>,
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

        const trigger = screen.getByRole('button', { name: 'Open Modal' });
        await user.click(trigger);

        const dialog = await screen.findByRole('dialog');
        expect(dialog).toBeInTheDocument();
        expect(
            screen.getByRole('heading', { name: 'Dialog Title' }),
        ).toBeInTheDocument();
        expect(screen.getByText('Dialog explanation')).toBeInTheDocument();
    });

    it('closes on Escape key press and returns focus to the trigger', async () => {
        const user = userEvent.setup();
        render(
            <I18nextProvider i18n={i18n}>
                <Dialog>
                    <DialogTrigger asChild>
                        <button type="button">Open For Escape</button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Escape Modal</DialogTitle>
                            <DialogDescription>Description</DialogDescription>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
            </I18nextProvider>,
        );

        const trigger = screen.getByRole('button', { name: 'Open For Escape' });
        await user.click(trigger);

        const dialog = await screen.findByRole('dialog');
        expect(dialog).toBeInTheDocument();

        await user.keyboard('{Escape}');
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(trigger).toHaveFocus();
    });

    it('closes when close button is clicked and returns focus to trigger', async () => {
        const user = userEvent.setup();
        render(
            <I18nextProvider i18n={i18n}>
                <Dialog>
                    <DialogTrigger asChild>
                        <button type="button">Open For Close Button</button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Close Modal</DialogTitle>
                            <DialogDescription>Description</DialogDescription>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
            </I18nextProvider>,
        );

        const trigger = screen.getByRole('button', {
            name: 'Open For Close Button',
        });
        await user.click(trigger);

        const closeButton = await screen.findByRole('button', {
            name: '閉じる',
        });
        await user.click(closeButton);

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(trigger).toHaveFocus();
    });

    it('traps focus inside the dialog when open', async () => {
        const user = userEvent.setup();
        render(
            <I18nextProvider i18n={i18n}>
                <div>
                    <button type="button">Outside Button</button>
                    <Dialog>
                        <DialogTrigger asChild>
                            <button type="button">Open Focus Trap</button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Trap Dialog</DialogTitle>
                                <DialogDescription>
                                    Description
                                </DialogDescription>
                            </DialogHeader>
                            <button type="button">First Inside</button>
                            <button type="button">Second Inside</button>
                        </DialogContent>
                    </Dialog>
                </div>
            </I18nextProvider>,
        );

        const trigger = screen.getByRole('button', { name: 'Open Focus Trap' });
        await user.click(trigger);

        const first = await screen.findByRole('button', {
            name: 'First Inside',
        });
        const second = screen.getByRole('button', { name: 'Second Inside' });
        const close = screen.getByRole('button', { name: '閉じる' });

        first.focus();
        expect(first).toHaveFocus();

        await user.tab();
        expect(second).toHaveFocus();

        await user.tab();
        expect(close).toHaveFocus();

        // Tabbing from the last element cycles back inside dialog (focus trap)
        await user.tab();
        expect(first).toHaveFocus();
    });

    it('forwards custom className and ref', () => {
        const titleRef = createRef<HTMLHeadingElement>();
        render(
            <I18nextProvider i18n={i18n}>
                <Dialog open>
                    <DialogContent className="custom-dialog-content">
                        <DialogTitle ref={titleRef} className="custom-title">
                            Ref Title
                        </DialogTitle>
                        <DialogDescription>Description</DialogDescription>
                    </DialogContent>
                </Dialog>
            </I18nextProvider>,
        );

        expect(titleRef.current).toBeInstanceOf(HTMLHeadingElement);
        expect(titleRef.current).toHaveClass('custom-title');
    });

    it('has no axe violations when open', async () => {
        const { container } = render(
            <I18nextProvider i18n={i18n}>
                <Dialog open>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Accessible Modal</DialogTitle>
                            <DialogDescription>
                                Fully accessible dialog description
                            </DialogDescription>
                        </DialogHeader>
                        <div>Content</div>
                    </DialogContent>
                </Dialog>
            </I18nextProvider>,
        );

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
