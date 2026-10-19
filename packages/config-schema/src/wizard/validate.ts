import { wizardSchema, type WizardConfig } from './wizard-schema.js';
import { type Issue } from './issue-codes.js';
import { crossValidateWizard } from './cross-validate.js';
import { precheckLimits } from './precheck-limits.js';

export type ParseWizardResult =
    | { readonly ok: true; readonly data: WizardConfig }
    | { readonly ok: false; readonly issues: readonly Issue[] };

export function parseWizardConfig(input: unknown): ParseWizardResult {
    try {
        const limitIssues = precheckLimits(input);
        if (limitIssues.length > 0) {
            return { ok: false, issues: limitIssues };
        }

        const zodResult = wizardSchema.safeParse(input);
        if (!zodResult.success) {
            const issues: Issue[] = zodResult.error.issues.map((err) => ({
                path: err.path,
                code: 'SCHEMA_INVALID',
                message: err.message,
            }));
            return { ok: false, issues };
        }

        const crossIssues = crossValidateWizard(zodResult.data);
        if (crossIssues.length > 0) {
            return { ok: false, issues: crossIssues };
        }

        return { ok: true, data: zodResult.data };
    } catch (err: unknown) {
        const message =
            err instanceof Error ? err.message : 'Unknown validation exception';
        return {
            ok: false,
            issues: [
                {
                    path: [],
                    code: 'SCHEMA_INVALID',
                    message,
                },
            ],
        };
    }
}
