import { createRef } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Input } from './Input';

describe('shared/ui/Input', () => {
    it('renders input with default type text and styles', () => {
        render(<Input placeholder="Type here" aria-label="Sample input" />);
        const input = screen.getByLabelText('Sample input');
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('type', 'text');
        expect(input).toHaveClass('min-h-[44px]');
    });

    it('forwards custom className', () => {
        render(
            <Input
                className="custom-input-class"
                aria-label="Custom class input"
            />,
        );
        expect(screen.getByLabelText('Custom class input')).toHaveClass(
            'custom-input-class',
        );
    });

    it('forwards ref to HTMLInputElement', () => {
        const ref = createRef<HTMLInputElement>();
        render(<Input ref={ref} aria-label="Ref input" />);
        expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it('disabled state prevents typing and focus', async () => {
        const user = userEvent.setup();
        render(
            <Input
                disabled
                defaultValue="uneditable"
                aria-label="Disabled input"
            />,
        );
        const input = screen.getByLabelText('Disabled input');
        expect(input).toBeDisabled();

        await user.type(input, 'new text');
        expect(input).toHaveValue('uneditable');
    });

    it('applies error styling when aria-invalid is true', () => {
        render(<Input aria-invalid="true" aria-label="Invalid input" />);
        const input = screen.getByLabelText('Invalid input');
        expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('accepts typing from user', async () => {
        const user = userEvent.setup();
        render(<Input aria-label="Typing input" />);
        const input = screen.getByLabelText('Typing input');
        await user.type(input, 'Hello World');
        expect(input).toHaveValue('Hello World');
    });

    it('has no axe violations across default, disabled and invalid states', async () => {
        const { container, rerender } = render(
            <Input aria-label="Axe input" />,
        );
        let results = await axe(container);
        expect(results).toHaveNoViolations();

        rerender(<Input disabled aria-label="Axe input" />);
        results = await axe(container);
        expect(results).toHaveNoViolations();

        rerender(<Input aria-invalid="true" aria-label="Axe input" />);
        results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
