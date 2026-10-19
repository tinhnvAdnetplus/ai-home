import { createRef } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Textarea } from './Textarea';

describe('shared/ui/Textarea', () => {
    it('renders textarea with default styles', () => {
        render(<Textarea aria-label="Comment" placeholder="Write here" />);
        const textarea = screen.getByLabelText('Comment');
        expect(textarea).toBeInTheDocument();
        expect(textarea).toHaveClass('min-h-[80px]');
    });

    it('forwards custom className', () => {
        render(
            <Textarea
                className="custom-textarea"
                aria-label="Custom textarea"
            />,
        );
        expect(screen.getByLabelText('Custom textarea')).toHaveClass(
            'custom-textarea',
        );
    });

    it('forwards ref to HTMLTextAreaElement', () => {
        const ref = createRef<HTMLTextAreaElement>();
        render(<Textarea ref={ref} aria-label="Ref textarea" />);
        expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
    });

    it('disabled state prevents editing', async () => {
        const user = userEvent.setup();
        render(
            <Textarea
                disabled
                defaultValue="initial text"
                aria-label="Disabled textarea"
            />,
        );

        const textarea = screen.getByLabelText('Disabled textarea');
        expect(textarea).toBeDisabled();

        await user.type(textarea, 'more text');
        expect(textarea).toHaveValue('initial text');
    });

    it('accepts typing from user', async () => {
        const user = userEvent.setup();
        render(<Textarea aria-label="Typing textarea" />);
        const textarea = screen.getByLabelText('Typing textarea');

        await user.type(textarea, 'Line 1{enter}Line 2');
        expect(textarea).toHaveValue('Line 1\nLine 2');
    });

    it('has no axe accessibility violations across default, disabled and invalid states', async () => {
        const { container, rerender } = render(
            <Textarea aria-label="Accessible textarea" />,
        );
        let results = await axe(container);
        expect(results).toHaveNoViolations();

        rerender(<Textarea disabled aria-label="Accessible textarea" />);
        results = await axe(container);
        expect(results).toHaveNoViolations();

        rerender(
            <Textarea aria-invalid="true" aria-label="Accessible textarea" />,
        );
        results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
