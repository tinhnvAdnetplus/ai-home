import { describe, it, expect } from 'vitest';
import { cn } from './cn';

describe('shared/lib/cn', () => {
    it('merges single classes into a single string', () => {
        expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
    });

    it('ignores falsy values like undefined, null, false, empty strings', () => {
        expect(cn('btn', undefined, null, false, '', 'active')).toBe(
            'btn active',
        );
    });

    it('merges conflicting Tailwind utility classes correctly', () => {
        expect(cn('px-2 py-1', 'p-4')).toBe('p-4');
        expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
        expect(cn('bg-red-500', 'bg-green-500')).toBe('bg-green-500');
    });

    it('handles nested arrays and object conditionals', () => {
        expect(
            cn(['base', null, undefined], { active: true, disabled: false }),
        ).toBe('base active');
    });
});
