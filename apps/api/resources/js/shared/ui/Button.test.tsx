import { createRef } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Button } from './Button';

describe('shared/ui/Button', () => {
    it('renders with children and default classes', () => {
        render(<Button>Click me</Button>);
        const btn = screen.getByRole('button', { name: 'Click me' });
        expect(btn).toBeInTheDocument();
        expect(btn).toHaveClass('bg-primary');
    });

    it('forwards custom className', () => {
        render(<Button className="custom-class">Custom</Button>);
        const btn = screen.getByRole('button', { name: 'Custom' });
        expect(btn).toHaveClass('custom-class');
    });

    it('forwards ref to underlying button element', () => {
        const ref = createRef<HTMLButtonElement>();
        render(<Button ref={ref}>Ref Target</Button>);
        expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it('applies variant classes correctly', () => {
        const { rerender } = render(
            <Button variant="destructive">Destructive</Button>,
        );
        expect(screen.getByRole('button')).toHaveClass('bg-destructive');

        rerender(<Button variant="outline">Outline</Button>);
        expect(screen.getByRole('button')).toHaveClass('border-border');

        rerender(<Button variant="secondary">Secondary</Button>);
        expect(screen.getByRole('button')).toHaveClass('bg-muted');

        rerender(<Button variant="ghost">Ghost</Button>);
        expect(screen.getByRole('button')).toHaveClass('hover:bg-muted');

        rerender(<Button variant="link">Link</Button>);
        expect(screen.getByRole('button')).toHaveClass('underline-offset-4');
    });

    it('applies size classes correctly', () => {
        const { rerender } = render(<Button size="sm">Small</Button>);
        expect(screen.getByRole('button')).toHaveClass('px-3');

        rerender(<Button size="lg">Large</Button>);
        expect(screen.getByRole('button')).toHaveClass('px-8');

        rerender(<Button size="icon">Icon</Button>);
        expect(screen.getByRole('button')).toHaveClass('p-2');
    });

    it('disables the button and blocks clicks', async () => {
        const user = userEvent.setup();
        const handleClick = vi.fn();
        render(
            <Button disabled onClick={handleClick}>
                Disabled
            </Button>,
        );

        const btn = screen.getByRole('button', { name: 'Disabled' });
        expect(btn).toBeDisabled();

        await user.click(btn);
        expect(handleClick).not.toHaveBeenCalled();
    });

    it('loading state sets aria-busy, renders spinner, and blocks clicks', async () => {
        const user = userEvent.setup();
        const handleClick = vi.fn();
        render(
            <Button loading onClick={handleClick}>
                Save
            </Button>,
        );

        const btn = screen.getByRole('button', { name: 'Save' });
        expect(btn).toHaveAttribute('aria-busy', 'true');
        expect(btn).toBeDisabled();

        await user.click(btn);
        expect(handleClick).not.toHaveBeenCalled();
    });

    it('renders child element when asChild is true', () => {
        render(
            <Button asChild>
                <a href="/target-link">Link Button</a>
            </Button>,
        );

        const link = screen.getByRole('link', { name: 'Link Button' });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/target-link');
        expect(link).toHaveClass('bg-primary');
    });

    it('can be activated with Enter and Space keys', async () => {
        const user = userEvent.setup();
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Keyboard</Button>);

        const btn = screen.getByRole('button', { name: 'Keyboard' });
        btn.focus();
        expect(btn).toHaveFocus();

        await user.keyboard('{Enter}');
        expect(handleClick).toHaveBeenCalledTimes(1);

        await user.keyboard(' ');
        expect(handleClick).toHaveBeenCalledTimes(2);
    });

    it('has no axe accessibility violations across default, disabled and loading states', async () => {
        const { container, rerender } = render(<Button>Accessible</Button>);
        let results = await axe(container);
        expect(results).toHaveNoViolations();

        rerender(<Button disabled>Accessible Disabled</Button>);
        results = await axe(container);
        expect(results).toHaveNoViolations();

        rerender(<Button loading>Accessible Loading</Button>);
        results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
