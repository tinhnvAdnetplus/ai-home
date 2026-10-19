import { describe, expect, it } from 'vitest';
import { resolveWizardState } from './wizard-state.js';
import { sampleWizard } from './defaults/sample-wizard.js';
import { type WizardConfig } from './wizard/wizard-schema.js';
import { type Field } from './wizard/field-schemas.js';

function isRecordObject(val: unknown): val is Record<string, unknown> {
    return typeof val === 'object' && val !== null;
}

function deepFreeze<T>(obj: T): Readonly<T> {
    if (!isRecordObject(obj)) {
        return obj;
    }
    const propNames = Object.getOwnPropertyNames(obj);
    for (const name of propNames) {
        const val: unknown = obj[name];
        if (typeof val === 'object' && val !== null) {
            deepFreeze(val);
        }
    }
    return Object.freeze(obj);
}

describe('Wizard State Resolution - Sample Wizard', () => {
    it('resolves visibility and drops answers for sampleWizard fields', () => {
        const initialAnswers = {
            has_solar: false,
            solar_notes: 'Stale solar note that should be dropped',
            desired_area: 40,
            floor_count: 'two_story',
        };
        const state = resolveWizardState(sampleWizard, initialAnswers);

        expect(state.visible.has_solar).toBe(true);
        expect(state.visible.solar_notes).toBe(false);
        expect(state.answers.has_solar).toBe(false);
        expect(state.answers.solar_notes).toBeUndefined();
        expect(state.answers.desired_area).toBe(40);
    });
});

describe('Wizard State Resolution - Cascading Fixpoint', () => {
    const cascadeWizard: WizardConfig = {
        schemaVersion: 1,
        steps: [
            {
                key: 'step1',
                title: { ja: 'ステップ1' },
                sections: [
                    {
                        key: 'sec1',
                        title: { ja: 'セクション1' },
                        fields: [
                            {
                                type: 'text',
                                key: 'a',
                                label: { ja: 'A' },
                                required: true,
                            },
                            {
                                type: 'text',
                                key: 'b',
                                label: { ja: 'B' },
                                required: true,
                                visibleWhen: { '==': [{ var: 'a' }, 'show_b'] },
                            },
                            {
                                type: 'text',
                                key: 'c',
                                label: { ja: 'C' },
                                required: true,
                                visibleWhen: { '==': [{ var: 'b' }, 'show_c'] },
                            },
                        ],
                    },
                ],
            },
        ],
    };

    it('cascades hiding A -> B -> C and prunes all answers to a fixpoint', () => {
        const answers = {
            a: 'hide_all',
            b: 'show_c',
            c: 'answer_c',
        };
        const state = resolveWizardState(cascadeWizard, answers);

        expect(state.visible.a).toBe(true);
        expect(state.visible.b).toBe(false);
        expect(state.visible.c).toBe(false);
        expect(state.answers).toEqual({ a: 'hide_all' });
        expect(state.missingRequired).toEqual([]);
    });

    it('keeps all visible when cascade condition holds', () => {
        const answers = {
            a: 'show_b',
            b: 'show_c',
            c: 'answer_c',
        };
        const state = resolveWizardState(cascadeWizard, answers);

        expect(state.visible.a).toBe(true);
        expect(state.visible.b).toBe(true);
        expect(state.visible.c).toBe(true);
        expect(state.answers).toEqual({
            a: 'show_b',
            b: 'show_c',
            c: 'answer_c',
        });
        expect(state.missingRequired).toEqual([]);
    });
});

