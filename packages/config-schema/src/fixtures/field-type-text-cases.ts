import { type FixtureCase } from './types.js';
import {
    makeMinimalField,
    makeMinimalStep,
    makeMinimalWizard,
} from './helpers.js';

export const fieldTypeTextCases: readonly FixtureCase[] = [
    {
        slug: 'field-text-valid',
        name: 'Valid Text Field',
        description: 'Text field with maxLength, placeholder, and defaultValue',
        input: makeMinimalWizard([
            makeMinimalStep('step_txt', [
                makeMinimalField('field_txt', {
                    type: 'text',
                    maxLength: 250,
                    placeholder: { ja: '山田 太郎' },
                    defaultValue: '鈴木',
                }),
            ]),
        ]),
        structural: 'valid',
    },
    {
        slug: 'field-text-invalid-max-length',
        name: 'Invalid Text Field Exceeding Max Length Limit',
        description: 'Text field with maxLength 501, exceeding max 500',
        input: makeMinimalWizard([
            makeMinimalStep('step_txt_inv', [
                makeMinimalField('field_txt_inv', {
                    type: 'text',
                    maxLength: 501,
                }),
            ]),
        ]),
        structural: 'invalid',
    },
    {
        slug: 'field-textarea-valid',
        name: 'Valid Textarea Field',
        description:
            'Textarea field with showCounter, placeholder, and maxLength 1500',
        input: makeMinimalWizard([
            makeMinimalStep('step_area', [
                makeMinimalField('field_area', {
                    type: 'textarea',
                    maxLength: 1500,
                    showCounter: true,
                    placeholder: { ja: 'ご要望をご記入ください' },
                    defaultValue: '明るいリビングを希望します。',
                }),
            ]),
        ]),
        structural: 'valid',
    },
    {
        slug: 'field-textarea-invalid-max-length',
        name: 'Invalid Textarea Field Exceeding Max Length Limit',
        description: 'Textarea field with maxLength 2001, exceeding max 2000',
        input: makeMinimalWizard([
            makeMinimalStep('step_area_inv', [
                makeMinimalField('field_area_inv', {
                    type: 'textarea',
                    maxLength: 2001,
                }),
            ]),
        ]),
        structural: 'invalid',
    },
    {
        slug: 'field-number-valid',
        name: 'Valid Number Field',
        description: 'Number field with min, max, step, unit, and allowedUnits',
        input: makeMinimalWizard([
            makeMinimalStep('step_num', [
                makeMinimalField('field_num', {
                    type: 'number',
                    min: 0,
                    max: 100,
                    step: 0.5,
                    unit: '坪',
                    allowedUnits: ['坪', '㎡'],
                    defaultValue: 35,
                }),
            ]),
        ]),
        structural: 'valid',
    },
    {
        slug: 'field-number-invalid-default-type',
        name: 'Invalid Number Field With String Default Value',
        description: 'Number field defaultValue must be a number, not a string',
        input: makeMinimalWizard([
            makeMinimalStep('step_num_inv', [
                makeMinimalField('field_num_inv', {
                    type: 'number',
                    defaultValue: '100',
                }),
            ]),
        ]),
        structural: 'invalid',
    },
    {
        slug: 'field-range-valid',
        name: 'Valid Range Slider Field',
        description:
            'Range field with required min, max, step, and defaultValue',
        input: makeMinimalWizard([
            makeMinimalStep('step_rng', [
                makeMinimalField('field_rng', {
                    type: 'range',
                    min: 1,
                    max: 10,
                    step: 1,
                    defaultValue: 5,
                    unit: '人',
                }),
            ]),
        ]),
        structural: 'valid',
    },
    {
        slug: 'field-range-invalid-missing-step',
        name: 'Invalid Range Field Missing Required Step',
        description:
            'Range slider field requires min, max, and step properties',
        input: makeMinimalWizard([
            makeMinimalStep('step_rng_inv', [
                makeMinimalField('field_rng_inv', {
                    type: 'range',
                    min: 1,
                    max: 10,
                }),
            ]),
        ]),
        structural: 'invalid',
    },
];
