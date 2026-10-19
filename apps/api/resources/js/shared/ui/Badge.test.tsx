import { createRef } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Badge } from './Badge';

describe('shared/ui/Badge', () => {
    it('renders with children and default variant classes', () => {
        render(<Badge>Active Status</Badge>);
        const badge = screen.getByText('Active Status');
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveClass('bg-primary');
    });

    it('forwards custom className', () => {
        render(<Badge className="custom-badge">Tag</Badge>);
        expect(screen.getByText('Tag')).toHaveClass('custom-badge');
    });

    it('forwards ref to HTMLDivElement', () => {
        const ref = createRef<HTMLDivElement>();
        render(<Badge ref={ref}>Ref Badge</Badge>);
        expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('applies variant classes correctly', () => {
        const { rerender } = render(<Badge variant="secondary">Sec</Badge>);
        expect(screen.getByText('Sec')).toHaveClass('bg-muted');

        rerender(<Badge variant="destructive">Dest</Badge>);
        expect(screen.getByText('Dest')).toHaveClass('bg-destructive');

        rerender(<Badge variant="outline">Out</Badge>);
        expect(screen.getByText('Out')).toHaveClass('border-border');

        rerender(<Badge variant="success">Succ</Badge>);
        expect(screen.getByText('Succ')).toHaveClass('bg-success');

        rerender(<Badge variant="warning">Warn</Badge>);
        expect(screen.getByText('Warn')).toHaveClass('bg-warning');
    });

    it('has no axe accessibility violations', async () => {
        const { container } = render(<Badge>Accessible Badge</Badge>);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
