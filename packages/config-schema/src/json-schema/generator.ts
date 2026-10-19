import { zodToJsonSchema } from 'zod-to-json-schema';
import {
    wizardSchema,
    stepSchema,
    sectionSchema,
} from '../wizard/wizard-schema.js';
import { fieldSchema } from '../wizard/field-schemas.js';
import {
    optionSchema,
    imageSelectOptionSchema,
} from '../wizard/option-schema.js';
import {
    conditionSchema,
    scalarLiteralSchema,
    varNodeSchema,
} from '../condition.js';
import {
    keySchema,
    localizedTextSchema,
    mediaRefSchema,
} from '../primitives.js';
import { postProcessSchema } from './post-process.js';
import { serializeDeterministic } from './deterministic.js';

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function buildWizardJsonSchema(): Record<string, unknown> {
    const raw = zodToJsonSchema(wizardSchema, {
        target: 'jsonSchema7',
        definitions: {
            scalarLiteral: scalarLiteralSchema,
            varNode: varNodeSchema,
            condition: conditionSchema,
            key: keySchema,
            localizedText: localizedTextSchema,
            mediaRef: mediaRefSchema,
            option: optionSchema,
            imageSelectOption: imageSelectOptionSchema,
            field: fieldSchema,
            section: sectionSchema,
            step: stepSchema,
        },
    });

    const cloned = structuredClone(raw);
    if (!isRecord(cloned)) {
        throw new Error('Expected object schema');
    }
    return postProcessSchema(cloned);
}

export function generateWizardJsonSchemaString(): string {
    const schema = buildWizardJsonSchema();
    return serializeDeterministic(schema);
}
