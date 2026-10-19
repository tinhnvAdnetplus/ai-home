import fs from 'node:fs';
import { resolveWizardState } from '../packages/config-schema/src/wizard-state.js';
import { sampleWizard } from '../packages/config-schema/src/defaults/sample-wizard.js';

const testCases = [
    {
        name: 'sampleWizard with solar notes to drop',
        wizard: sampleWizard,
        answers: {
            has_solar: false,
            solar_notes: 'Stale note that should be dropped',
            desired_area: 40,
            floor_count: 'two_story',
        },
    },
    {
        name: 'sampleWizard with all valid answers',
        wizard: sampleWizard,
        answers: {
            applicant_name: '山田 太郎',
            site_frontage: 12.5,
            desired_area: 35,
            land_ownership: 'owned',
            floor_count: 'two_story',
            has_solar: true,
            features: ['pantry', 'laundry'],
            exterior_style: 'modern',
            solar_notes: 'Specially noted',
        },
    },
    {
        name: 'sampleWizard with missing required fields',
        wizard: sampleWizard,
        answers: {
            applicant_name: 'Yamada',
            site_frontage: null,
            desired_area: 30,
        },
    },
    {
        name: 'sampleWizard with unknown keys',
        wizard: sampleWizard,
        answers: {
            has_solar: true,
            unknown_foo: 'bar',
            malicious_injection: '<script>',
        },
    },
    {
        name: 'Floor count single_story drops second_floor_toilet and disables elevator',
        wizard: {
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
                                        { value: 'single_story', label: { ja: '平屋' } },
                                        { value: 'two_story', label: { ja: '2階建て' } },
                                    ],
                                },
                                {
                                    type: 'select',
                                    key: 'second_floor_toilet',
                                    label: { ja: '2階トイレ' },
                                    required: false,
                                    visibleWhen: { '==': [{ var: 'floor_count' }, 'two_story'] },
                                    options: [
                                        { value: 'none', label: { ja: 'なし' } },
                                        { value: 'washlet', label: { ja: '温水洗浄便座' } },
                                    ],
                                },
                                {
                                    type: 'select',
                                    key: 'elevator',
                                    label: { ja: 'エレベーター' },
                                    required: false,
                                    options: [
                                        { value: 'none', label: { ja: 'なし' } },
                                        {
                                            value: 'yes',
                                            label: { ja: 'あり' },
                                            disabledWhen: { '==': [{ var: 'floor_count' }, 'single_story'] },
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        answers: {
            floor_count: 'single_story',
            second_floor_toilet: 'washlet',
            elevator: 'yes',
        },
    },
    {
        name: 'Checkbox group removes disabled option battery when has_solar is false',
        wizard: {
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
                                        { value: 'pantry', label: { ja: 'パントリー' } },
                                        {
                                            value: 'battery',
                                            label: { ja: '蓄電池' },
                                            disabledWhen: { '==': [{ var: 'has_solar' }, false] },
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        answers: {
            has_solar: false,
            features: ['pantry', 'battery'],
        },
    },
];

const results = testCases.map((tc) => {
    const state = resolveWizardState(tc.wizard, tc.answers);
    return {
        name: tc.name,
        wizard: tc.wizard,
        answers: tc.answers,
        expectedState: state,
    };
});

fs.writeFileSync('scripts/parity-cases.json', JSON.stringify(results, null, 2));
fs.writeFileSync('apps/api/scripts/parity-cases.json', JSON.stringify(results, null, 2));
console.log(`Generated ${results.length} TS parity test cases.`);
