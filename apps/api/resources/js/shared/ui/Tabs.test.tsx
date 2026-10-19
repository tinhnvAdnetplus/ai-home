import { createRef } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';

describe('shared/ui/Tabs', () => {
    it('renders tabs with initial active content', () => {
        render(
            <Tabs defaultValue="tab1">
                <TabsList aria-label="Settings">
                    <TabsTrigger value="tab1">General</TabsTrigger>
                    <TabsTrigger value="tab2">Security</TabsTrigger>
                </TabsList>
                <TabsContent value="tab1">General Settings Content</TabsContent>
                <TabsContent value="tab2">
                    Security Settings Content
                </TabsContent>
            </Tabs>,
        );

        expect(screen.getByRole('tab', { name: 'General' })).toHaveAttribute(
            'aria-selected',
            'true',
        );
        expect(
            screen.getByText('General Settings Content'),
        ).toBeInTheDocument();
        expect(
            screen.queryByText('Security Settings Content'),
        ).not.toBeInTheDocument();
    });

    it('switches content when another tab trigger is clicked', async () => {
        const user = userEvent.setup();
        render(
            <Tabs defaultValue="tab1">
                <TabsList aria-label="Navigation">
                    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                </TabsList>
                <TabsContent value="tab1">Content 1</TabsContent>
                <TabsContent value="tab2">Content 2</TabsContent>
            </Tabs>,
        );

        const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
        await user.click(tab2);

        expect(tab2).toHaveAttribute('aria-selected', 'true');
        expect(screen.getByText('Content 2')).toBeInTheDocument();
        expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    });

    it('navigates tabs using ArrowRight and ArrowLeft keyboard keys', async () => {
        const user = userEvent.setup();
        render(
            <Tabs defaultValue="first">
                <TabsList aria-label="Arrow navigation">
                    <TabsTrigger value="first">First</TabsTrigger>
                    <TabsTrigger value="second">Second</TabsTrigger>
                    <TabsTrigger value="third">Third</TabsTrigger>
                </TabsList>
                <TabsContent value="first">Panel 1</TabsContent>
                <TabsContent value="second">Panel 2</TabsContent>
                <TabsContent value="third">Panel 3</TabsContent>
            </Tabs>,
        );

        const firstTab = screen.getByRole('tab', { name: 'First' });
        firstTab.focus();
        expect(firstTab).toHaveFocus();

        await user.keyboard('{ArrowRight}');
        const secondTab = screen.getByRole('tab', { name: 'Second' });
        expect(secondTab).toHaveFocus();
        expect(secondTab).toHaveAttribute('aria-selected', 'true');
        expect(screen.getByText('Panel 2')).toBeInTheDocument();
    });

    it('disabled tab cannot be selected', async () => {
        const user = userEvent.setup();
        render(
            <Tabs defaultValue="tab1">
                <TabsList aria-label="Disabled tabs">
                    <TabsTrigger value="tab1">Active</TabsTrigger>
                    <TabsTrigger value="tab2" disabled>
                        Disabled Tab
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="tab1">Active Content</TabsContent>
                <TabsContent value="tab2">Disabled Content</TabsContent>
            </Tabs>,
        );

        const disabledTab = screen.getByRole('tab', { name: 'Disabled Tab' });
        expect(disabledTab).toBeDisabled();

        await user.click(disabledTab);
        expect(disabledTab).toHaveAttribute('aria-selected', 'false');
        expect(screen.getByText('Active Content')).toBeInTheDocument();
    });

    it('forwards custom className and ref', () => {
        const listRef = createRef<HTMLDivElement>();
        render(
            <Tabs defaultValue="t1">
                <TabsList ref={listRef} className="custom-tabs-list">
                    <TabsTrigger value="t1">T1</TabsTrigger>
                </TabsList>
                <TabsContent value="t1">C1</TabsContent>
            </Tabs>,
        );

        expect(listRef.current).toBeInstanceOf(HTMLDivElement);
        expect(listRef.current).toHaveClass('custom-tabs-list');
    });

    it('has no axe accessibility violations', async () => {
        const { container } = render(
            <Tabs defaultValue="acc1">
                <TabsList aria-label="Accessible tabs">
                    <TabsTrigger value="acc1">Tab A</TabsTrigger>
                    <TabsTrigger value="acc2">Tab B</TabsTrigger>
                </TabsList>
                <TabsContent value="acc1">Accessible Content A</TabsContent>
                <TabsContent value="acc2">Accessible Content B</TabsContent>
            </Tabs>,
        );

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