describe('Wizard State Resolution - Hiraya (平屋) vs 2-Story Example', () => {
    const floorWizard: WizardConfig = {
        schemaVersion: 1,
        steps: [
            {
                key: 'step1',
                title: { ja: '階数と設備' },
                sections: [
                    {
                        key: 'sec1',
                        title: { ja: '階数' },
                        fields: [
                            {
                                type: 'radio',
                                key: 'floor_count',
                                label: { ja: '階数' },
                                required: true,
                                options: [
                                    {
                                        value: 'single_story',
                                        label: { ja: '平屋' },
                                    },
                                    {
                                        value: 'two_story',
                                        label: { ja: '2階建て' },
                                    },
                                ],
                            },
                            {
                                type: 'select',
                                key: 'second_floor_toilet',
                                label: { ja: '2階トイレ' },
                                required: false,
                                visibleWhen: {
                                    '==': [{ var: 'floor_count' }, 'two_story'],
                                },
                                options: [
                                    { value: 'none', label: { ja: 'なし' } },
                                    {
                                        value: 'washlet',
                                        label: { ja: '温水洗浄便座' },
                                    },
                                ],
                            },
                            {
                                type: 'select',
                                key: 'elevator',
                                label: { ja: 'ホームエレベーター' },
                                required: false,
                                options: [
                                    { value: 'none', label: { ja: 'なし' } },
                                    {
                                        value: 'yes',
                                        label: { ja: 'あり' },
                                        disabledWhen: {
                                            '==': [
                                                { var: 'floor_count' },
                                                'single_story',
                                            ],
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    };

    it('hides second floor toilet and disables elevator option when switching to single_story', () => {
        const answers = {
            floor_count: 'single_story',
            second_floor_toilet: 'washlet',
            elevator: 'yes',
        };
        const state = resolveWizardState(floorWizard, answers);

        expect(state.visible.second_floor_toilet).toBe(false);
        expect(state.disabledOptions.elevator).toEqual(['yes']);
        expect(state.answers.second_floor_toilet).toBeUndefined();
        expect(state.answers.elevator).toBeUndefined();
        expect(state.answers).toEqual({ floor_count: 'single_story' });
    });
});

describe('Wizard State Resolution - Disabled Options in Multi-Select', () => {
    const multiWizard: WizardConfig = {
        schemaVersion: 1,
        steps: [
            {
                key: 'step1',
                title: { ja: 'オプション' },
                sections: [
                    {
                        key: 'sec1',
                        title: { ja: '設備' },
                        fields: [
                            {
                                type: 'boolean',
                                key: 'has_solar',
                                label: { ja: '太陽光' },
                                required: false,
                            },
                            {
                                type: 'checkbox_group',
                                key: 'features',
                                label: { ja: '設備一覧' },
                                required: false,
                                options: [
                                    {
                                        value: 'pantry',
                                        label: { ja: 'パントリー' },
                                    },
                                    {
                                        value: 'battery',
                                        label: { ja: '蓄電池' },
                                        disabledWhen: {
                                            '==': [{ var: 'has_solar' }, false],
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    };

    it('removes disabled option from checkbox_group answer without dropping the whole field', () => {
        const answers = {
            has_solar: false,
            features: ['pantry', 'battery'],
        };
        const state = resolveWizardState(multiWizard, answers);

        expect(state.disabledOptions.features).toEqual(['battery']);
        expect(state.answers.features).toEqual(['pantry']);
    });
});

describe('Wizard State Resolution - Stale Unknown Keys', () => {
    it('drops any answer keys that do not exist in the wizard', () => {
        const answers = {
            has_solar: true,
            unknown_foo: 'bar',
            malicious_injection: '<script>',
        };
        const state = resolveWizardState(sampleWizard, answers);

        expect(state.answers.unknown_foo).toBeUndefined();
        expect(state.answers.malicious_injection).toBeUndefined();
        expect(state.answers.has_solar).toBe(true);
    });
});

describe('Wizard State Resolution - missingRequired per field type', () => {
    const requiredWizard: WizardConfig = {
        schemaVersion: 1,
        steps: [
            {
                key: 'step1',
                title: { ja: '必須テスト' },
                sections: [
                    {
                        key: 'sec1',
                        title: { ja: 'セクション' },
                        fields: [
                            {
                                type: 'text',
                                key: 'req_text',
                                label: { ja: 'T' },
                                required: true,
                            },
                            {
                                type: 'number',
                                key: 'req_num',
                                label: { ja: 'N' },
                                required: true,
                            },
                            {
                                type: 'boolean',
                                key: 'req_bool',
                                label: { ja: 'B' },
                                required: true,
                            },
                            {
                                type: 'checkbox_group',
                                key: 'req_cb',
                                label: { ja: 'CB' },
                                required: true,
                                options: [{ value: 'o1', label: { ja: 'O1' } }],
                            },
                            {
                                type: 'text',
                                key: 'hidden_req',
                                label: { ja: 'H' },
                                required: true,
                                visibleWhen: false,
                            },
                            {
                                type: 'text',
                                key: 'disabled_req',
                                label: { ja: 'D' },
                                required: true,
                                disabledWhen: true,
                            },
                        ],
                    },
                ],
            },
        ],
    };

    it('identifies missing required fields accurately', () => {
        const state = resolveWizardState(requiredWizard, {
            req_text: '   ',
            req_num: null,
            req_cb: [],
        });
        expect(state.missingRequired).toEqual([
            'req_text',
            'req_num',
            'req_bool',
            'req_cb',
        ]);
    });

    it('counts 0 and false as answered values for number and boolean', () => {
        const state = resolveWizardState(requiredWizard, {
            req_text: 'Filled',
            req_num: 0,
            req_bool: false,
            req_cb: ['o1'],
        });
        expect(state.missingRequired).toEqual([]);
    });
});

describe('Wizard State Resolution - Immutability, Idempotence, Order Independence, Performance', () => {
    it('never mutates input answers object', () => {
        const answers = {
            has_solar: false,
            solar_notes: 'Stale note',
            applicant_name: 'Yamada',
        };
        deepFreeze(answers);
        expect(() => resolveWizardState(sampleWizard, answers)).not.toThrow();
    });

    it('is idempotent: resolve(resolve(x).answers) equals resolve(x)', () => {
        const answers = {
            has_solar: false,
            solar_notes: 'stale',
            site_frontage: 15,
            desired_area: 30,
        };
        const first = resolveWizardState(sampleWizard, answers);
        const second = resolveWizardState(sampleWizard, first.answers);

        expect(second).toEqual(first);
    });

    it('is independent of field order', () => {
        const fieldsA: Field[] = [
            { type: 'text', key: 'f1', label: { ja: '1' }, required: false },
            {
                type: 'text',
                key: 'f2',
                label: { ja: '2' },
                required: false,
                visibleWhen: { '==': [{ var: 'f1' }, 'ok'] },
            },
            {
                type: 'text',
                key: 'f3',
                label: { ja: '3' },
                required: false,
                visibleWhen: { '==': [{ var: 'f2' }, 'ok'] },
            },
        ];
        const fieldsB: Field[] = [
            {
                type: 'text',
                key: 'f3',
                label: { ja: '3' },
                required: false,
                visibleWhen: { '==': [{ var: 'f2' }, 'ok'] },
            },
            {
                type: 'text',
                key: 'f2',
                label: { ja: '2' },
                required: false,
                visibleWhen: { '==': [{ var: 'f1' }, 'ok'] },
            },
            { type: 'text', key: 'f1', label: { ja: '1' }, required: false },
        ];

        const wizardA: WizardConfig = {
            schemaVersion: 1,
            steps: [
                {
                    key: 's1',
                    title: { ja: 'S' },
                    sections: [
                        { key: 'sec', title: { ja: 'Sec' }, fields: fieldsA },
                    ],
                },
            ],
        };
        const wizardB: WizardConfig = {
            schemaVersion: 1,
            steps: [
                {
                    key: 's1',
                    title: { ja: 'S' },
                    sections: [
                        { key: 'sec', title: { ja: 'Sec' }, fields: fieldsB },
                    ],
                },
            ],
        };

        const answers = { f1: 'not_ok', f2: 'ok', f3: 'ok' };
        const resA = resolveWizardState(wizardA, answers);
        const resB = resolveWizardState(wizardB, answers);

        expect(resA.visible).toEqual(resB.visible);
        expect(resA.answers).toEqual(resB.answers);
    });

    it('resolves 150 fields forming a dependency chain in < 1 s (a loose bound: it catches quadratic/exponential blow-ups, not micro-performance; the CI machine may be heavily loaded)', () => {
        const chainFields: Field[] = [
            {
                type: 'text',
                key: 'chain_0',
                label: { ja: '0' },
                required: false,
            },
        ];
        for (let i = 1; i < 150; i += 1) {
            chainFields.push({
                type: 'text',
                key: `chain_${i.toString()}`,
                label: { ja: i.toString() },
                required: false,
                visibleWhen: {
                    '==': [{ var: `chain_${(i - 1).toString()}` }, 'pass'],
                },
            });
        }

        const largeWizard: WizardConfig = {
            schemaVersion: 1,
            steps: [
                {
                    key: 'step1',
                    title: { ja: 'Large' },
                    sections: [
                        {
                            key: 'sec1',
                            title: { ja: 'Sec' },
                            fields: chainFields,
                        },
                    ],
                },
            ],
        };

        const initialAnswers: Record<string, unknown> = { chain_0: 'fail' };
        for (let i = 1; i < 150; i += 1) {
            initialAnswers[`chain_${i.toString()}`] = 'pass';
        }

        const start = performance.now();
        const state = resolveWizardState(largeWizard, initialAnswers);
        const elapsedMs = performance.now() - start;

        expect(elapsedMs).toBeLessThan(1000);
        expect(state.visible.chain_0).toBe(true);
        expect(state.visible.chain_1).toBe(false);
        expect(state.visible.chain_149).toBe(false);
        expect(state.answers).toEqual({ chain_0: 'fail' });
    });
});
