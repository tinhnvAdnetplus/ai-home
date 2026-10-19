import { useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { ShowcaseControls } from './showcase-controls';
import { ShowcasePanels } from './showcase-panels';

export function DevShowcase(): React.JSX.Element {
    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleTheme = (): void => {
        setIsDarkMode((isPrev) => !isPrev);
    };

    return (
        <div className={isDarkMode ? 'dark' : ''}>
            <div className="min-h-screen bg-background text-foreground transition-colors p-8 space-y-8">
                <header className="flex flex-wrap items-center justify-between pb-6 border-b border-border gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            AI Home Component Showcase
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Base design tokens and accessible UI component
                            gallery (Dev only)
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={toggleTheme}
                        >
                            {isDarkMode ? 'Switch to Light' : 'Switch to Dark'}
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                                window.location.hash = '';
                            }}
                        >
                            Return to App
                        </Button>
                    </div>
                </header>

                <main className="max-w-5xl mx-auto space-y-12">
                    <ShowcaseControls />
                    <ShowcasePanels />
                </main>
            </div>
        </div>
    );
}
