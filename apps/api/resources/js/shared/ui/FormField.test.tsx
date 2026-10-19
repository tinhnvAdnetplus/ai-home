import { createRef } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { FormField } from './FormField';
import { Input } from './Input';

describe('shared/ui/FormField', () => {
    it('renders label and control', () => {
        render(
            <FormField id="test-email" label="Email Address">
                <Input type="email" />
            </FormField>,
        );

        expect(screen.getByText('Email Address')).toBeInTheDocument();
        const input = screen.getByRole('textbox', { name: 'Email Address' });
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('id', 'test-email');
        expect(input).toHaveAttribute('aria-invalid', 'false');
    });

    it('focuses the control when label is clicked', async () => {
        const user = userEvent.setup();
        render(
            <FormField id="username" label="Username">
                <Input />
            </FormField>,
        );

        const input = screen.getByRole('textbox', { name: 'Username' });
        expect(input).not.toHaveFocus();

        await user.click(screen.getByText('Username'));
        expect(input).toHaveFocus();
    });

    it('wires hint text into aria-describedby', () => {
        render(
            <FormField id="phone" label="Phone Number" hint="Include area code">
                <Input type="tel" />
            </FormField>,
        );

        const input = screen.getByRole('textbox', { name: 'Phone Number' });
        expect(input).toHaveAttribute('aria-describedby', 'phone-hint');
        expect(screen.getByText('Include area code')).toHaveAttribute(
            'id',
            'phone-hint',
        );
    });

    it('announces error text via aria-describedby and toggles aria-invalid to true', () => {
        render(
            <FormField
                id="password"
                label="Password"
                error="Password is required"
            >
                <Input type="password" />
            </FormField>,
        );

        const input = screen.getByLabelText('Password');
        expect(input).toHaveAttribute('aria-describedby', 'password-error');
        expect(input).toHaveAttribute('aria-invalid', 'true');

        const errorEl = screen.getByRole('alert');
        expect(errorEl).toHaveTextContent('Password is required');
        expect(errorEl).toHaveAttribute('id', 'password-error');
    });

    it('supports render prop function children', () => {
        render(
            <FormField id="render-prop-field" label="Custom Control">
                {(props) => <Input data-testid="custom-ctrl" {...props} />}
            </FormField>,
        );

        const input = screen.getByTestId('custom-ctrl');
        expect(input).toHaveAttribute('id', 'render-prop-field');
    });

    it('renders required indicator when required is true', () => {
        render(
            <FormField id="req-field" label="Required Field" required>
                <Input />
            </FormField>,
        );

        expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');
    });

    it('forwards ref and custom className to outer container', () => {
        const ref = createRef<HTMLDivElement>();
        render(
            <FormField
                ref={ref}
                id="ref-field"
                label="Ref Label"
                className="custom-field-container"
            >
                <Input />
            </FormField>,
        );

        expect(ref.current).toBeInstanceOf(HTMLDivElement);
        expect(ref.current).toHaveClass('custom-field-container');
    });

    it('has no axe violations in default, hint, and error states', async () => {
        const { container, rerender } = render(
            <FormField id="axe-field" label="Accessible Field">
                <Input />
            </FormField>,
        );
        let results = await axe(container);
        expect(results).toHaveNoViolations();

        rerender(
            <FormField
                id="axe-field"
                label="Accessible Field"
                hint="Helper text"
            >
                <Input />
            </FormField>,
        );
        results = await axe(container);
        expect(results).toHaveNoViolations();

        rerender(
            <FormField
                id="axe-field"
                label="Accessible Field"
                error="Error description"
            >
                <Input />
            </FormField>,
        );
        results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
