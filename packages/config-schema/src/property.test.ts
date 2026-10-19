import { describe, expect, it } from 'vitest';
import * as fc from 'fast-check';
import { parseWizardConfig } from './wizard/validate.js';
import { sampleWizard } from './defaults/sample-wizard.js';

function isRecord(val: unknown): val is Record<string, unknown> {
    return typeof val === 'object' && val !== null && !Array.isArray(val);
}

function deepFreeze<T>(val: T): T {
    if (val === null || typeof val !== 'object') {
        return val;
    }
    Object.freeze(val);
    if (Array.isArray(val)) {
        for (const item of val) {
            deepFreeze(item);
        }
    } else if (isRecord(val)) {
        for (const child of Object.values(val)) {
            deepFreeze(child);
        }
    }
    return val;
}

describe('Property-based tests with fast-check', () => {
    it('parseWizardConfig never throws and returns well-formed result for arbitrary JSON values', () => {
        fc.assert(
            fc.property(fc.jsonValue(), (jsonVal) => {
                deepFreeze(jsonVal);
                const res = parseWizardConfig(jsonVal);
                expect(typeof res.ok).toBe('boolean');
                if (res.ok) {
                    expect(res.data.schemaVersion).toBe(1);
                    expect(Array.isArray(res.data.steps)).toBe(true);
                } else {
                    expect(Array.isArray(res.issues)).toBe(true);
                    for (const issue of res.issues) {
                        expect(Array.isArray(issue.path)).toBe(true);
                        expect(typeof issue.code).toBe('string');
                        expect(typeof issue.message).toBe('string');
                    }
                }
            }),
            { numRuns: 100 },
        );
    });

    it('parseWizardConfig never throws and rejects or accepts arbitrary key strings', () => {
        fc.assert(
            fc.property(fc.string(), (keyStr) => {
                const conf = {
                    schemaVersion: 1,
                    steps: [
                        {
                            key: keyStr,
                            title: { ja: 'ステップ' },
                            sections: [],
                        },
                    ],
                };
                deepFreeze(conf);
                const res = parseWizardConfig(conf);
                expect(typeof res.ok).toBe('boolean');
            }),
            { numRuns: 100 },
        );
    });

    it('parseWizardConfig never throws and never mutates mutated copies of sampleWizard', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 0, max: 1 }),
                fc.string(),
                fc.jsonValue(),
                (stepIdx, fieldKey, mutationVal) => {
                    const cloned: unknown = structuredClone(sampleWizard);
                    if (isRecord(cloned) && Array.isArray(cloned.steps)) {
                        const targetStep: unknown = cloned.steps[stepIdx];
                        if (isRecord(targetStep)) {
                            targetStep.key = fieldKey;
                            targetStep.injected = mutationVal;
                        }
                    }
                    deepFreeze(cloned);
                    const res = parseWizardConfig(cloned);
                    expect(typeof res.ok).toBe('boolean');
                },
            ),
            { numRuns: 50 },
        );
    });

    it('never mutates frozen sampleWizard input', () => {
        const cloned = structuredClone(sampleWizard);
        const frozen = deepFreeze(cloned);
        const res = parseWizardConfig(frozen);
        expect(res.ok).toBe(true);
        expect(frozen).toEqual(sampleWizard);
    });
});
