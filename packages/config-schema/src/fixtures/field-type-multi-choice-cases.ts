import { type FixtureCase } from './types.js';
import {
    makeMinimalField,
    makeMinimalStep,
    makeMinimalWizard,
} from './helpers.js';

export const fieldTypeMultiChoiceCases: readonly FixtureCase[] = [
    {
        slug: 'field-checkbox-group-valid',
        name: 'Valid Checkbox Group Field',
        description:
            'Checkbox group with options, minSelected, maxSelected, and defaultValue',
        input: makeMinimalWizard([
            makeMinimalStep('step_chk', [
                makeMinimalField('field_chk', {
                    type: 'checkbox_group',
                    options: [
                        { value: 'solar', label: { ja: '太陽光発電' } },
                        { value: 'storage', label: { ja: '蓄電池' } },
                        { value: 'ev', label: { ja: 'EV充電' } },
                    ],
                    minSelected: 1,
                    maxSelected: 2,
                    defaultValue: ['solar', 'storage'],
                }),
            ]),
        ]),
        structural: 'valid',
    },
    {
        slug: 'field-checkbox-group-invalid-min-selected',
        name: 'Invalid Checkbox Group Negative minSelected',
        description: 'minSelected must be a non-negative integer >= 0',
        input: makeMinimalWizard([
            makeMinimalStep('step_chk_inv', [
                makeMinimalField('field_chk_inv', {
                    type: 'checkbox_group',
                    options: [{ value: 'opt_1', label: { ja: '選択肢1' } }],
                    minSelected: -1,
                }),
            ]),
        ]),
        structural: 'invalid',
    },
    {
        slug: 'field-image-select-valid',
        name: 'Valid Image Select Field',
        description:
            'Image select field with mediaRef images and multiple: false',
        input: makeMinimalWizard([
            makeMinimalStep('step_img', [
                makeMinimalField('field_img', {
                    type: 'image_select',
                    multiple: false,
                    options: [
                        {
                            value: 'modern',
                            label: { ja: 'モダン' },
                            image: {
                                mediaId: 'media_modern_01',
                                alt: { ja: 'モダンデザインの外観' },
                            },
                        },
                        {
                            value: 'japanese_modern',
                            label: { ja: '和モダン' },
                            image: {
                                mediaId: 'media_wa_01',
                                alt: { ja: '和モダン外観' },
                            },
                        },
                    ],
                    defaultValue: 'modern',
                }),
            ]),
        ]),
        structural: 'valid',
    },
    {
        slug: 'field-image-select-invalid-missing-image',
        name: 'Invalid Image Select Option Missing Image Property',
        description:
            'Each option in image_select must define an image mediaRef',
        input: makeMinimalWizard([
            makeMinimalStep('step_img_inv', [
                makeMinimalField('field_img_inv', {
                    type: 'image_select',
                    options: [
                        {
                            value: 'no_img_opt',
                            label: { ja: '画像なし選択肢' },
                        },
                    ],
                }),
            ]),
        ]),
        structural: 'invalid',
    },
];
