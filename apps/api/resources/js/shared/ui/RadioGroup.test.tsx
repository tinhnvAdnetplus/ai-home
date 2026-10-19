import { createRef } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { RadioGroup, RadioGroupItem } from './RadioGroup';
import { Label } from './Label';

describe('shared/ui/RadioGroup', () => {
    it('renders radio group and items with radiogroup roles', () => {
        render(
            <RadioGroup defaultValue="opt1" aria-label="Choices">
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="opt1" id="r1" />
                    <Label htmlFor="r1">Option 1</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="opt2" id="r2" />
                    <Label htmlFor="r2">Option 2</Label>
                </div>
            </RadioGroup>,
        );

        const group = screen.getByRole('radiogroup', { name: 'Choices' });
        expect(group).toBeInTheDocument();

        const radio1 = screen.getByRole('radio', { name: 'Option 1' });
        const radio2 = screen.getByRole('radio', { name: 'Option 2' });
        expect(radio1).toBeChecked();
        expect(radio2).not.toBeChecked();
    });

    it('forwards custom className and ref', () => {
        const groupRef = createRef<HTMLDivElement>();
        render(
            <RadioGroup
                ref={groupRef}
                className="custom-radio-group"
                aria-label="Ref Group"
            >
                <RadioGroupItem value="item" aria-label="Item" />
            </RadioGroup>,
        );

        expect(groupRef.current).toBeInstanceOf(HTMLDivElement);
        expect(groupRef.current).toHaveClass('custom-radio-group');
    });

    it('changes selection on user click', async () => {
        const user = userEvent.setup();
        const handleValueChange = vi.fn();
        render(
            <RadioGroup
                defaultValue="a"
                aria-label="Letters"
                onValueChange={handleValueChange}
            >
                <RadioGroupItem value="a" aria-label="A" />
                <RadioGroupItem value="b" aria-label="B" />
            </RadioGroup>,
        );

        const radioB = screen.getByRole('radio', { name: 'B' });
        await user.click(radioB);

        expect(handleValueChange).toHaveBeenCalledWith('b');
        expect(radioB).toBeChecked();
    });

    it('supports arrow key navigation between options', async () => {
        const user = userEvent.setup();
        const handleValueChange = vi.fn();
        render(
            <RadioGroup
                defaultValue="opt1"
                aria-label="Navigation"
                onValueChange={handleValueChange}
            >
                <RadioGroupItem value="opt1" aria-label="First" />
                <RadioGroupItem value="opt2" aria-label="Second" />
                <RadioGroupItem value="opt3" aria-label="Third" />
            </RadioGroup>,
        );

        const first = screen.getByRole('radio', { name: 'First' });
        first.focus();
        expect(first).toHaveFocus();

        await user.keyboard('{ArrowDown}');
        const second = screen.getByRole('radio', { name: 'Second' });
        expect(second).toHaveFocus();
        await user.keyboard(' ');
        expect(second).toBeChecked();
        expect(handleValueChange).toHaveBeenCalledWith('opt2');
    });

    it('disabled item cannot be selected or focused', async () => {
        const user = userEvent.setup();
        const handleValueChange = vi.fn();
        render(
            <RadioGroup
                defaultValue="first"
                aria-label="Disabled test"
                onValueChange={handleValueChange}
            >
                <RadioGroupItem value="first" aria-label="Active" />
                <RadioGroupItem value="second" disabled aria-label="Disabled" />
            </RadioGroup>,
        );

        const disabledRadio = screen.getByRole('radio', { name: 'Disabled' });
        expect(disabledRadio).toBeDisabled();

        await user.click(disabledRadio);
        expect(handleValueChange).not.toHaveBeenCalled();
    });

    it('has no axe accessibility violations', async () => {
        const { container } = render(
            <RadioGroup defaultValue="opt1" aria-label="Accessible group">
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="opt1" id="acc1" />
                    <Label htmlFor="acc1">Accessible 1</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="opt2" id="acc2" />
                    <Label htmlFor="acc2">Accessible 2</Label>
                </div>
            </RadioGroup>,
        );

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
