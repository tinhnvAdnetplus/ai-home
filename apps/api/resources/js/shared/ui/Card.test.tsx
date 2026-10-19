import { createRef } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from './Card';

describe('shared/ui/Card', () => {
    it('renders full card hierarchy with content', () => {
        render(
            <Card>
                <CardHeader>
                    <CardTitle>Card Title</CardTitle>
                    <CardDescription>Card Description</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Body Content</p>
                </CardContent>
                <CardFooter>
                    <button type="button">Action</button>
                </CardFooter>
            </Card>,
        );

        expect(
            screen.getByRole('heading', { name: 'Card Title' }),
        ).toBeInTheDocument();
        expect(screen.getByText('Card Description')).toBeInTheDocument();
        expect(screen.getByText('Body Content')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Action' }),
        ).toBeInTheDocument();
    });

    it('forwards custom className and ref to all subcomponents', () => {
        const cardRef = createRef<HTMLDivElement>();
        const titleRef = createRef<HTMLHeadingElement>();

        render(
            <Card ref={cardRef} className="custom-card">
                <CardTitle ref={titleRef} className="custom-title">
                    Title
                </CardTitle>
            </Card>,
        );

        expect(cardRef.current).toBeInstanceOf(HTMLDivElement);
        expect(cardRef.current).toHaveClass('custom-card');

        expect(titleRef.current).toBeInstanceOf(HTMLHeadingElement);
        expect(titleRef.current).toHaveClass('custom-title');
    });

    it('has no axe accessibility violations', async () => {
        const { container } = render(
            <Card>
                <CardHeader>
                    <CardTitle>Accessible Card</CardTitle>
                    <CardDescription>Accessible summary</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Accessible text</p>
                </CardContent>
            </Card>,
        );

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
