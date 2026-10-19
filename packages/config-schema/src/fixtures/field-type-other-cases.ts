import { type FixtureCase } from './types.js';
import {
    makeMinimalField,
    makeMinimalStep,
    makeMinimalWizard,
} from './helpers.js';

export const fieldTypeOtherCases: readonly FixtureCase[] = [
    {
        slug: 'field-boolean-valid',
        name: 'Valid Boolean Field',
        description: 'Boolean switch field with boolean defaultValue',
        input: makeMinimalWizard([
            makeMinimalStep('step_bool', [
                makeMinimalField('field_bool', {
                    type: 'boolean',
                    defaultValue: true,
                }),
            ]),
        ]),
        structural: 'valid',
    },
    {
        slug: 'field-boolean-invalid-string-default',
        name: 'Invalid Boolean Field String defaultValue',
        description:
            'Boolean field defaultValue must be true or false, not a string',
        input: makeMinimalWizard([
            makeMinimalStep('step_bool_inv', [
                makeMinimalField('field_bool_inv', {
                    type: 'boolean',
                    defaultValue: 'true',
                }),
            ]),
        ]),
        structural: 'invalid',
    },
    {
        slug: 'field-upload-valid',
        name: 'Valid File Upload Field',
        description:
            'Upload field with valid accept MIME types, maxFiles, and maxSizeMb',
        input: makeMinimalWizard([
            makeMinimalStep('step_upl', [
                makeMinimalField('field_upl', {
                    type: 'upload',
                    accept: ['image/jpeg', 'image/png', 'application/pdf'],
                    maxFiles: 5,
                    maxSizeMb: 10,
                }),
            ]),
        ]),
        structural: 'valid',
    },
    {
        slug: 'field-upload-invalid-max-files',
        name: 'Invalid Upload Field Exceeding maxFiles Limit',
        description: 'Upload field maxFiles cannot exceed 10',
        input: makeMinimalWizard([
            makeMinimalStep('step_upl_inv', [
                makeMinimalField('field_upl_inv', {
                    type: 'upload',
                    accept: ['image/jpeg'],
                    maxFiles: 15,
                    maxSizeMb: 10,
                }),
            ]),
        ]),
        structural: 'invalid',
    },
];
