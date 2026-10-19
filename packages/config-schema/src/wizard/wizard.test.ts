import { describe, expect, it } from 'vitest';
import { sampleWizard } from '../defaults/sample-wizard.js';
import { parseWizardConfig } from './validate.js';
import { serializeWizardConfig } from './serialize.js';
import { type WizardConfig } from './wizard-schema.js';
import { type Field } from './field-schemas.js';

function createValidBase(): WizardConfig {
    return structuredClone(sampleWizard);
}

describe('parseWizardConfig & sampleWizard', () => {
    it('validates sampleWizard successfully', () => {
        const res = parseWizardConfig(sampleWizard);
        expect(res.ok).toBe(true);
        if (res.ok) {
            expect(res.data.schemaVersion).toBe(1);
            expect(res.data.steps.length).toBe(2);
        }
    });

    it('round-trips through serialize and parse', () => {
        const serialized = serializeWizardConfig(sampleWizard);
        const deserialized: unknown = JSON.parse(serialized);
        const res = parseWizardConfig(deserialized);
        expect(res.ok).toBe(true);
        if (res.ok) {
            expect(res.data).toEqual(sampleWizard);
        }
    });

    it('serializes deterministically regardless of key insertion order', () => {
        const confA = structuredClone(sampleWizard);
        const confB = structuredClone(sampleWizard);
        const stepA = confA.steps[0];
        const stepB = confB.steps[0];
        if (stepA && stepB) {
            stepA.title = { ja: '敷地と建物', en: 'Site and Structure' };
            stepB.title = { en: 'Site and Structure', ja: '敷地と建物' };
        }
        expect(serializeWizardConfig(confA)).toBe(serializeWizardConfig(confB));
    });
});

