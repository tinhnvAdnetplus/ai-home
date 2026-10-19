import { type FixtureCase } from './types.js';
import {
    makeMinimalField,
    makeMinimalStep,
    makeMinimalWizard,
} from './helpers.js';

export const fieldTypeSingleChoiceCases: readonly FixtureCase[] = [
    {
        slug: 'field-select-valid',
        name: 'Valid Select Field',
        description: 'Select field with options, placeholder, and defaultValue',
        input: makeMinimalWizard([
            makeMinimalStep('step_sel', [
                makeMinimalField('field_sel', {
                    type: 'select',
                    options: [
                        { value: 'opt_tokyo', label: { ja: '東京都' } },
                        { value: 'opt_osaka', label: { ja: '大阪府' } },
                    ],
                    placeholder: { ja: '都道府県を選択' },
                    defaultValue: 'opt_tokyo',
                }),
            ]),
        ]),
        structural: 'valid',
    },
    {
        slug: 'field-select-invalid-option-label',
        name: 'Invalid Select Field Option Missing Label',
        description:
            'Each option within a select field must define a localized label',
        input: makeMinimalWizard([
            makeMinimalStep('step_sel_inv', [
                makeMinimalField('field_sel_inv', {
                    type: 'select',
                    options: [{ value: 'opt_no_label' }],
                }),
            ]),
        ]),
        structural: 'invalid',
    },
    {
        slug: 'field-radio-valid',
        name: 'Valid Radio Field',
        description: 'Radio field with options and defaultValue',
        input: makeMinimalWizard([
            makeMinimalStep('step_rad', [
                makeMinimalField('field_rad', {
                    type: 'radio',
                    options: [
                        { value: 'single_story', label: { ja: '平屋' } },
                        { value: 'two_story', label: { ja: '2階建て' } },
                    ],
                    defaultValue: 'two_story',
                }),
            ]),
        ]),
        structural: 'valid',
    },
    {
        slug: 'field-radio-invalid-option-value',
        name: 'Invalid Radio Field Option Missing Value',
        description: 'Each option within a radio field must define a key value',
        input: makeMinimalWizard([
            makeMinimalStep('step_rad_inv', [
                makeMinimalField('field_rad_inv', {
                    type: 'radio',
                    options: [{ label: { ja: '値のない選択肢' } }],
                }),
            ]),
        ]),
        structural: 'invalid',
    },
];
