import { describe, expect, it } from 'vitest';
import { parseWizardConfig } from './validate.js';
import { type WizardConfig } from './wizard-schema.js';
import { type Field } from './field-schemas.js';
import { sampleWizard } from '../defaults/sample-wizard.js';

function buildMinimalConfig(
    stepsCount: number,
    fieldsPerStep: number,
): WizardConfig {
    const steps = [];
    for (let s = 0; s < stepsCount; s++) {
        const fields: Field[] = [];
        for (let f = 0; f < fieldsPerStep; f++) {
            fields.push({
                type: 'text',
                key: `field_s${s.toString()}_f${f.toString()}`,
                label: { ja: 'テキスト' },
                required: false,
            });
        }
        steps.push({
            key: `step_${s.toString()}`,
            title: { ja: 'ステップ' },
            sections: [
                {
                    key: `sec_${s.toString()}`,
                    title: { ja: 'セクション' },
                    fields,
                },
            ],
        });
    }
    return {
        schemaVersion: 1,
        steps,
    };
}

describe('Limits enforcement (boundary tests)', () => {
    it('accepts exactly 20 steps and rejects 21 steps', () => {
        const ok20 = buildMinimalConfig(20, 1);
        const res20 = parseWizardConfig(ok20);
        expect(res20.ok).toBe(true);

        const fail21 = buildMinimalConfig(21, 1);
        const res21 = parseWizardConfig(fail21);
        expect(res21.ok).toBe(false);
        if (!res21.ok) {
            expect(res21.issues.some((i) => i.code === 'LIMIT_EXCEEDED')).toBe(
                true,
            );
        }
    });

    it('accepts exactly 150 fields and rejects 151 fields', () => {
        // 1 step, 1 section, 150 fields
        const ok150 = buildMinimalConfig(1, 150);
        const res150 = parseWizardConfig(ok150);
        expect(res150.ok).toBe(true);

        const fail151 = buildMinimalConfig(1, 151);
        const res151 = parseWizardConfig(fail151);
        expect(res151.ok).toBe(false);
        if (!res151.ok) {
            expect(res151.issues.some((i) => i.code === 'LIMIT_EXCEEDED')).toBe(
                true,
            );
        }
    });

    it('accepts exactly 60 options on a field and rejects 61 options', () => {
        const createOptions = (count: number) => {
            const opts = [];
            for (let i = 0; i < count; i++) {
                opts.push({
                    value: `opt_${i.toString()}`,
                    label: { ja: `選択肢${i.toString()}` },
                });
            }
            return opts;
        };

        const configWithOpts = (count: number): WizardConfig => ({
            schemaVersion: 1,
            steps: [
                {
                    key: 'step_opts',
                    title: { ja: '選択肢テスト' },
                    sections: [
                        {
                            key: 'sec_opts',
                            title: { ja: 'セクション' },
                            fields: [
                                {
                                    type: 'select',
                                    key: 'select_field',
                                    label: { ja: 'セレクト' },
                                    required: false,
                                    options: createOptions(count),
                                },
                            ],
                        },
                    ],
                },
            ],
        });

        const ok60 = configWithOpts(60);
        expect(parseWizardConfig(ok60).ok).toBe(true);

        const fail61 = configWithOpts(61);
        const res61 = parseWizardConfig(fail61);
        expect(res61.ok).toBe(false);
        if (!res61.ok) {
            expect(res61.issues.some((i) => i.code === 'LIMIT_EXCEEDED')).toBe(
                true,
            );
        }
    });
});

describe('structural limit pre-check (denial-of-service guard)', () => {
    const base = (): Record<string, unknown> => {
        const parsed: unknown = JSON.parse(JSON.stringify(sampleWizard));
        if (
            typeof parsed !== 'object' ||
            parsed === null ||
            Array.isArray(parsed)
        ) {
            throw new Error('sample wizard must be an object');
        }
        return Object.fromEntries(Object.entries(parsed));
    };

    it('rejects 100,000 steps in well under a second with LIMIT_EXCEEDED at path steps', () => {
        const wizard = base();
        const firstStep: unknown = Array.isArray(wizard.steps)
            ? wizard.steps[0]
            : undefined;
        wizard.steps = Array.from({ length: 100_000 }, () => firstStep);
        const started = performance.now();
        const result = parseWizardConfig(wizard);
        const elapsed = performance.now() - started;

        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.issues).toHaveLength(1);
            expect(result.issues[0]?.code).toBe('LIMIT_EXCEEDED');
            expect(result.issues[0]?.path).toEqual(['steps']);
        }
        expect(elapsed).toBeLessThan(250);
    });

    it('rejects 100,000 sections, 200,000 fields and 100,000 options just as fast', () => {
        const bigSections = {
            schemaVersion: 1,
            steps: [
                {
                    key: 'a',
                    title: { ja: 'x' },
                    sections: Array.from({ length: 100_000 }, () => ({})),
                },
            ],
        };
        const bigFields = {
            schemaVersion: 1,
            steps: [
                {
                    key: 'a',
                    title: { ja: 'x' },
                    sections: [
                        {
                            key: 's',
                            title: { ja: 'x' },
                            fields: Array.from({ length: 200_000 }, () => ({})),
                        },
                    ],
                },
            ],
        };
        const bigOptions = {
            schemaVersion: 1,
            steps: [
                {
                    key: 'a',
                    title: { ja: 'x' },
                    sections: [
                        {
                            key: 's',
                            title: { ja: 'x' },
                            fields: [
                                {
                                    options: Array.from(
                                        { length: 100_000 },
                                        () => ({}),
                                    ),
                                },
                            ],
                        },
                    ],
                },
            ],
        };
        for (const input of [bigSections, bigFields, bigOptions]) {
            const started = performance.now();
            const result = parseWizardConfig(input);
            expect(performance.now() - started).toBeLessThan(250);
            expect(result.ok).toBe(false);
            if (!result.ok) {
                expect(result.issues[0]?.code).toBe('LIMIT_EXCEEDED');
            }
        }
    });

    it('does not throw on hostile shapes (getters that throw, non-arrays, holes)', () => {
        const hostile = { schemaVersion: 1 };
        Object.defineProperty(hostile, 'steps', {
            get: () => {
                throw new Error('boom');
            },
            enumerable: true,
        });
        expect(() => parseWizardConfig(hostile)).not.toThrow();
        expect(() => parseWizardConfig({ steps: 'nope' })).not.toThrow();
        expect(() =>
            parseWizardConfig({ steps: [null, 1, 'x', [], { sections: 5 }] }),
        ).not.toThrow();
        expect(() =>
            parseWizardConfig({ steps: new Array<unknown>(25) }),
        ).not.toThrow();
    });
});
