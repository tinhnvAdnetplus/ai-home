import {
    MAX_FIELDS_TOTAL,
    MAX_OPTIONS_PER_FIELD,
    MAX_SECTIONS_PER_STEP,
    MAX_STEPS,
} from '../wizard/types.js';

export const KEY_JSON_SCHEMA_PATTERN =
    '^(?!(?:constructor|prototype|__proto__|proto|hasownproperty|tostring|valueof|isprototypeof|propertyisenumerable|tolocalestring)$)[a-z][a-z0-9_]{0,47}(?![\\r\\n])$';
export const BINDING_KEY_JSON_SCHEMA_PATTERN =
    '^[a-z][a-zA-Z0-9]*(\\.[a-z][a-zA-Z0-9]*)*(?![\\r\\n])$';
export const MEDIA_ID_JSON_SCHEMA_PATTERN = '^[A-Za-z0-9_-]{1,64}(?![\\r\\n])$';
export const NON_WHITESPACE_PATTERN = '\\S';

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function patchConditionRefs(node: unknown): void {
    if (!isRecord(node) && !Array.isArray(node)) return;
    if (Array.isArray(node)) {
        for (const item of node) patchConditionRefs(item);
        return;
    }
    if (typeof node.$ref === 'string') {
        if (
            node.$ref.startsWith(
                '#/definitions/condition/anyOf/2/properties/and/items',
            )
        ) {
            node.$ref = '#/definitions/condition';
        }
    }
    for (const val of Object.values(node)) {
        patchConditionRefs(val);
    }
}

export function enforceStrictObjects(node: unknown): void {
    if (!isRecord(node) && !Array.isArray(node)) return;
    if (Array.isArray(node)) {
        for (const item of node) enforceStrictObjects(item);
        return;
    }
    if (
        (node.type === 'object' || node.properties !== undefined) &&
        node.additionalProperties === undefined
    ) {
        node.additionalProperties = false;
    }
    for (const val of Object.values(node)) {
        enforceStrictObjects(val);
    }
}

function patchFieldBranch(branch: Record<string, unknown>): void {
    if (!isRecord(branch.properties)) return;
    const props = branch.properties;
    if (isRecord(props.binding)) {
        props.binding = {
            type: 'string',
            pattern: BINDING_KEY_JSON_SCHEMA_PATTERN,
            maxLength: 64,
        };
    }
    if (isRecord(props.options) && props.options.type === 'array') {
        props.options.maxItems = MAX_OPTIONS_PER_FIELD;
    }
}

export function postProcessSchema(
    schema: Record<string, unknown>,
): Record<string, unknown> {
    schema.$id = 'https://aihome.jp/schemas/wizard.schema.json';
    schema.title = 'WizardConfig';
    schema['x-schemaVersion'] = 1;

    if (isRecord(schema.properties) && isRecord(schema.properties.steps)) {
        schema.properties.steps.maxItems = MAX_STEPS;
    }

    const defs = isRecord(schema.definitions) ? schema.definitions : {};

    if (isRecord(defs.step) && isRecord(defs.step.properties)) {
        const stepProps = defs.step.properties;
        if (isRecord(stepProps.sections)) {
            stepProps.sections.maxItems = MAX_SECTIONS_PER_STEP;
        }
    }

    if (isRecord(defs.section) && isRecord(defs.section.properties)) {
        const secProps = defs.section.properties;
        if (isRecord(secProps.fields)) {
            secProps.fields.maxItems = MAX_FIELDS_TOTAL;
        }
    }

    if (isRecord(defs.key)) {
        defs.key.pattern = KEY_JSON_SCHEMA_PATTERN;
        defs.key.maxLength = 48;
    }

    if (
        isRecord(defs.localizedText) &&
        isRecord(defs.localizedText.properties)
    ) {
        const locProps = defs.localizedText.properties;
        for (const lang of ['ja', 'en', 'vi']) {
            if (isRecord(locProps[lang])) {
                locProps[lang].pattern = NON_WHITESPACE_PATTERN;
                locProps[lang].minLength = 1;
                locProps[lang].maxLength = 500;
            }
        }
    }

    if (isRecord(defs.mediaRef) && isRecord(defs.mediaRef.properties)) {
        const mediaProps = defs.mediaRef.properties;
        if (isRecord(mediaProps.mediaId)) {
            mediaProps.mediaId.pattern = MEDIA_ID_JSON_SCHEMA_PATTERN;
            mediaProps.mediaId.maxLength = 64;
        }
    }

    if (isRecord(defs.field) && Array.isArray(defs.field.anyOf)) {
        for (const branch of defs.field.anyOf) {
            if (isRecord(branch)) patchFieldBranch(branch);
        }
    }

    patchConditionRefs(schema);
    enforceStrictObjects(schema);

    return schema;
}
