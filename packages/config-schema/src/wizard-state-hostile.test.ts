import { describe, expect, it } from 'vitest';
import { sampleWizard } from './defaults/sample-wizard.js';
import { resolveWizardState } from './wizard-state.js';

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

const firstFieldKey: string =
    sampleWizard.steps[0]?.sections[0]?.fields[0]?.key ?? 'missing_key';

describe('resolveWizardState with hostile answers objects', () => {
    it('does not throw when an answer getter throws; the answer degrades to missing', () => {
        const answers: Record<string, unknown> = {};
        Object.defineProperty(answers, firstFieldKey, {
            get: () => {
                throw new Error('boom');
            },
            enumerable: true,
        });
        expect(() => resolveWizardState(sampleWizard, answers)).not.toThrow();
        const state = resolveWizardState(sampleWizard, answers);
        expect(state.answers[firstFieldKey] ?? null).toBeNull();
    });

    it('does not throw for a Proxy whose traps all throw, nor for Object.create(null)', () => {
        const hostile = new Proxy<Record<string, unknown>>(
            {},
            {
                get: () => {
                    throw new Error('get');
                },
                has: () => {
                    throw new Error('has');
                },
                ownKeys: () => {
                    throw new Error('ownKeys');
                },
                getOwnPropertyDescriptor: () => {
                    throw new Error('descriptor');
                },
            },
        );
        expect(() => resolveWizardState(sampleWizard, hostile)).not.toThrow();
        const created: unknown = Object.create(null);
        const bare: Record<string, unknown> = isRecord(created) ? created : {};
        expect(() => resolveWizardState(sampleWizard, bare)).not.toThrow();
    });

    it('costs the same for 200,000 unrelated answer keys as for none, and drops them all', () => {
        const many: Record<string, unknown> = {};
        for (let index = 0; index < 200_000; index += 1) {
            many[`unrelated_${index.toString()}`] = index;
        }
        const started = performance.now();
        const state = resolveWizardState(sampleWizard, many);
        expect(performance.now() - started).toBeLessThan(1000);
        expect(Object.keys(state.answers)).toHaveLength(0);
    });

    it('never mutates its input, even when the input is deep-frozen', () => {
        const answers: Record<string, unknown> = Object.freeze({
            [firstFieldKey]: 'x',
            extra: ['a'],
        });
        const before = JSON.stringify(answers);
        expect(() => resolveWizardState(sampleWizard, answers)).not.toThrow();
        expect(JSON.stringify(answers)).toBe(before);
    });
});
