import { createRef } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Label } from './Label';

describe('shared/ui/Label', () => {
    it('renders with text content', () => {
        render(<Label htmlFor="input-id">Username</Label>);
        const label = screen.getByText('Username');
        expect(label).toBeInTheDocument();
        expect(label).toHaveAttribute('for', 'input-id');
    });

    it('forwards custom className', () => {
        render(<Label className="custom-label">Custom Label</Label>);
        expect(screen.getByText('Custom Label')).toHaveClass('custom-label');
    });

    it('forwards ref to HTMLLabelElement', () => {
        const ref = createRef<HTMLLabelElement>();
        render(<Label ref={ref}>Ref Label</Label>);
        expect(ref.current).toBeInstanceOf(HTMLLabelElement);
    });

    it('focuses the target input when clicked', async () => {
        const user = userEvent.setup();
        render(
            <div>
                <Label htmlFor="target-field">Field Label</Label>
                <input id="target-field" type="text" />
            </div>,
        );

        const input = screen.getByRole('textbox');
        expect(input).not.toHaveFocus();

        await user.click(screen.getByText('Field Label'));
        expect(input).toHaveFocus();
    });

    it('has no axe violations', async () => {
        const { container } = render(
            <div>
                <Label htmlFor="accessible-id">Accessible Label</Label>
                <input id="accessible-id" type="text" />
            </div>,
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