describe('Issue code tests (minimal failing cases)', () => {
    it('reports SCHEMA_INVALID on schema violation', () => {
        const res = parseWizardConfig({ schemaVersion: 2, steps: [] });
        expect(res.ok).toBe(false);
        if (!res.ok) {
            expect(res.issues.some((i) => i.code === 'SCHEMA_INVALID')).toBe(
                true,
            );
        }
    });

    it('reports DUPLICATE_KEY for duplicate field keys across wizard', () => {
        const conf = createValidBase();
        const firstField = conf.steps[0]?.sections[0]?.fields[0];
        const targetSection = conf.steps[1]?.sections[0];
        if (firstField && targetSection) {
            targetSection.fields.push({
                type: 'text',
                key: firstField.key, // Duplicate field key
                label: { ja: '重複フィールド' },
                required: false,
            });
        }
        const res = parseWizardConfig(conf);
        expect(res.ok).toBe(false);
        if (!res.ok) {
            const issue = res.issues.find((i) => i.code === 'DUPLICATE_KEY');
            expect(issue).toBeDefined();
            expect(issue?.path).toContain('key');
        }
    });

    it('reports DUPLICATE_KEY for duplicate step keys', () => {
        const conf = createValidBase();
        const firstStep = conf.steps[0];
        const secondStep = conf.steps[1];
        if (firstStep && secondStep) {
            secondStep.key = firstStep.key;
        }
        const res = parseWizardConfig(conf);
        expect(res.ok).toBe(false);
        if (!res.ok) {
            const issue = res.issues.find((i) => i.code === 'DUPLICATE_KEY');
            expect(issue).toBeDefined();
            expect(issue?.path).toEqual(['steps', 1, 'key']);
        }
    });

    it('reports DUPLICATE_KEY for duplicate option keys within a field', () => {
        const conf = createValidBase();
        const selectField = conf.steps[0]?.sections[0]?.fields.find(
            (f): f is Extract<Field, { type: 'select' }> => f.type === 'select',
        );
        if (selectField) {
            selectField.options.push({
                value: selectField.options[0]?.value ?? 'owned',
                label: { ja: '重複選択肢' },
            });
        }
        const res = parseWizardConfig(conf);
        expect(res.ok).toBe(false);
        if (!res.ok) {
            const issue = res.issues.find((i) => i.code === 'DUPLICATE_KEY');
            expect(issue).toBeDefined();
            expect(issue?.path).toContain('options');
        }
    });

    it('reports UNKNOWN_FIELD_REF when condition references non-existent field', () => {
        const conf = createValidBase();
        const field = conf.steps[0]?.sections[0]?.fields[0];
        if (field) {
            field.visibleWhen = { var: 'non_existent_field_key' };
        }
        const res = parseWizardConfig(conf);
        expect(res.ok).toBe(false);
        if (!res.ok) {
            const issue = res.issues.find(
                (i) => i.code === 'UNKNOWN_FIELD_REF',
            );
            expect(issue).toBeDefined();
            expect(issue?.message).toContain('non_existent_field_key');
        }
    });

    it('reports SELF_REFERENCE when field visibleWhen references itself', () => {
        const conf = createValidBase();
        const field = conf.steps[0]?.sections[0]?.fields[0];
        if (field) {
            field.visibleWhen = { var: field.key };
        }
        const res = parseWizardConfig(conf);
        expect(res.ok).toBe(false);
        if (!res.ok) {
            const issue = res.issues.find((i) => i.code === 'SELF_REFERENCE');
            expect(issue).toBeDefined();
            expect(issue?.message).toContain(field?.key ?? '');
        }
    });

    it('reports CONDITION_CYCLE on cyclic dependencies', () => {
        const conf = createValidBase();
        const f1 = conf.steps[0]?.sections[0]?.fields[0];
        const f2 = conf.steps[0]?.sections[0]?.fields[1];
        if (f1 && f2) {
            f1.visibleWhen = { var: f2.key };
            f2.visibleWhen = { var: f1.key };
        }
        const res = parseWizardConfig(conf);
        expect(res.ok).toBe(false);
        if (!res.ok) {
            const issue = res.issues.find((i) => i.code === 'CONDITION_CYCLE');
            expect(issue).toBeDefined();
            expect(issue?.message).toContain('Cyclic condition');
        }
    });

    it('reports UNKNOWN_BINDING on unknown planner binding key', () => {
        const conf = createValidBase();
        const field = conf.steps[0]?.sections[0]?.fields[0];
        if (field) {
            field.binding = 'unknown.plannerCapability';
        }
        const res = parseWizardConfig(conf);
        expect(res.ok).toBe(false);
        if (!res.ok) {
            const issue = res.issues.find((i) => i.code === 'UNKNOWN_BINDING');
            expect(issue).toBeDefined();
            expect(issue?.path).toContain('binding');
        }
    });

    it('reports BINDING_TYPE_MISMATCH when field type does not match registry valueType', () => {
        const conf = createValidBase();
        const textField = conf.steps[0]?.sections[0]?.fields.find(
            (f) => f.type === 'text',
        );
        if (textField) {
            // site.frontage expects 'number', but textField is 'text'
            textField.binding = 'site.frontage';
        }
        const res = parseWizardConfig(conf);
        expect(res.ok).toBe(false);
        if (!res.ok) {
            const issue = res.issues.find(
                (i) => i.code === 'BINDING_TYPE_MISMATCH',
            );
            expect(issue).toBeDefined();
            expect(issue?.path).toContain('binding');
        }
    });

    it('reports DUPLICATE_BINDING when two fields use the same binding key', () => {
        const conf = createValidBase();
        const f1 = conf.steps[0]?.sections[0]?.fields[1]; // has site.frontage
        const f2 = conf.steps[0]?.sections[0]?.fields[2];
        if (f1 && f2) {
            f2.binding = f1.binding;
        }
        const res = parseWizardConfig(conf);
        expect(res.ok).toBe(false);
        if (!res.ok) {
            const issue = res.issues.find(
                (i) => i.code === 'DUPLICATE_BINDING',
            );
            expect(issue).toBeDefined();
            expect(issue?.path).toContain('binding');
        }
    });

    it('reports DEFAULT_NOT_IN_OPTIONS when select defaultValue is invalid', () => {
        const conf = createValidBase();
        const selectField = conf.steps[0]?.sections[0]?.fields.find(
            (f): f is Extract<Field, { type: 'select' }> => f.type === 'select',
        );
        if (selectField) {
            selectField.defaultValue = 'not_an_option_key';
        }
        const res = parseWizardConfig(conf);
        expect(res.ok).toBe(false);
        if (!res.ok) {
            const issue = res.issues.find(
                (i) => i.code === 'DEFAULT_NOT_IN_OPTIONS',
            );
            expect(issue).toBeDefined();
            expect(issue?.path).toContain('defaultValue');
        }
    });

    it('reports DEFAULT_OUT_OF_RANGE when numeric default is out of bounds', () => {
        const conf = createValidBase();
        const numField = conf.steps[0]?.sections[0]?.fields.find(
            (f): f is Extract<Field, { type: 'number' }> => f.type === 'number',
        );
        if (numField) {
            numField.min = 10;
            numField.max = 20;
            numField.defaultValue = 25; // > max
        }
        const res = parseWizardConfig(conf);
        expect(res.ok).toBe(false);
        if (!res.ok) {
            const issue = res.issues.find(
                (i) => i.code === 'DEFAULT_OUT_OF_RANGE',
            );
            expect(issue).toBeDefined();
            expect(issue?.path).toContain('defaultValue');
        }
    });

    it('reports RANGE_INVALID when min > max or step <= 0', () => {
        const conf = createValidBase();
        const rangeField = conf.steps[0]?.sections[0]?.fields.find(
            (f): f is Extract<Field, { type: 'range' }> => f.type === 'range',
        );
        if (rangeField) {
            rangeField.min = 50;
            rangeField.max = 20; // min > max
        }
        const res = parseWizardConfig(conf);
        expect(res.ok).toBe(false);
        if (!res.ok) {
            const issue = res.issues.find((i) => i.code === 'RANGE_INVALID');
            expect(issue).toBeDefined();
            expect(issue?.path).toContain('min');
        }
    });

    it('reports SELECTION_LIMITS_INVALID when minSelected > maxSelected', () => {
        const conf = createValidBase();
        const checkField = conf.steps[1]?.sections[0]?.fields.find(
            (f): f is Extract<Field, { type: 'checkbox_group' }> =>
                f.type === 'checkbox_group',
        );
        if (checkField) {
            checkField.minSelected = 3;
            checkField.maxSelected = 1;
        }
        const res = parseWizardConfig(conf);
        expect(res.ok).toBe(false);
        if (!res.ok) {
            const issue = res.issues.find(
                (i) => i.code === 'SELECTION_LIMITS_INVALID',
            );
            expect(issue).toBeDefined();
            expect(issue?.path).toContain('minSelected');
        }
    });

    it('reports EMPTY_OPTIONS when select field has 0 options', () => {
        const conf = createValidBase();
        const selectField = conf.steps[0]?.sections[0]?.fields.find(
            (f): f is Extract<Field, { type: 'select' }> => f.type === 'select',
        );
        if (selectField) {
            selectField.options = [];
            selectField.defaultValue = undefined;
        }
        const res = parseWizardConfig(conf);
        expect(res.ok).toBe(false);
        if (!res.ok) {
            const issue = res.issues.find((i) => i.code === 'EMPTY_OPTIONS');
            expect(issue).toBeDefined();
            expect(issue?.path).toContain('options');
        }
    });

    it('reports LIMIT_EXCEEDED when steps exceed 20', () => {
        const conf = createValidBase();
        const baseStep = conf.steps[0];
        if (baseStep) {
            for (let i = conf.steps.length; i < 21; i++) {
                conf.steps.push({
                    ...baseStep,
                    key: `step_${i.toString()}`,
                    sections: [],
                });
            }
        }
        const res = parseWizardConfig(conf);
        expect(res.ok).toBe(false);
        if (!res.ok) {
            const issue = res.issues.find((i) => i.code === 'LIMIT_EXCEEDED');
            expect(issue).toBeDefined();
            expect(issue?.path).toEqual(['steps']);
        }
    });

    it('reports multiple problems in a single invalid config', () => {
        const conf = createValidBase();
        const f1 = conf.steps[0]?.sections[0]?.fields[0];
        const f2 = conf.steps[0]?.sections[0]?.fields[1];
        if (f1 && f2) {
            f1.binding = 'nonexistent.binding'; // UNKNOWN_BINDING
            f2.visibleWhen = { var: 'nonexistent_var' }; // UNKNOWN_FIELD_REF
        }
        const res = parseWizardConfig(conf);
        expect(res.ok).toBe(false);
        if (!res.ok) {
            expect(res.issues.length).toBeGreaterThanOrEqual(2);
            expect(res.issues.some((i) => i.code === 'UNKNOWN_BINDING')).toBe(
                true,
            );
            expect(res.issues.some((i) => i.code === 'UNKNOWN_FIELD_REF')).toBe(
                true,
            );
        }
    });
});
