import { createRef } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from './Select';

describe('shared/ui/Select', () => {
    it('renders trigger with placeholder', () => {
        render(
            <Select>
                <SelectTrigger aria-label="Framework">
                    <SelectValue placeholder="Choose a framework" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="react">React</SelectItem>
                    <SelectItem value="vue">Vue</SelectItem>
                </SelectContent>
            </Select>,
        );

        expect(
            screen.getByRole('combobox', { name: 'Framework' }),
        ).toBeInTheDocument();
        expect(screen.getByText('Choose a framework')).toBeInTheDocument();
    });

    it('forwards custom className and ref to trigger', () => {
        const triggerRef = createRef<HTMLButtonElement>();
        render(
            <Select>
                <SelectTrigger
                    ref={triggerRef}
                    className="custom-trigger"
                    aria-label="Ref select"
                >
                    <SelectValue placeholder="Pick one" />
                </SelectTrigger>
            </Select>,
        );

        expect(triggerRef.current).toBeInstanceOf(HTMLButtonElement);
        expect(triggerRef.current).toHaveClass('custom-trigger');
    });

    it('opens options and selects an item on user click', async () => {
        const user = userEvent.setup();
        const handleValueChange = vi.fn();
        render(
            <Select onValueChange={handleValueChange}>
                <SelectTrigger aria-label="Fruit">
                    <SelectValue placeholder="Select fruit" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="apple">Apple</SelectItem>
                    <SelectItem value="banana">Banana</SelectItem>
                </SelectContent>
            </Select>,
        );

        const trigger = screen.getByRole('combobox', { name: 'Fruit' });
        await user.click(trigger);

        const bananaOption = await screen.findByRole('option', {
            name: 'Banana',
        });
        expect(bananaOption).toBeInTheDocument();

        await user.click(bananaOption);
        expect(handleValueChange).toHaveBeenCalledWith('banana');
    });

    it('disabled trigger is disabled and cannot be opened', async () => {
        const user = userEvent.setup();
        render(
            <Select disabled>
                <SelectTrigger aria-label="Disabled select">
                    <SelectValue placeholder="Cannot open" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="opt">Option</SelectItem>
                </SelectContent>
            </Select>,
        );

        const trigger = screen.getByRole('combobox', {
            name: 'Disabled select',
        });
        expect(trigger).toBeDisabled();

        await user.click(trigger);
        expect(screen.queryByRole('option')).not.toBeInTheDocument();
    });

    it('has no axe violations when closed', async () => {
        const { container } = render(
            <Select>
                <SelectTrigger aria-label="Accessible select">
                    <SelectValue placeholder="Accessible choice" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="1">One</SelectItem>
                </SelectContent>
            </Select>,
        );

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
