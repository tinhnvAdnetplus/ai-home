import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

function hexToRgb(hex: string): [number, number, number] {
    const cleanHex = hex.replace('#', '').trim();
    if (cleanHex.length === 3) {
        const r = parseInt(cleanHex.charAt(0) + cleanHex.charAt(0), 16);
        const g = parseInt(cleanHex.charAt(1) + cleanHex.charAt(1), 16);
        const b = parseInt(cleanHex.charAt(2) + cleanHex.charAt(2), 16);
        return [r, g, b];
    }
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return [r, g, b];
}

function channelLuminance(val: number): number {
    const channel = val / 255;
    return channel <= 0.04045
        ? channel / 12.92
        : Math.pow((channel + 0.055) / 1.055, 2.4);
}

function getLuminance(rgb: [number, number, number]): number {
    const r = channelLuminance(rgb[0]);
    const g = channelLuminance(rgb[1]);
    const b = channelLuminance(rgb[2]);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function getContrastRatio(hex1: string, hex2: string): number {
    const lum1 = getLuminance(hexToRgb(hex1));
    const lum2 = getLuminance(hexToRgb(hex2));
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
}

function parseCssVariables(
    css: string,
    selectorRegex: RegExp,
): Record<string, string> {
    const match = selectorRegex.exec(css);
    if (!match?.[1]) {
        return {};
    }
    const block = match[1];
    const vars: Record<string, string> = {};
    const varRegex = /--([\w-]+)\s*:\s*([^;]+);/g;
    let varMatch: RegExpExecArray | null = null;
    while ((varMatch = varRegex.exec(block)) !== null) {
        if (varMatch[1] && varMatch[2]) {
            vars[varMatch[1]] = varMatch[2].trim();
        }
    }
    return vars;
}

describe('Design Tokens Verification', () => {
    const cssPath = path.resolve(__dirname, '../../../css/tokens.css');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');

    const rootVars = parseCssVariables(cssContent, /:root\s*\{([^}]+)\}/);
    const darkVars = parseCssVariables(cssContent, /\.dark\s*\{([^}]+)\}/);
    const themeVars = parseCssVariables(cssContent, /@theme\s*\{([^}]+)\}/);

    const semanticTokens = [
        'background',
        'foreground',
        'card',
        'card-foreground',
        'muted',
        'muted-foreground',
        'border',
        'ring',
        'primary',
        'primary-foreground',
        'destructive',
        'destructive-foreground',
        'success',
        'success-foreground',
        'warning',
        'warning-foreground',
        'accent',
        'accent-foreground',
    ];

    it('defines all required brand scale steps', () => {
        const brandSteps = [
            'color-brand-50',
            'color-brand-100',
            'color-brand-200',
            'color-brand-300',
            'color-brand-400',
            'color-brand-500',
            'color-brand-600',
            'color-brand-700',
            'color-brand-800',
            'color-brand-900',
            'color-brand-950',
            'color-accent-50',
            'color-accent-100',
            'color-accent-200',
            'color-accent-500',
            'color-accent-600',
            'color-accent-700',
            'color-accent-800',
        ];

        for (const step of brandSteps) {
            expect(themeVars[step]).toBeDefined();
            expect(themeVars[step]).toMatch(/^#[0-9a-fA-F]{6}$/);
        }
    });

    it('defines base radius and touch spacing', () => {
        expect(rootVars.radius).toBeDefined();
        expect(rootVars['spacing-touch']).toBe('44px');
    });

    it('has both a light and dark value for every semantic token', () => {
        for (const token of semanticTokens) {
            expect(rootVars[token]).toBeDefined();
            expect(darkVars[token]).toBeDefined();
        }
    });

    it('satisfies WCAG AA contrast threshold (>= 4.5:1) for all text pairs in light mode', () => {
        const lightPairs = [
            {
                fg: rootVars.foreground,
                bg: rootVars.background,
                name: 'foreground/background',
            },
            {
                fg: rootVars['card-foreground'],
                bg: rootVars.card,
                name: 'card-foreground/card',
            },
            {
                fg: rootVars['muted-foreground'],
                bg: rootVars.muted,
                name: 'muted-foreground/muted',
            },
            {
                fg: rootVars['primary-foreground'],
                bg: rootVars.primary,
                name: 'primary-foreground/primary',
            },
            {
                fg: rootVars['accent-foreground'],
                bg: rootVars.accent,
                name: 'accent-foreground/accent',
            },
            {
                fg: rootVars['destructive-foreground'],
                bg: rootVars.destructive,
                name: 'destructive-foreground/destructive',
            },
            {
                fg: rootVars['success-foreground'],
                bg: rootVars.success,
                name: 'success-foreground/success',
            },
            {
                fg: rootVars['warning-foreground'],
                bg: rootVars.warning,
                name: 'warning-foreground/warning',
            },
        ];

        for (const pair of lightPairs) {
            const ratio = getContrastRatio(
                pair.fg ?? '#000',
                pair.bg ?? '#fff',
            );
            expect(
                ratio,
                `Light mode pair "${pair.name}" ratio ${ratio.toFixed(2)} must be >= 4.5`,
            ).toBeGreaterThanOrEqual(4.5);
        }
    });

    it('satisfies WCAG AA contrast threshold (>= 4.5:1) for all text pairs in dark mode', () => {
        const darkPairs = [
            {
                fg: darkVars.foreground,
                bg: darkVars.background,
                name: 'foreground/background',
            },
            {
                fg: darkVars['card-foreground'],
                bg: darkVars.card,
                name: 'card-foreground/card',
            },
            {
                fg: darkVars['muted-foreground'],
                bg: darkVars.muted,
                name: 'muted-foreground/muted',
            },
            {
                fg: darkVars['primary-foreground'],
                bg: darkVars.primary,
                name: 'primary-foreground/primary',
            },
            {
                fg: darkVars['accent-foreground'],
                bg: darkVars.accent,
                name: 'accent-foreground/accent',
            },
            {
                fg: darkVars['destructive-foreground'],
                bg: darkVars.destructive,
                name: 'destructive-foreground/destructive',
            },
            {
                fg: darkVars['success-foreground'],
                bg: darkVars.success,
                name: 'success-foreground/success',
            },
            {
                fg: darkVars['warning-foreground'],
                bg: darkVars.warning,
                name: 'warning-foreground/warning',
            },
        ];

        for (const pair of darkPairs) {
            const ratio = getContrastRatio(
                pair.fg ?? '#000',
                pair.bg ?? '#fff',
            );
            expect(
                ratio,
                `Dark mode pair "${pair.name}" ratio ${ratio.toFixed(2)} must be >= 4.5`,
            ).toBeGreaterThanOrEqual(4.5);
        }
    });

    it('satisfies WCAG AA graphical/UI threshold (>= 3.0:1) for interactive ring tokens', () => {
        const lightRingRatio = getContrastRatio(
            rootVars.ring ?? '#000',
            rootVars.background ?? '#fff',
        );
        expect(lightRingRatio).toBeGreaterThanOrEqual(3.0);

        const darkRingRatio = getContrastRatio(
            darkVars.ring ?? '#000',
            darkVars.background ?? '#000',
        );
        expect(darkRingRatio).toBeGreaterThanOrEqual(3.0);
    });
});
