import { createRef } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Checkbox } from './Checkbox';

describe('shared/ui/Checkbox', () => {
    it('renders with checkbox role and default unchecked state', () => {
        render(<Checkbox aria-label="Accept terms" />);
        const checkbox = screen.getByRole('checkbox', { name: 'Accept terms' });
        expect(checkbox).toBeInTheDocument();
        expect(checkbox).toHaveAttribute('aria-checked', 'false');
    });

    it('forwards custom className', () => {
        render(
            <Checkbox
                className="custom-checkbox"
                aria-label="Custom checkbox"
            />,
        );
        expect(
            screen.getByRole('checkbox', { name: 'Custom checkbox' }),
        ).toHaveClass('custom-checkbox');
    });

    it('forwards ref to button element', () => {
        const ref = createRef<HTMLButtonElement>();
        render(<Checkbox ref={ref} aria-label="Ref checkbox" />);
        expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it('toggles state on user click', async () => {
        const user = userEvent.setup();
        const handleCheckedChange = vi.fn();
        render(
            <Checkbox
                aria-label="Terms"
                onCheckedChange={handleCheckedChange}
            />,
        );

        const checkbox = screen.getByRole('checkbox', { name: 'Terms' });
        await user.click(checkbox);
        expect(handleCheckedChange).toHaveBeenCalledWith(true);
    });

    it('toggles on Space key press', async () => {
        const user = userEvent.setup();
        const handleCheckedChange = vi.fn();
        render(
            <Checkbox
                aria-label="Toggle Space"
                onCheckedChange={handleCheckedChange}
            />,
        );

        const checkbox = screen.getByRole('checkbox', { name: 'Toggle Space' });
        checkbox.focus();
        expect(checkbox).toHaveFocus();

        await user.keyboard(' ');
        expect(handleCheckedChange).toHaveBeenCalledWith(true);
    });

    it('disabled state prevents click and Space key toggles', async () => {
        const user = userEvent.setup();
        const handleCheckedChange = vi.fn();
        render(
            <Checkbox
                disabled
                aria-label="Disabled terms"
                onCheckedChange={handleCheckedChange}
            />,
        );

        const checkbox = screen.getByRole('checkbox', {
            name: 'Disabled terms',
        });
        expect(checkbox).toBeDisabled();

        await user.click(checkbox);
        expect(handleCheckedChange).not.toHaveBeenCalled();
    });

    it('has no axe accessibility violations across default, checked and disabled states', async () => {
        const { container, rerender } = render(
            <Checkbox aria-label="Axe terms" />,
        );
        let results = await axe(container);
        expect(results).toHaveNoViolations();

        rerender(<Checkbox checked aria-label="Axe terms" />);
        results = await axe(container);
        expect(results).toHaveNoViolations();

        rerender(<Checkbox disabled aria-label="Axe terms" />);
        results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
